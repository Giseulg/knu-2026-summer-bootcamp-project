import type { Category, LibraryView, MemoType, QuizKind, QuizResult, ReaderSettings } from './types'

export const CATEGORY_LABEL: Record<Category, string> = {
  major: '전공 자료',
  paper: '논문',
  novel: '소설',
  general: '일반 도서',
}

export const MEMO_TYPE_LABEL: Record<MemoType, string> = { memo: '메모', hypothesis: '질문·가설' }

export const QUIZ_KIND_LABEL: Record<QuizKind, string> = {
  recall: '사실 회상',
  relation: '관계 설명',
  application: '원리 적용',
}

export const QUIZ_RESULT_LABEL: Record<QuizResult, string> = {
  correct: '정답',
  partial: '부분 정답',
  wrong: '오답',
  forgot: '기억 안 남',
  skipped: '건너뜀',
}

/* ─ 설정 선택지 (리더 시트·4.3 설정 공용) ─ */
export const FONT_SIZES = [15, 17, 19, 21] as const
export const LINE_HEIGHTS = [1.6, 1.8, 2.0] as const
export const THEME_OPTIONS: Array<{ value: ReaderSettings['theme']; label: string }> = [
  { value: 'parchment', label: '양피지' },
  { value: 'light', label: '밝게' },
  { value: 'dark', label: '어둡게' },
]
export const LIBRARY_VIEW_LABEL: Record<LibraryView, string> = { list: '목록형', shelf: '책장형' }
