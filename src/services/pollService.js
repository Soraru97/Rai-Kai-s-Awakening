import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/app'
import { COLLECTIONS, SETTINGS_DOC } from '@/firebase/collections'

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getGlobalSettings() {
  const ref = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : {}
}

export async function updateGlobalSettings(data) {
  const ref = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC)
  // setDoc with merge creates the document if it doesn't exist yet,
  // or updates it if it does — avoids "not-found" errors on first write
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export function subscribeToSettings(callback) {
  const ref = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : {})
  })
}

// ─── Polls ────────────────────────────────────────────────────────────────────

export async function getActivePoll() {
  const settings = await getGlobalSettings()
  if (!settings.activePollId) return null
  return getPoll(settings.activePollId)
}

export async function getPoll(pollId) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getAllPolls() {
  const ref = collection(db, COLLECTIONS.POLLS)
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createPoll(data) {
  const ref = collection(db, COLLECTIONS.POLLS)
  const docRef = await addDoc(ref, {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePoll(pollId, data) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deletePoll(pollId) {
  // Delete all subcollections first
  const batch = writeBatch(db)

  // Stages
  const stagesSnap = await getDocs(collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES))
  stagesSnap.docs.forEach(d => batch.delete(d.ref))

  // Votes
  const votesSnap = await getDocs(collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.VOTES))
  votesSnap.docs.forEach(d => batch.delete(d.ref))

  // Results
  const resultsSnap = await getDocs(collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.RESULTS))
  resultsSnap.docs.forEach(d => batch.delete(d.ref))

  await batch.commit()

  // Delete poll itself
  await deleteDoc(doc(db, COLLECTIONS.POLLS, pollId))
}

export function subscribeToPoll(pollId, callback) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

// ─── Stages ───────────────────────────────────────────────────────────────────

export async function getStages(pollId) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES)
  const q = query(ref, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createStage(pollId, data) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES)
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateStage(pollId, stageId, data) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES, stageId)
  await updateDoc(ref, data)
}

export async function deleteStage(pollId, stageId) {
  const ref = doc(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES, stageId)
  await deleteDoc(ref)
}

export function subscribeToStages(pollId, callback) {
  const ref = collection(db, COLLECTIONS.POLLS, pollId, COLLECTIONS.STAGES)
  const q = query(ref, orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
