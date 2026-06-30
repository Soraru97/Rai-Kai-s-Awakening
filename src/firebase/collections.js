/**
 * Firestore collection names and schema documentation
 *
 * Schema:
 *
 * polls/{pollId}
 *   - title: string
 *   - description: string
 *   - startDate: Timestamp
 *   - endDate: Timestamp
 *   - isActive: boolean
 *   - createdAt: Timestamp
 *   - updatedAt: Timestamp
 *
 * polls/{pollId}/stages/{stageId}
 *   - title: string
 *   - description: string
 *   - order: number
 *   - maxChoices: number
 *   - showVoteCounts: boolean (whether voters see exact vote numbers on results, default true)
 *   - cards: Array<{ id, title, imageUrl, imagePosition: { x, y } }>
 *
 * polls/{pollId}/votes/{voteId}
 *   - browserId: string (hashed)
 *   - ipHash: string
 *   - country: string
 *   - city: string
 *   - region: string
 *   - createdAt: Timestamp
 *   - stages: { [stageId]: string[] }  (stageId -> chosen card ids)
 *
 * polls/{pollId}/results/{stageId}
 *   - stageId: string
 *   - stageTitle: string
 *   - stageOrder: number
 *   - showVoteCounts: boolean
 *   - totalVotes: number
 *   - cards: { [cardId]: { title, votes, imageUrl, imagePosition: { x, y } } }
 *   - updatedAt: Timestamp
 *
 * settings/global
 *   - activePollId: string
 *   - maintenanceMode: boolean
 */

export const COLLECTIONS = {
  POLLS: 'polls',
  STAGES: 'stages',
  VOTES: 'votes',
  RESULTS: 'results',
  SETTINGS: 'settings',
}

export const SETTINGS_DOC = 'global'
