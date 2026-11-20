import type { Book, BookContent, CreateBookInput, ID, ReadingLocation } from '@/domain/types'
import { http } from './client'

export const booksApi = {
  list: () => http<Book[]>('/books'),
  get: (id: ID) => http<Book>(`/books/${id}`),
  content: (id: ID) => http<BookContent>(`/books/${id}/content`),
  create: ({ title, category, file }: CreateBookInput) => {
    const form = new FormData()
    form.set('title', title)
    form.set('category', category)
    form.set('file', file)
    return http<Book>('/books', { method: 'POST', body: form })
  },
  remove: (id: ID) => http<void>(`/books/${id}`, { method: 'DELETE' }),
  /** 화면 위치 저장 (확정 아님) */
  saveCurrent: (id: ID, location: ReadingLocation) =>
    http<Book>(`/books/${id}/progress/current`, { method: 'PUT', body: location }),
  /** "여기까지 읽음" 확정 */
  confirmRead: (id: ID, location: ReadingLocation) =>
    http<Book>(`/books/${id}/progress/confirmed`, { method: 'PUT', body: location }),
}
