import { http, HttpResponse } from 'msw'
import type { QuizAnswerInput, QuizAttempt, QuizSession } from '@/domain/types'
import { isWithin } from '@/domain/location'
import { db, persist, uid } from '../data/db'
import { grade } from '../grading/grade'

const notFound = () => HttpResponse.json({ message: 'not found' }, { status: 404 })

export const quizHandlers = [
  http.post('/reading-fun-api/books/:id/quiz-sessions', async ({ params, request }) => {
    const book = db.books.find((b) => b.id === params.id)
    if (!book) return notFound()
    const { mode, count } = (await request.json()) as { mode: QuizSession['mode']; count?: number }
    // 확정 범위 이내 근거를 가진 문항만 출제
    const pool = db.questions.filter((q) => q.bookId === book.id && isWithin(q.evidence.location, book.progress.confirmed))
    const session: QuizSession = {
      id: uid('qs'),
      bookId: book.id,
      mode,
      questions: pool.slice(0, count ?? (mode === 'recall' ? 2 : 5)),
      attempts: [],
      confusedNodeIds: [],
      startedAt: new Date().toISOString(),
    }
    db.sessions.push(session)
    persist()
    return HttpResponse.json(session, { status: 201 })
  }),

  http.get('/reading-fun-api/quiz-sessions/:sid', ({ params }) => {
    const s = db.sessions.find((x) => x.id === params.sid)
    return s ? HttpResponse.json(s) : notFound()
  }),

  http.post('/reading-fun-api/quiz-sessions/:sid/attempts', async ({ params, request }) => {
    const s = db.sessions.find((x) => x.id === params.sid)
    if (!s) return notFound()
    const input = (await request.json()) as QuizAnswerInput
    const q = s.questions.find((x) => x.id === input.questionId)
    if (!q) return notFound()
    const attempt: QuizAttempt = input.giveUp
      ? { questionId: q.id, response: '', result: input.giveUp }
      : { questionId: q.id, response: input.response, ...grade(q, input.response) }
    s.attempts = [...s.attempts.filter((a) => a.questionId !== attempt.questionId), attempt]
    if (attempt.result === 'wrong' || attempt.result === 'forgot') {
      s.confusedNodeIds = [...new Set([...s.confusedNodeIds, ...q.relatedNodeIds])]
    }
    persist()
    return HttpResponse.json(s)
  }),

  http.post('/reading-fun-api/quiz-sessions/:sid/finish', ({ params }) => {
    const s = db.sessions.find((x) => x.id === params.sid)
    if (!s) return notFound()
    s.finishedAt = new Date().toISOString()
    persist()
    return HttpResponse.json(s)
  }),
]
