/**
 * 화면은 이 모듈만 import 함: `import { api } from '@/api'`
 * 백엔드 교체 시 각 어댑터 내부만 수정하고 반환 타입(domain/types)은 유지함.
 */
import { booksApi } from './books'
import { charactersApi } from './characters'
import { graphApi } from './graph'
import { memosApi } from './memos'
import { quizzesApi } from './quizzes'
import { usersApi } from './users'

export const api = {
  books: booksApi,
  graph: graphApi,
  memos: memosApi,
  quizzes: quizzesApi,
  characters: charactersApi,
  users: usersApi,
}

export { ApiError } from './client'
