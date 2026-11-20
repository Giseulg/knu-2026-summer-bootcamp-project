/**
 * 서버 상태 hooks. 화면은 이 hooks 또는 `api`만 사용함.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import type { Category, CreateBookInput, CreateMemoInput, HypothesisRevision, ID, MemoType, QuizAnswerInput, QuizSession, ReadingLocation, UserSettings, UserSettingsPatch } from '@/domain/types'
import { mergeSettings } from '@/domain/settings'

export const qk = {
  me: ['me'] as const,
  stats: ['me', 'stats'] as const,
  settings: ['me', 'settings'] as const,
  books: ['books'] as const,
  book: (id: ID) => ['books', id] as const,
  content: (id: ID) => ['books', id, 'content'] as const,
  graph: (id: ID) => ['books', id, 'graph'] as const,
  memos: (id: ID, type?: MemoType) => ['books', id, 'memos', type ?? 'all'] as const,
  memo: (id: ID, memoId: ID) => ['books', id, 'memos', 'detail', memoId] as const,
  dueReviews: (id: ID) => ['books', id, 'memos', 'due'] as const,
  myCharacters: ['me', 'characters'] as const,
  explore: ['explore'] as const,
  exploreDetail: (id: ID) => ['explore', id] as const,
}

/* user */
export const useMe = () => useQuery({ queryKey: qk.me, queryFn: api.users.me })
export const useStats = () => useQuery({ queryKey: qk.stats, queryFn: api.users.stats })
export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: api.users.settings })

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nickname, interests }: { nickname: string; interests: Category[] }) =>
      api.users.completeOnboarding(nickname, interests),
    onSuccess: (user) => qc.setQueryData(qk.me, user),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: UserSettingsPatch) => api.users.updateSettings(patch),
    onMutate: async (patch) => {
      const prev = qc.getQueryData<UserSettings>(qk.settings)
      if (prev) qc.setQueryData(qk.settings, mergeSettings(prev, patch))
      return { prev }
    },
    onError: (_e, _p, ctx) => ctx?.prev && qc.setQueryData(qk.settings, ctx.prev),
    onSuccess: (s) => qc.setQueryData(qk.settings, s),
  })
}

/* books */
export const useBooks = () => useQuery({ queryKey: qk.books, queryFn: api.books.list })
export const useBook = (id: ID) => useQuery({ queryKey: qk.book(id), queryFn: () => api.books.get(id) })
export const useBookContent = (id: ID) =>
  useQuery({ queryKey: qk.content(id), queryFn: () => api.books.content(id), staleTime: Infinity })

export function useCreateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBookInput) => api.books.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.books })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: ID) => api.books.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.books })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

export function useConfirmRead(bookId: ID) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (loc: ReadingLocation) => api.books.confirmRead(bookId, loc),
    onSuccess: (book) => {
      qc.setQueryData(qk.book(bookId), book)
      qc.invalidateQueries({ queryKey: qk.books })
      qc.invalidateQueries({ queryKey: qk.graph(bookId) })
      qc.invalidateQueries({ queryKey: ['books', bookId, 'memos'] })
    },
  })
}

/** 화면 위치 저장 (확정 아님). 캐시만 갱신하고 목록은 다시 받지 않음 */
export function useSaveCurrent(bookId: ID) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (loc: ReadingLocation) => api.books.saveCurrent(bookId, loc),
    onSuccess: (book) => qc.setQueryData(qk.book(bookId), book),
  })
}

/* graph */
export const useGraph = (bookId: ID) => useQuery({ queryKey: qk.graph(bookId), queryFn: () => api.graph.get(bookId) })

/* memos */
export const useMemos = (bookId: ID, type?: MemoType) =>
  useQuery({ queryKey: qk.memos(bookId, type), queryFn: () => api.memos.list(bookId, type) })
export const useMemoDetail = (bookId: ID, memoId: ID) =>
  useQuery({ queryKey: qk.memo(bookId, memoId), queryFn: () => api.memos.get(bookId, memoId) })

export function useCreateMemo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMemoInput) => api.memos.create(input),
    onSuccess: (m) => qc.invalidateQueries({ queryKey: ['books', m.bookId, 'memos'] }),
  })
}

export const useDueReviews = (bookId: ID, enabled = true) =>
  useQuery({ queryKey: qk.dueReviews(bookId), queryFn: () => api.memos.dueReviews(bookId), enabled })

export function useReviseMemo(bookId: ID) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memoId, revision }: { memoId: ID; revision: Omit<HypothesisRevision, 'createdAt'> }) =>
      api.memos.revise(bookId, memoId, revision),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books', bookId, 'memos'] }),
  })
}

/* quiz: 세션은 화면 상태로 관리하고 mutation 결과로 갱신 */
export const useStartQuiz = (bookId: ID) =>
  useMutation({ mutationFn: ({ mode, count }: { mode: QuizSession['mode']; count?: number }) => api.quizzes.start(bookId, mode, count) })

export function useAnswerQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, input }: { sessionId: ID; input: QuizAnswerInput }) => api.quizzes.answer(sessionId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.stats }),
  })
}

export function useFinishQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: ID) => api.quizzes.finish(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.stats }),
  })
}

/* characters */
export const useMyCharacters = () => useQuery({ queryKey: qk.myCharacters, queryFn: api.characters.mine })
export const useExplore = () => useQuery({ queryKey: qk.explore, queryFn: api.characters.explore })
export const useExploreDetail = (id: ID) =>
  useQuery({ queryKey: qk.exploreDetail(id), queryFn: () => api.characters.exploreDetail(id) })
