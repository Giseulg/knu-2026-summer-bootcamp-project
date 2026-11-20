import type { Character, ExploreCharacter, ID } from '@/domain/types'
import { http } from './client'

export const charactersApi = {
  mine: () => http<Character[]>('/me/characters'),
  setPublic: (id: ID, isPublic: boolean) =>
    http<Character>(`/me/characters/${id}`, { method: 'PATCH', body: { isPublic } }),
  saveVillage: (positions: Array<Pick<Character, 'id' | 'villagePosition'>>) =>
    http<Character[]>('/me/village', { method: 'PUT', body: positions }),
  explore: () => http<ExploreCharacter[]>('/explore/characters'),
  exploreDetail: (id: ID) => http<ExploreCharacter>(`/explore/characters/${id}`),
}
