import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  orderBy,
  runTransaction,
  increment,
} from 'firebase/firestore'
import { db } from '@/firebase/app'
import { COLLECTIONS } from '@/firebase/collections'
import { getBrowserId, getBrowserFingerprint, hashString, markPollAsVoted, hasPollBeenVoted } from '@/utils/identity'

/**
 * Check if the current browser has already voted in a poll
 * Checks both local storage and Firestore
 */
export async function hasVoted(pollId) {
  // Fast local check first
  if (hasPollBeenVoted(pollId)) return true

  // Verify against Firestore (in case localStorage was cleared)
  try {
    const fingerprint = await getBrowserFingerprint()
    const browserId = getBrowserId()
    const ipHash = await hashString(browserId + 'salt_v1')

    const votesRef = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.VOTES)
    const q = query(votesRef, where('browserId', '==', fingerprint))
    const snap = await getDocs(q)

    if (!snap.empty) {
      markPollAsVoted(pollId) // Sync back to localStorage
      return true
    }
    return false
  } catch {
    // If Firestore check fails, fall back to localStorage only
    return hasPollBeenVoted(pollId)
  }
}

/**
 * Submit a vote for a poll
 * @param {string} pollId
 * @param {Object} stageVotes - { [stageId]: string[] }
 * @param {Object} geoData - { country, region }
 */
export async function submitVote(pollId, stageVotes, geoData = {}) {
  const fingerprint = await getBrowserFingerprint()
  const browserId = getBrowserId()
  const ipHash = await hashString(browserId + 'salt_v1')

  // Check for an existing vote from this browser before starting the transaction.
  // This is a best-effort check (not airtight against race conditions), but
  // Firestore transactions can only read documents by direct reference via
  // transaction.get(), not arbitrary queries — so a query-based duplicate
  // check cannot live inside the transaction itself.
  const votesRef = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.VOTES)
  const dupQuery = query(votesRef, where('browserId', '==', fingerprint))
  const dupSnap = await getDocs(dupQuery)

  if (!dupSnap.empty) {
    throw new Error('ALREADY_VOTED')
  }

  const stageIds = Object.keys(stageVotes)
  const voteRef = doc(votesRef)

  // Run in a transaction to ensure the vote document and all results
  // counters are updated atomically together.
  await runTransaction(db, async (transaction) => {
    // ── All reads must happen first ──────────────────────────────────────
    const resultsRefs = stageIds.map(stageId =>
      doc(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.RESULTS, stageId)
    )
    const resultsSnaps = await Promise.all(
      resultsRefs.map(ref => transaction.get(ref))
    )

    // ── Then all writes ───────────────────────────────────────────────────
    transaction.set(voteRef, {
      browserId: fingerprint,
      ipHash,
      country: geoData.country || 'Unknown',
      region: geoData.region || '',
      city: geoData.city || '',
      stages: stageVotes,
      createdAt: serverTimestamp(),
    })

    stageIds.forEach((stageId, i) => {
      const resultsSnap = resultsSnaps[i]
      if (resultsSnap.exists()) {
        const updates = { totalVotes: increment(1), updatedAt: serverTimestamp() }
        for (const cardId of stageVotes[stageId]) {
          updates[`cards.${cardId}.votes`] = increment(1)
        }
        transaction.update(resultsRefs[i], updates)
      }
    })
  })

  markPollAsVoted(pollId)
}

/**
 * Get all votes for a poll
 */
export async function getVotes(pollId, limitCount = 500) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.VOTES)
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get results for all stages of a poll
 */
export async function getResults(pollId) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.RESULTS)
  const q = query(ref, orderBy('stageOrder', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Initialize results document for a stage (called when creating a stage)
 */
export async function initializeStageResults(pollId, stage) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.RESULTS, stage.id)

  // Preserve existing vote counts when a stage is re-saved (e.g. editing
  // a card's title or image shouldn't reset its accumulated votes to 0).
  const existingSnap = await getDoc(ref)
  const existingCards = existingSnap.exists() ? (existingSnap.data().cards || {}) : {}

  const cards = {}
  for (const card of stage.cards || []) {
    const existingVotes = existingCards[card.id]?.votes || 0
    cards[card.id] = {
      title: card.title,
      votes: existingVotes,
      imageUrl: card.imageUrl || '',
      imagePosition: card.imagePosition || { x: 50, y: 50 },
    }
  }

  await setDoc(ref, {
    stageId: stage.id,
    stageTitle: stage.title,
    stageOrder: stage.order,
    showVoteCounts: stage.showVoteCounts ?? true,
    totalVotes: existingSnap.exists() ? (existingSnap.data().totalVotes || 0) : 0,
    cards,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Subscribe to real-time results updates
 */
export function subscribeToResults(pollId, callback) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.RESULTS)
  const q = query(ref, orderBy('stageOrder', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Get vote statistics for admin panel
 */
export async function getVoteStats(pollId) {
  const votes = await getVotes(pollId)

  const countries = {}
  const cities = {}
  const timeline = {}

  for (const vote of votes) {
    // Country stats
    const country = vote.country || 'Unknown'
    countries[country] = (countries[country] || 0) + 1

    // City stats — combine city + country to disambiguate same-named cities
    // in different countries (e.g. "Paris, France" vs "Paris, USA")
    if (vote.city) {
      const cityLabel = vote.country && vote.country !== 'Unknown'
        ? `${vote.city}, ${vote.country}`
        : vote.city
      cities[cityLabel] = (cities[cityLabel] || 0) + 1
    }

    // Timeline stats (by day)
    if (vote.createdAt?.seconds) {
      const date = new Date(vote.createdAt.seconds * 1000)
      const day = date.toISOString().split('T')[0]
      timeline[day] = (timeline[day] || 0) + 1
    }
  }

  return {
    totalVotes: votes.length,
    countries,
    cities,
    timeline,
    votes,
  }
}
