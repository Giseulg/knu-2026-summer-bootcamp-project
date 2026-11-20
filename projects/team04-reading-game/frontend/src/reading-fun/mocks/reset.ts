import { useRainCollection } from '../../motion-reader/collection'
import { readSaved, STORAGE_KEY } from '../../motion-reader/story'
import { db } from './data/db'

export function exportMockData() {
  const { user, settings, books, memos, characters, sessions } = db
  const { discovery, slot } = useRainCollection.getState()
  let reading = readSaved(null)
  try { reading = readSaved(localStorage.getItem(STORAGE_KEY)) } catch { /* 저장소를 사용할 수 없는 브라우저 */ }
  const attempts = sessions.map(({ id, bookId, mode, startedAt, finishedAt, attempts }) => ({
    id, bookId, mode, startedAt, finishedAt, attempts: attempts.map(({ questionId, response, result }) => ({ questionId, response, result })),
  }))
  const payload = { version: 1, user, settings, books, memos, characters, attempts, reading, collection: { discovery, slot } }
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'reading-fun-data.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Mock DB 초기화. mock 모드에서만 의미 있음 */
export function resetMockDb() {
  try {
    localStorage.removeItem('rf-mock-db-v5')
    localStorage.removeItem(STORAGE_KEY)
    useRainCollection.persist.clearStorage()
  } catch {
    /* ignore */
  }
  location.reload()
}

