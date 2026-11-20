import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pages, type Passage, type SavedReading } from './story'

export const rainCharacter = { name: '빗길 수집가', sprite: 'person' }
export const rainSlots = [
  { x: 2, y: 3, label: '왼쪽 산책길' },
  { x: 7, y: 3, label: '오른쪽 산책길' },
  { x: 4, y: 5, label: '아래쪽 잔디밭' },
] as const

type Discovery = { clues: [Passage, Passage]; reflection: string }
type Collection = {
  discovery: Discovery | null
  slot: number | null
  discover: (reading: SavedReading, reflection: string) => boolean
  place: (slot: number | null) => void
}

export function eligibleClues(reading: SavedReading): [Passage, Passage] | null {
  const saved = reading.pocket
    .filter(({ page }) => page <= reading.page && reading.confirmed.includes(page))
    .sort((a, b) => a.page - b.page || a.paragraph - b.paragraph)
  const first = saved[0]
  const later = first && saved.find(({ page }) => pages[page].section > pages[first.page].section)
  return first && later ? [first, later] : null
}

export function motionLink(clue: Passage) {
  return `/library/rain?page=${clue.page + 1}&paragraph=${clue.paragraph + 1}`
}

export const useRainCollection = create<Collection>()(persist((set, get) => ({
  discovery: null,
  slot: null,
  discover(reading, reflection) {
    const clues = eligibleClues(reading)
    const text = reflection.trim().slice(0, 280)
    if (get().discovery || !clues || !text) return false
    set({ discovery: { clues, reflection: text } })
    return true
  },
  place(slot) {
    if (get().discovery && (slot === null || rainSlots[slot])) set({ slot })
  },
}), { name: 'spokeeper:rain-collection-v1' }))
