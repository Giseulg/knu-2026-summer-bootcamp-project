import { http, HttpResponse } from 'msw'
import type { Character } from '@/domain/types'
import { db, persist } from '../data/db'

export const characterHandlers = [
  http.get('/reading-fun-api/me/characters', () => HttpResponse.json(db.characters)),

  http.patch('/reading-fun-api/me/characters/:id', async ({ params, request }) => {
    const c = db.characters.find((x) => x.id === params.id)
    if (!c) return HttpResponse.json({ message: 'not found' }, { status: 404 })
    Object.assign(c, (await request.json()) as Partial<Character>)
    persist()
    return HttpResponse.json(c)
  }),

  http.put('/reading-fun-api/me/village', async ({ request }) => {
    const positions = (await request.json()) as Array<Pick<Character, 'id' | 'villagePosition'>>
    for (const p of positions) {
      const c = db.characters.find((x) => x.id === p.id)
      if (c) c.villagePosition = p.villagePosition
    }
    persist()
    return HttpResponse.json(db.characters)
  }),

  http.get('/reading-fun-api/explore/characters', () => {
    const interests = db.user.interests
    const list = db.explore.filter((c) => interests.length === 0 || interests.includes(c.category))
    return HttpResponse.json([...list].sort(() => Math.random() - 0.5))
  }),

  http.get('/reading-fun-api/explore/characters/:id', ({ params }) => {
    const c = db.explore.find((x) => x.id === params.id)
    return c ? HttpResponse.json(c) : HttpResponse.json({ message: 'not found' }, { status: 404 })
  }),
]
