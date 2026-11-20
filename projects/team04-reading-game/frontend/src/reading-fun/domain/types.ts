/**
 * 도메인 타입. 화면·hooks·api 어댑터가 공유하는 기준 모델.
 * 백엔드 응답 형태(DTO)가 달라져도 이 타입은 유지하고, 변환은 src/api 어댑터에서 처리함.
 */

export type ID = string
/** ISO 8601 문자열 */
export type ISODate = string

/* ───────── 공통 ───────── */

export type Category = 'major' | 'paper' | 'novel' | 'general'

/** 본문 위치. 챕터 index + 문단 index */
export interface ReadingLocation {
  chapter: number
  paragraph: number
}

/* ───────── User ───────── */

export interface User {
  id: ID
  nickname: string
  interests: Category[]
  onboarded: boolean
  createdAt: ISODate
}

export interface UserStats {
  bookCount: number
  memoCount: number
  quizCount: number
  characterCount: number
}

export interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: 'parchment' | 'light' | 'dark'
}

export interface LearningSettings {
  /** 재개 시 회상 질문 제안(2.5a) */
  recallPrompt: boolean
  recallCount: 1 | 2
}

export type LibraryView = 'list' | 'shelf'

export interface LibrarySettings {
  /** 서재 보기 방식: 목록형 / 책장형(2.0 목업) */
  view: LibraryView
}

export interface UserSettings {
  reader: ReaderSettings
  learning: LearningSettings
  library: LibrarySettings
}

/** PATCH 본문: 그룹 단위 부분 갱신 */
export type UserSettingsPatch = { [K in keyof UserSettings]?: Partial<UserSettings[K]> }

/* ───────── Book ───────── */

export type BookFileType = 'txt' | 'pdf'
export type BookStatus = 'processing' | 'ready' | 'failed'

export interface BookProgress {
  /** 마지막으로 보던 화면 위치 */
  current: ReadingLocation
  /** "여기까지 읽음"으로 확정한 범위의 끝. 스포 방지 기준 */
  confirmed: ReadingLocation
  /** 확정 범위 기준 진도 0~100 */
  percent: number
  lastReadAt?: ISODate
}

export interface Book {
  id: ID
  title: string
  author?: string
  category: Category
  fileType: BookFileType
  status: BookStatus
  /** 표지 대신 쓰는 책등 색 (토큰 이름) */
  coverColor: 'green' | 'amber' | 'berry' | 'wood'
  chapterCount: number
  progress: BookProgress
  createdAt: ISODate
}

export interface Chapter {
  title: string
  paragraphs: string[]
}

export interface BookContent {
  bookId: ID
  chapters: Chapter[]
}

export interface CreateBookInput {
  title: string
  category: Category
  file: File
}

/* ───────── Graph (관계도) ───────── */

export type GraphNodeKind = 'person' | 'concept'

export interface GraphNode {
  id: ID
  bookId: ID
  kind: GraphNodeKind
  name: string
  originalName?: string
  /** 인물: 나이·역할·행적 / 개념: 정의·부연·활용 사례 */
  attributes: Record<string, string>
  firstSeen: ReadingLocation
  sprite?: SpriteKey
}

export interface Quote {
  text: string
  location: ReadingLocation
}

export interface GraphEdge {
  id: ID
  bookId: ID
  source: ID
  target: ID
  relation: string
  quotes: Quote[]
  firstSeen: ReadingLocation
}

/** 확정 범위(confirmed) 이내만 담긴 그래프 */
export interface BookGraph {
  bookId: ID
  until: ReadingLocation
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/* ───────── Memo / Hypothesis ───────── */

export type MemoType = 'memo' | 'hypothesis'

export interface HypothesisRevision {
  content: string
  evidenceFor: Quote[]
  evidenceAgainst: Quote[]
  createdAt: ISODate
}

export interface Memo {
  id: ID
  bookId: ID
  type: MemoType
  content: string
  /** 선택한 문장 */
  quote: Quote
  createdAt: ISODate
  /** type === 'hypothesis' 일 때만 */
  hypothesis?: {
    evidence: string
    /** 확신도 1~5 */
    confidence: 1 | 2 | 3 | 4 | 5
    /** 관련 구간 위치. 확정 범위가 이 위치를 넘으면 재검토(2.5c) 대상 */
    reviewAt?: ReadingLocation
    reviewStatus: 'waiting' | 'due' | 'revised'
    /** 재검토 대상이 되었을 때 서버가 채우는 관련 근거 (확정 범위 이내) */
    reviewEvidence?: { for: Quote[]; against: Quote[] }
    revisions: HypothesisRevision[]
  }
}

export type CreateMemoInput = Pick<Memo, 'bookId' | 'type' | 'content' | 'quote'> & {
  hypothesis?: Pick<NonNullable<Memo['hypothesis']>, 'evidence' | 'confidence' | 'reviewAt'>
}

/* ───────── Quiz (이전 내용 점검) ───────── */

export type QuizKind = 'recall' | 'relation' | 'application'

export interface QuizQuestion {
  id: ID
  bookId: ID
  kind: QuizKind
  prompt: string
  answer: string
  evidence: Quote
  relatedNodeIds: ID[]
}

export type QuizResult = 'correct' | 'partial' | 'wrong' | 'forgot' | 'skipped'

export interface QuizAttempt {
  questionId: ID
  response: string
  result: QuizResult
  /** 채점 코멘트 (예: "핵심은 맞았지만 비용 측면이 빠짐") */
  feedback?: string
  /** 유사도 채점 상세. 기억 안 남/건너뛰기는 없음 */
  grading?: QuizGrading
}

/**
 * 정답 후보와의 유사도 채점 결과.
 * mock: 문자 n-gram 코사인 / 서버: 문장 임베딩 코사인 + 경계 구간 LLM 확인
 */
export interface QuizGrading {
  method: 'char-ngram' | 'embedding' | 'embedding+llm'
  /** 정답 후보들과의 유사도 최댓값 (0~1) */
  score: number
  /** score를 낸 정답 후보 */
  matchedCandidate: string
  /** 판정 기준선(correct·partial) 근처라 추가 확인이 필요한지 */
  needsReview: boolean
  thresholds: { correct: number; partial: number }
  /** needsReview 구간을 LLM 등이 다시 판정했는지 (서버 전용) */
  reviewed?: boolean
}

/** 답변 제출. giveUp 이 있으면 response 없이 기억 안 남/건너뛰기로 기록 */
export interface QuizAnswerInput {
  questionId: ID
  response: string
  giveUp?: 'forgot' | 'skipped'
}

export interface QuizSession {
  id: ID
  bookId: ID
  /** 'recall' = 재개 시 제안(2.5a), 'check' = 액션 시트 진입(2.7) */
  mode: 'recall' | 'check'
  questions: QuizQuestion[]
  attempts: QuizAttempt[]
  confusedNodeIds: ID[]
  startedAt: ISODate
  finishedAt?: ISODate
}

/* ───────── Character ───────── */

/** src/components/pixel/sprites.ts 의 스프라이트 이름 */
export type SpriteKey = string

export interface Character {
  id: ID
  name: string
  sprite: SpriteKey
  /** 출처 책 */
  bookId: ID
  bookTitle: string
  /** 관계도 노드에서 나온 캐릭터인 경우 */
  nodeId?: ID
  acquiredReason: string
  acquiredAt: ISODate
  isPublic: boolean
  ownerId: ID
  ownerNickname?: string
  /** Village 배치 좌표(타일 단위). 미배치면 undefined */
  villagePosition?: { x: number; y: number }
}

/** Explore 카드: 타 유저 공개 캐릭터 + 관련 콘텐츠 정보 */
export interface ExploreCharacter extends Character {
  category: Category
  contentSummary: string
  downloadable: boolean
}
