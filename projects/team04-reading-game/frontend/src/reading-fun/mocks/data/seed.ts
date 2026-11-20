/**
 * Mock 시드 데이터. 본문은 저작권 문제를 피하기 위해 직접 작성한 샘플임.
 * 순수이성비판(b_kant)은 원전(1781/1787, 퍼블릭 도메인)의 논지를 직접 요약한 한국어 문장이며 현대 번역본 문장을 옮기지 않음.
 * 대조용 영역본: J. M. D. Meiklejohn 역(1855), Project Gutenberg #4280 https://www.gutenberg.org/ebooks/4280
 */
import type {
  Book, BookContent, Character, ExploreCharacter, GraphEdge, GraphNode, Memo, QuizQuestion, User, UserSettings,
} from '@/domain/types'

const now = '2026-11-17T09:00:00.000Z'

export const seedUser: User = {
  id: 'u_me',
  nickname: '책벌레',
  interests: ['major', 'novel'],
  onboarded: false,
  createdAt: now,
}

export const seedSettings: UserSettings = {
  reader: { fontSize: 17, lineHeight: 1.8, theme: 'parchment' },
  learning: { recallPrompt: true, recallCount: 2 },
  library: { view: 'shelf' },
}

export const seedBooks: Book[] = [
  {
    id: 'b_os',
    title: '운영체제: CPU 스케줄링',
    author: '강의 노트',
    category: 'major',
    fileType: 'pdf',
    status: 'ready',
    coverColor: 'green',
    chapterCount: 3,
    progress: { current: { chapter: 1, paragraph: 2 }, confirmed: { chapter: 1, paragraph: 1 }, percent: 52, lastReadAt: '2026-11-10T13:00:00.000Z' },
    createdAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'b_lighthouse',
    title: '등대지기의 편지',
    author: '샘플 소설',
    category: 'novel',
    fileType: 'txt',
    status: 'ready',
    coverColor: 'berry',
    chapterCount: 2,
    progress: { current: { chapter: 0, paragraph: 3 }, confirmed: { chapter: 0, paragraph: 3 }, percent: 34, lastReadAt: '2026-11-14T22:00:00.000Z' },
    createdAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'b_kant',
    title: '순수이성비판',
    author: '임마누엘 칸트 (요약 샘플)',
    category: 'general',
    fileType: 'txt',
    status: 'ready',
    coverColor: 'wood',
    chapterCount: 4,
    progress: { current: { chapter: 2, paragraph: 3 }, confirmed: { chapter: 2, paragraph: 2 }, percent: 63, lastReadAt: '2026-11-16T21:30:00.000Z' },
    createdAt: '2026-11-12T09:00:00.000Z',
  },
  {
    id: 'b_attention',
    title: 'Attention 메커니즘 정리',
    category: 'paper',
    fileType: 'pdf',
    status: 'processing',
    coverColor: 'amber',
    chapterCount: 0,
    progress: { current: { chapter: 0, paragraph: 0 }, confirmed: { chapter: 0, paragraph: 0 }, percent: 0 },
    createdAt: '2026-11-16T09:00:00.000Z',
  },
]

export const seedContents: BookContent[] = [
  {
    bookId: 'b_os',
    chapters: [
      {
        title: '1. 스케줄링의 목적',
        paragraphs: [
          'CPU 스케줄러는 준비 큐(ready queue)에 있는 프로세스 중 다음에 CPU를 받을 프로세스를 고른다.',
          '평가 기준으로는 CPU 이용률, 처리량, 총처리 시간, 대기 시간, 응답 시간이 쓰인다.',
          '선점형 스케줄링은 실행 중인 프로세스에게서 CPU를 회수할 수 있고, 비선점형은 프로세스가 스스로 CPU를 내놓을 때까지 기다린다.',
        ],
      },
      {
        title: '2. 기본 알고리즘',
        paragraphs: [
          'FCFS(First-Come, First-Served)는 도착 순서대로 처리한다. 구현은 단순하지만 긴 작업 뒤에 짧은 작업이 줄 서면 평균 대기 시간이 길어지는 호위 효과(convoy effect)가 생긴다.',
          'SJF(Shortest Job First)는 다음 CPU 버스트가 가장 짧은 프로세스를 먼저 고른다. 평균 대기 시간은 최소가 되지만 버스트 길이를 미리 알 수 없어 지수 평균으로 예측한다.',
          '라운드 로빈(Round Robin)은 각 프로세스에 시간 할당량(time quantum)을 주고 이를 넘기면 준비 큐 끝으로 보낸다. 할당량이 너무 크면 FCFS와 같아지고, 너무 작으면 문맥 교환 비용이 커진다.',
          '우선순위 스케줄링은 우선순위가 높은 프로세스를 먼저 실행한다. 낮은 우선순위 프로세스가 계속 밀리는 기아(starvation)는 노화(aging)로 해결한다.',
        ],
      },
      {
        title: '3. 다단계 큐',
        paragraphs: [
          '다단계 큐는 프로세스를 성격별로 여러 큐에 나누고 큐마다 다른 알고리즘을 적용한다.',
          '다단계 피드백 큐는 프로세스가 큐 사이를 이동할 수 있게 하여, CPU를 오래 쓰는 프로세스는 낮은 큐로 내리고 오래 기다린 프로세스는 높은 큐로 올린다.',
        ],
      },
    ],
  },
  {
    bookId: 'b_lighthouse',
    chapters: [
      {
        title: '첫 번째 편지',
        paragraphs: [
          '해안 마을 끝에는 십 년째 불이 꺼지지 않는 등대가 있었다.',
          '등대지기 노윤은 매일 저녁 같은 시각에 계단 이백십 칸을 올랐다.',
          '어느 날 우편함에 발신인이 적히지 않은 편지가 한 통 들어 있었다. "당신이 켜는 불빛을 매일 보고 있습니다."',
          '노윤은 편지를 등잔 옆에 두고, 답장을 쓸 수 없다는 사실이 이상하게 마음에 걸렸다.',
          '마을 우체부 하람은 그 편지가 바다 건너 섬에서 왔다고 말했다.',
        ],
      },
      {
        title: '두 번째 편지',
        paragraphs: [
          '두 번째 편지는 폭풍이 지나간 다음 날 도착했다.',
          '"어젯밤 불빛이 세 번 깜빡였지요. 무슨 일이 있었나요?"',
          '노윤은 그날 밤 발전기가 멈췄던 일을 떠올렸다. 그것을 알 수 있는 사람은 등대를 계속 지켜본 사람뿐이었다.',
        ],
      },
    ],
  },
  {
    bookId: 'b_kant',
    chapters: [
      {
        title: '서론. 선험적 종합 판단',
        paragraphs: [
          '우리의 인식은 모두 경험과 함께 시작한다. 그러나 인식이 경험과 함께 시작한다고 해서 인식 전부가 경험에서 생겨나는 것은 아니다.',
          '분석 판단은 술어가 주어 개념 안에 이미 들어 있는 판단이고, 종합 판단은 주어 개념에 없던 것을 덧붙여 인식을 넓히는 판단이다. "모든 물체는 연장을 가진다"는 분석 판단, "모든 물체는 무게가 있다"는 종합 판단이다.',
          '경험과 무관하게 타당한 인식을 선험적(a priori) 인식, 경험에 근거한 인식을 후험적(a posteriori) 인식이라 한다. 선험적 인식의 표지는 필연성과 엄밀한 보편성이다.',
          '7+5=12 같은 수학 명제는 경험에 기대지 않으면서도 주어 개념에 없던 내용을 더한다. 곧 선험적 종합 판단이다. 이 책의 물음은 "선험적 종합 판단은 어떻게 가능한가"이다.',
          '칸트는 인식이 대상에 따라야 한다는 가정 대신, 대상이 우리의 인식 방식에 따라야 한다고 가정해 보자고 제안했다. 이 관점의 전환을 코페르니쿠스적 전회라 부른다.',
        ],
      },
      {
        title: '1. 초월적 감성론',
        paragraphs: [
          '감성은 대상에 의해 촉발되어 표상을 받아들이는 능력이다. 감성을 통해 대상이 직접 주어지는 방식을 직관이라 한다.',
          '공간은 외감의 형식이고 시간은 내감의 형식이다. 둘은 경험에서 끌어낸 개념이 아니라 모든 경험적 직관에 앞서 놓인 순수 직관이다. 기하학과 산수가 선험적 종합 판단일 수 있는 근거가 여기에 있다.',
          '그러므로 우리가 아는 것은 공간과 시간이라는 형식을 거쳐 우리에게 나타나는 현상뿐이다. 사물이 그 자체로 어떠한지, 곧 물자체는 인식할 수 없다.',
        ],
      },
      {
        title: '2. 초월적 분석론',
        paragraphs: [
          '지성은 직관으로 주어진 것을 개념으로 사고하는 능력이다. 내용 없는 사고는 공허하고, 개념 없는 직관은 맹목적이다. 인식은 감성과 지성이 함께 작동할 때만 성립한다.',
          '지성의 순수 개념인 범주는 판단의 형식에서 이끌어 낸다. 범주는 양·질·관계·양상의 네 묶음에 각각 셋씩, 모두 열두 개이다.',
          '인과성은 관계 범주에 속한다. 경험을 아무리 모아도 원인과 결과 사이의 필연적 연결은 나오지 않는다. 그러나 인과성 범주가 앞서 있기 때문에 사건들이 시간 속에서 질서 있는 경험으로 묶인다.',
          '범주가 경험 대상에 타당하다는 것을 보이는 논증이 초월적 연역이다. 그 중심에는 모든 표상에 "나는 생각한다"가 동반될 수 있어야 한다는 통각의 통일이 있다.',
        ],
      },
      {
        title: '3. 초월적 변증론',
        paragraphs: [
          '이성은 조건 지어진 것에서 출발해 조건의 계열을 끝까지 거슬러 올라가 무조건자를 찾으려 한다. 이때 경험의 한계를 넘어선 판단, 곧 초월적 가상이 생긴다.',
          '"세계는 시간상 시작이 있다"는 정립과 "세계는 시간상 시작이 없다"는 반정립이 둘 다 증명할 수 있는 것처럼 보인다. 이처럼 이성이 스스로 부딪치는 대립을 이율배반이라 한다.',
          '칸트는 이율배반이 현상을 물자체로 착각한 데서 생긴다고 보았다. 이성의 이념은 대상을 구성하는 원리가 아니라 탐구를 계속 이끄는 규제적 원리로만 써야 한다.',
        ],
      },
    ],
  },
]

export const seedNodes: GraphNode[] = [
  { id: 'n_sched', bookId: 'b_os', kind: 'concept', name: 'CPU 스케줄러', originalName: 'CPU Scheduler', attributes: { 정의: '준비 큐에서 다음에 CPU를 받을 프로세스를 고르는 OS 구성 요소' }, firstSeen: { chapter: 0, paragraph: 0 }, sprite: 'd_sched' },
  { id: 'n_ready', bookId: 'b_os', kind: 'concept', name: '준비 큐', originalName: 'Ready Queue', attributes: { 정의: 'CPU 할당을 기다리는 프로세스 목록' }, firstSeen: { chapter: 0, paragraph: 0 }, sprite: 'd_ready' },
  { id: 'n_preempt', bookId: 'b_os', kind: 'concept', name: '선점형 스케줄링', originalName: 'Preemptive', attributes: { 정의: '실행 중 프로세스의 CPU를 회수할 수 있는 방식' }, firstSeen: { chapter: 0, paragraph: 2 }, sprite: 'd_preempt' },
  { id: 'n_fcfs', bookId: 'b_os', kind: 'concept', name: 'FCFS', originalName: 'First-Come, First-Served', attributes: { 정의: '도착 순서대로 처리', 부연: '호위 효과 발생' }, firstSeen: { chapter: 1, paragraph: 0 }, sprite: 'd_fcfs' },
  { id: 'n_sjf', bookId: 'b_os', kind: 'concept', name: 'SJF', originalName: 'Shortest Job First', attributes: { 정의: '다음 CPU 버스트가 가장 짧은 프로세스 우선', 부연: '평균 대기 시간 최소' }, firstSeen: { chapter: 1, paragraph: 1 }, sprite: 'd_sjf' },
  { id: 'n_rr', bookId: 'b_os', kind: 'concept', name: '라운드 로빈', originalName: 'Round Robin', attributes: { 정의: '시간 할당량 단위로 순환' }, firstSeen: { chapter: 1, paragraph: 2 }, sprite: 'd_rr' },
  { id: 'n_nonpre', bookId: 'b_os', kind: 'concept', name: '비선점형 스케줄링', originalName: 'Non-preemptive', attributes: { 정의: '프로세스가 스스로 CPU를 내놓을 때까지 기다리는 방식' }, firstSeen: { chapter: 0, paragraph: 2 }, sprite: 'd_nonpre' },
  { id: 'n_criteria', bookId: 'b_os', kind: 'concept', name: '평가 기준', originalName: 'Scheduling Criteria', attributes: { 정의: 'CPU 이용률, 처리량, 총처리 시간, 대기 시간, 응답 시간', 부연: '목표에 따라 기준 간 우선순위가 다름' }, firstSeen: { chapter: 0, paragraph: 1 }, sprite: 'd_criteria' },
  { id: 'n_convoy', bookId: 'b_os', kind: 'concept', name: '호위 효과', originalName: 'Convoy Effect', attributes: { 정의: '긴 작업 뒤에 짧은 작업이 줄 서서 평균 대기 시간이 길어지는 현상', '활용 사례': 'FCFS의 대표적 약점으로 시험에 자주 나옴' }, firstSeen: { chapter: 1, paragraph: 0 }, sprite: 'd_convoy' },
  { id: 'n_burst', bookId: 'b_os', kind: 'concept', name: 'CPU 버스트', originalName: 'CPU Burst', attributes: { 정의: '프로세스가 CPU를 연속으로 사용하는 구간', 부연: '길이를 미리 알 수 없어 지수 평균으로 예측' }, firstSeen: { chapter: 1, paragraph: 1 }, sprite: 'd_burst' },
  { id: 'n_k_synth', bookId: 'b_kant', kind: 'concept', name: '선험적 종합 판단', originalName: 'synthetic a priori judgment', attributes: { 정의: '경험에 기대지 않으면서 주어 개념에 없던 내용을 더하는 판단', 부연: '예: 7+5=12. 책 전체의 물음이 이 판단의 가능성' }, firstSeen: { chapter: 0, paragraph: 3 }, sprite: 'd_synth' },
  { id: 'n_k_turn', bookId: 'b_kant', kind: 'concept', name: '코페르니쿠스적 전회', originalName: 'Copernican revolution', attributes: { 정의: '인식이 대상을 따르는 것이 아니라 대상이 인식 방식을 따른다고 보는 관점 전환' }, firstSeen: { chapter: 0, paragraph: 4 }, sprite: 'd_turn' },
  { id: 'n_k_sense', bookId: 'b_kant', kind: 'concept', name: '감성', originalName: 'Sinnlichkeit (sensibility)', attributes: { 정의: '대상에 촉발되어 표상을 받아들이는 능력', 부연: '형식은 공간(외감)과 시간(내감)' }, firstSeen: { chapter: 1, paragraph: 0 }, sprite: 'd_sense' },
  { id: 'n_k_thing', bookId: 'b_kant', kind: 'concept', name: '현상과 물자체', originalName: 'Erscheinung / Ding an sich', attributes: { 정의: '현상 = 공간·시간 형식을 거쳐 나타난 대상, 물자체 = 그 자체로서의 사물', 부연: '물자체는 인식할 수 없음' }, firstSeen: { chapter: 1, paragraph: 2 }, sprite: 'd_noumenon' },
  { id: 'n_k_understanding', bookId: 'b_kant', kind: 'concept', name: '지성', originalName: 'Verstand (understanding)', attributes: { 정의: '직관으로 주어진 것을 개념으로 사고하는 능력', 부연: '감성 위, 이성 아래에 놓인 인식 능력' }, firstSeen: { chapter: 2, paragraph: 0 }, sprite: 'd_faculty' },
  { id: 'n_k_category', bookId: 'b_kant', kind: 'concept', name: '범주', originalName: 'Kategorien', attributes: { 정의: '지성의 순수 개념', 부연: '양·질·관계·양상 4묶음 x 3 = 12개' }, firstSeen: { chapter: 2, paragraph: 1 }, sprite: 'd_categories' },
  { id: 'n_k_cause', bookId: 'b_kant', kind: 'concept', name: '인과성', originalName: 'Kausalität', attributes: { 정의: '관계 범주의 하나. 원인과 결과의 필연적 연결', '활용 사례': '경험에서 끌어낼 수 없지만 경험을 가능하게 하는 조건' }, firstSeen: { chapter: 2, paragraph: 2 }, sprite: 'd_causality' },
  { id: 'n_k_reason', bookId: 'b_kant', kind: 'concept', name: '이성', originalName: 'Vernunft (reason)', attributes: { 정의: '조건의 계열을 거슬러 무조건자를 찾는 능력', 부연: '경험의 한계를 넘을 때 초월적 가상이 생김' }, firstSeen: { chapter: 3, paragraph: 0 }, sprite: 'd_reason' },
  { id: 'n_k_antinomy', bookId: 'b_kant', kind: 'concept', name: '이율배반', originalName: 'Antinomie', attributes: { 정의: '정립과 반정립이 둘 다 증명 가능해 보이는 이성의 자기 대립', 부연: '예: 세계의 시간상 시작 유무' }, firstSeen: { chapter: 3, paragraph: 1 }, sprite: 'd_antinomy' },
  { id: 'n_noyun', bookId: 'b_lighthouse', kind: 'person', name: '노윤', attributes: { 역할: '등대지기', 행적: '매일 저녁 등대에 불을 켬' }, firstSeen: { chapter: 0, paragraph: 1 }, sprite: 'hatman' },
  { id: 'n_haram', bookId: 'b_lighthouse', kind: 'person', name: '하람', attributes: { 역할: '마을 우체부' }, firstSeen: { chapter: 0, paragraph: 4 }, sprite: 'person' },
]

export const seedEdges: GraphEdge[] = [
  { id: 'e1', bookId: 'b_os', source: 'n_sched', target: 'n_ready', relation: '선택 대상', quotes: [{ text: '준비 큐(ready queue)에 있는 프로세스 중 다음에 CPU를 받을 프로세스를 고른다.', location: { chapter: 0, paragraph: 0 } }], firstSeen: { chapter: 0, paragraph: 0 } },
  { id: 'e2', bookId: 'b_os', source: 'n_sched', target: 'n_preempt', relation: '방식', quotes: [{ text: '선점형 스케줄링은 실행 중인 프로세스에게서 CPU를 회수할 수 있고', location: { chapter: 0, paragraph: 2 } }], firstSeen: { chapter: 0, paragraph: 2 } },
  { id: 'e3', bookId: 'b_os', source: 'n_fcfs', target: 'n_sjf', relation: '대기 시간 비교', quotes: [{ text: '평균 대기 시간은 최소가 되지만', location: { chapter: 1, paragraph: 1 } }], firstSeen: { chapter: 1, paragraph: 1 } },
  { id: 'e4', bookId: 'b_os', source: 'n_rr', target: 'n_fcfs', relation: '할당량이 크면 동일', quotes: [{ text: '할당량이 너무 크면 FCFS와 같아지고', location: { chapter: 1, paragraph: 2 } }], firstSeen: { chapter: 1, paragraph: 2 } },
  { id: 'e6', bookId: 'b_os', source: 'n_preempt', target: 'n_nonpre', relation: '대비', quotes: [{ text: '선점형 스케줄링은 실행 중인 프로세스에게서 CPU를 회수할 수 있고, 비선점형은 프로세스가 스스로 CPU를 내놓을 때까지 기다린다.', location: { chapter: 0, paragraph: 2 } }], firstSeen: { chapter: 0, paragraph: 2 } },
  { id: 'e7', bookId: 'b_os', source: 'n_criteria', target: 'n_sched', relation: '평가', quotes: [{ text: '평가 기준으로는 CPU 이용률, 처리량, 총처리 시간, 대기 시간, 응답 시간이 쓰인다.', location: { chapter: 0, paragraph: 1 } }], firstSeen: { chapter: 0, paragraph: 1 } },
  { id: 'e8', bookId: 'b_os', source: 'n_fcfs', target: 'n_convoy', relation: '약점', quotes: [{ text: '긴 작업 뒤에 짧은 작업이 줄 서면 평균 대기 시간이 길어지는 호위 효과(convoy effect)가 생긴다.', location: { chapter: 1, paragraph: 0 } }], firstSeen: { chapter: 1, paragraph: 0 } },
  { id: 'e9', bookId: 'b_os', source: 'n_sjf', target: 'n_burst', relation: '예측 필요', quotes: [{ text: '버스트 길이를 미리 알 수 없어 지수 평균으로 예측한다.', location: { chapter: 1, paragraph: 1 } }], firstSeen: { chapter: 1, paragraph: 1 } },
  { id: 'e10', bookId: 'b_os', source: 'n_fcfs', target: 'n_nonpre', relation: '방식', quotes: [{ text: 'FCFS(First-Come, First-Served)는 도착 순서대로 처리한다.', location: { chapter: 1, paragraph: 0 } }], firstSeen: { chapter: 1, paragraph: 0 } },
  { id: 'ek1', bookId: 'b_kant', source: 'n_k_turn', target: 'n_k_synth', relation: '가능성 설명', quotes: [{ text: '대상이 우리의 인식 방식에 따라야 한다고 가정해 보자고 제안했다.', location: { chapter: 0, paragraph: 4 } }], firstSeen: { chapter: 0, paragraph: 4 } },
  { id: 'ek2', bookId: 'b_kant', source: 'n_k_sense', target: 'n_k_synth', relation: '수학의 근거', quotes: [{ text: '기하학과 산수가 선험적 종합 판단일 수 있는 근거가 여기에 있다.', location: { chapter: 1, paragraph: 1 } }], firstSeen: { chapter: 1, paragraph: 1 } },
  { id: 'ek3', bookId: 'b_kant', source: 'n_k_sense', target: 'n_k_thing', relation: '인식 범위 한정', quotes: [{ text: '우리가 아는 것은 공간과 시간이라는 형식을 거쳐 우리에게 나타나는 현상뿐이다.', location: { chapter: 1, paragraph: 2 } }], firstSeen: { chapter: 1, paragraph: 2 } },
  { id: 'ek4', bookId: 'b_kant', source: 'n_k_sense', target: 'n_k_understanding', relation: '협력', quotes: [{ text: '내용 없는 사고는 공허하고, 개념 없는 직관은 맹목적이다.', location: { chapter: 2, paragraph: 0 } }], firstSeen: { chapter: 2, paragraph: 0 } },
  { id: 'ek5', bookId: 'b_kant', source: 'n_k_understanding', target: 'n_k_category', relation: '순수 개념', quotes: [{ text: '지성의 순수 개념인 범주는 판단의 형식에서 이끌어 낸다.', location: { chapter: 2, paragraph: 1 } }], firstSeen: { chapter: 2, paragraph: 1 } },
  { id: 'ek6', bookId: 'b_kant', source: 'n_k_category', target: 'n_k_cause', relation: '관계 범주에 포함', quotes: [{ text: '인과성은 관계 범주에 속한다.', location: { chapter: 2, paragraph: 2 } }], firstSeen: { chapter: 2, paragraph: 2 } },
  { id: 'ek7', bookId: 'b_kant', source: 'n_k_reason', target: 'n_k_antinomy', relation: '스스로 부딪침', quotes: [{ text: '이처럼 이성이 스스로 부딪치는 대립을 이율배반이라 한다.', location: { chapter: 3, paragraph: 1 } }], firstSeen: { chapter: 3, paragraph: 1 } },
  { id: 'ek8', bookId: 'b_kant', source: 'n_k_antinomy', target: 'n_k_thing', relation: '원인: 현상·물자체 혼동', quotes: [{ text: '칸트는 이율배반이 현상을 물자체로 착각한 데서 생긴다고 보았다.', location: { chapter: 3, paragraph: 2 } }], firstSeen: { chapter: 3, paragraph: 2 } },
  { id: 'ek9', bookId: 'b_kant', source: 'n_k_understanding', target: 'n_k_reason', relation: '한계를 넘으면 가상', quotes: [{ text: '이때 경험의 한계를 넘어선 판단, 곧 초월적 가상이 생긴다.', location: { chapter: 3, paragraph: 0 } }], firstSeen: { chapter: 3, paragraph: 0 } },
  { id: 'e5', bookId: 'b_lighthouse', source: 'n_haram', target: 'n_noyun', relation: '편지 전달', quotes: [{ text: '마을 우체부 하람은 그 편지가 바다 건너 섬에서 왔다고 말했다.', location: { chapter: 0, paragraph: 4 } }], firstSeen: { chapter: 0, paragraph: 4 } },
]

export const seedMemos: Memo[] = [
  {
    id: 'm1', bookId: 'b_os', type: 'memo', content: '응답 시간과 총처리 시간 차이 시험에 자주 나옴',
    quote: { text: '평가 기준으로는 CPU 이용률, 처리량, 총처리 시간, 대기 시간, 응답 시간이 쓰인다.', location: { chapter: 0, paragraph: 1 } },
    createdAt: '2026-11-08T12:00:00.000Z',
  },
  {
    id: 'm2', bookId: 'b_os', type: 'hypothesis', content: 'SJF가 항상 라운드 로빈보다 좋을 것 같음',
    quote: { text: '평균 대기 시간은 최소가 되지만', location: { chapter: 1, paragraph: 1 } },
    createdAt: '2026-11-10T12:00:00.000Z',
    hypothesis: {
      evidence: '평균 대기 시간이 최소라고 함', confidence: 3, reviewAt: { chapter: 1, paragraph: 2 }, reviewStatus: 'waiting', revisions: [],
      reviewEvidence: {
        for: [{ text: 'SJF(Shortest Job First)는 다음 CPU 버스트가 가장 짧은 프로세스를 먼저 고른다. 평균 대기 시간은 최소가 되지만', location: { chapter: 1, paragraph: 1 } }],
        against: [{ text: '버스트 길이를 미리 알 수 없어 지수 평균으로 예측한다.', location: { chapter: 1, paragraph: 1 } }, { text: '라운드 로빈(Round Robin)은 각 프로세스에 시간 할당량(time quantum)을 주고 이를 넘기면 준비 큐 끝으로 보낸다.', location: { chapter: 1, paragraph: 2 } }],
      },
    },
  },
  {
    id: 'm3', bookId: 'b_lighthouse', type: 'hypothesis', content: '편지를 보낸 사람은 하람일 것 같음',
    quote: { text: '마을 우체부 하람은 그 편지가 바다 건너 섬에서 왔다고 말했다.', location: { chapter: 0, paragraph: 4 } },
    createdAt: '2026-11-14T22:10:00.000Z',
    hypothesis: { evidence: '편지 출처를 혼자 알고 있음', confidence: 2, reviewAt: { chapter: 1, paragraph: 2 }, reviewStatus: 'waiting', revisions: [] },
  },
  {
    id: 'm4', bookId: 'b_kant', type: 'memo', content: '분석 판단 = 설명만 함, 종합 판단 = 인식을 넓힘. 예문 두 개로 구분',
    quote: { text: '"모든 물체는 연장을 가진다"는 분석 판단, "모든 물체는 무게가 있다"는 종합 판단이다.', location: { chapter: 0, paragraph: 1 } },
    createdAt: '2026-11-13T21:00:00.000Z',
  },
  {
    id: 'm5', bookId: 'b_kant', type: 'hypothesis', content: '물자체를 알 수 없다면 이성의 이념도 전부 쓸모없는 것 같음',
    quote: { text: '사물이 그 자체로 어떠한지, 곧 물자체는 인식할 수 없다.', location: { chapter: 1, paragraph: 2 } },
    createdAt: '2026-11-15T21:00:00.000Z',
    hypothesis: {
      evidence: '인식할 수 없는 것에 대한 개념이라서', confidence: 2, reviewAt: { chapter: 3, paragraph: 2 }, reviewStatus: 'waiting', revisions: [],
      reviewEvidence: {
        for: [{ text: '이때 경험의 한계를 넘어선 판단, 곧 초월적 가상이 생긴다.', location: { chapter: 3, paragraph: 0 } }],
        against: [{ text: '이성의 이념은 대상을 구성하는 원리가 아니라 탐구를 계속 이끄는 규제적 원리로만 써야 한다.', location: { chapter: 3, paragraph: 2 } }],
      },
    },
  },
]

export const seedQuestions: QuizQuestion[] = [
  { id: 'q1', bookId: 'b_os', kind: 'recall', prompt: '선점형과 비선점형 스케줄링의 차이는?', answer: '선점형은 실행 중 프로세스의 CPU를 회수할 수 있고, 비선점형은 프로세스가 스스로 내놓을 때까지 기다림', evidence: { text: '선점형 스케줄링은 실행 중인 프로세스에게서 CPU를 회수할 수 있고, 비선점형은 프로세스가 스스로 CPU를 내놓을 때까지 기다린다.', location: { chapter: 0, paragraph: 2 } }, relatedNodeIds: ['n_preempt'] },
  { id: 'q2', bookId: 'b_os', kind: 'relation', prompt: 'CPU 스케줄러와 준비 큐는 어떤 관계인가?', answer: '스케줄러는 준비 큐에 있는 프로세스 중 다음 실행 프로세스를 고름', evidence: { text: '준비 큐(ready queue)에 있는 프로세스 중 다음에 CPU를 받을 프로세스를 고른다.', location: { chapter: 0, paragraph: 0 } }, relatedNodeIds: ['n_sched', 'n_ready'] },
  { id: 'q4', bookId: 'b_os', kind: 'application', prompt: '긴 작업 하나 뒤에 짧은 작업 여러 개가 도착했다. FCFS로 처리하면 어떤 문제가 생길까?', answer: '짧은 작업들이 긴 작업이 끝날 때까지 기다려 평균 대기 시간이 길어지는 호위 효과가 생김', evidence: { text: '긴 작업 뒤에 짧은 작업이 줄 서면 평균 대기 시간이 길어지는 호위 효과(convoy effect)가 생긴다.', location: { chapter: 1, paragraph: 0 } }, relatedNodeIds: ['n_fcfs'] },
  { id: 'q5', bookId: 'b_os', kind: 'relation', prompt: 'FCFS와 SJF를 평균 대기 시간 기준으로 비교해 보세요.', answer: 'SJF는 짧은 작업을 먼저 처리해 평균 대기 시간이 최소이고 FCFS는 호위 효과로 길어질 수 있음', evidence: { text: 'SJF(Shortest Job First)는 다음 CPU 버스트가 가장 짧은 프로세스를 먼저 고른다. 평균 대기 시간은 최소가 되지만', location: { chapter: 1, paragraph: 1 } }, relatedNodeIds: ['n_fcfs', 'n_sjf'] },
  { id: 'qk1', bookId: 'b_kant', kind: 'recall', prompt: '분석 판단과 종합 판단의 차이는?', answer: '분석 판단은 술어가 주어 개념 안에 이미 들어 있고, 종합 판단은 주어 개념에 없던 내용을 덧붙여 인식을 넓힘', evidence: { text: '분석 판단은 술어가 주어 개념 안에 이미 들어 있는 판단이고, 종합 판단은 주어 개념에 없던 것을 덧붙여 인식을 넓히는 판단이다.', location: { chapter: 0, paragraph: 1 } }, relatedNodeIds: ['n_k_synth'] },
  { id: 'qk2', bookId: 'b_kant', kind: 'recall', prompt: '칸트에게 공간과 시간은 무엇인가?', answer: '경험에서 얻은 개념이 아니라 감성의 순수 직관 형식으로, 공간은 외감, 시간은 내감의 형식임', evidence: { text: '공간은 외감의 형식이고 시간은 내감의 형식이다. 둘은 경험에서 끌어낸 개념이 아니라 모든 경험적 직관에 앞서 놓인 순수 직관이다.', location: { chapter: 1, paragraph: 1 } }, relatedNodeIds: ['n_k_sense'] },
  { id: 'qk3', bookId: 'b_kant', kind: 'relation', prompt: '감성과 지성은 인식에서 어떤 관계인가?', answer: '감성은 직관으로 대상을 받아들이고 지성은 그것을 개념으로 사고하며, 둘이 함께 작동해야 인식이 성립함', evidence: { text: '내용 없는 사고는 공허하고, 개념 없는 직관은 맹목적이다. 인식은 감성과 지성이 함께 작동할 때만 성립한다.', location: { chapter: 2, paragraph: 0 } }, relatedNodeIds: ['n_k_sense', 'n_k_understanding'] },
  { id: 'qk4', bookId: 'b_kant', kind: 'application', prompt: '"모든 사건에는 원인이 있다"는 경험을 아무리 모아도 증명되지 않는다. 칸트라면 이 원칙의 타당성을 어디서 찾을까?', answer: '지성의 범주인 인과성이 경험보다 앞서 있어 경험을 가능하게 하는 조건이므로 선험적으로 타당함', evidence: { text: '경험을 아무리 모아도 원인과 결과 사이의 필연적 연결은 나오지 않는다. 그러나 인과성 범주가 앞서 있기 때문에 사건들이 시간 속에서 질서 있는 경험으로 묶인다.', location: { chapter: 2, paragraph: 2 } }, relatedNodeIds: ['n_k_category', 'n_k_cause'] },
  { id: 'qk5', bookId: 'b_kant', kind: 'relation', prompt: '이율배반은 왜 생긴다고 보았나?', answer: '이성이 경험의 한계를 넘어 무조건자를 찾으면서 현상을 물자체로 착각하기 때문', evidence: { text: '칸트는 이율배반이 현상을 물자체로 착각한 데서 생긴다고 보았다.', location: { chapter: 3, paragraph: 2 } }, relatedNodeIds: ['n_k_antinomy', 'n_k_thing'] },
  { id: 'q3', bookId: 'b_lighthouse', kind: 'recall', prompt: '편지는 어디에서 왔다고 했나?', answer: '바다 건너 섬', evidence: { text: '마을 우체부 하람은 그 편지가 바다 건너 섬에서 왔다고 말했다.', location: { chapter: 0, paragraph: 4 } }, relatedNodeIds: ['n_haram'] },
]

export const seedCharacters: Character[] = [
  { id: 'c1', name: '스케줄러 디스패처', sprite: 'd_sched', bookId: 'b_os', bookTitle: '운영체제: CPU 스케줄링', nodeId: 'n_sched', acquiredReason: '점검 2회 연속 정답', acquiredAt: '2026-11-09T12:00:00.000Z', isPublic: true, ownerId: 'u_me', villagePosition: { x: 3, y: 2 } },
  { id: 'c2', name: 'FCFS 지그재그', sprite: 'd_fcfs', bookId: 'b_os', bookTitle: '운영체제: CPU 스케줄링', nodeId: 'n_fcfs', acquiredReason: '관계도 탐색 5회', acquiredAt: '2026-11-11T12:00:00.000Z', isPublic: false, ownerId: 'u_me', villagePosition: { x: 6, y: 4 } },
  { id: 'c3', name: '등대지기 노윤', sprite: 'hatman', bookId: 'b_lighthouse', bookTitle: '등대지기의 편지', nodeId: 'n_noyun', acquiredReason: '가설 1회 재검토', acquiredAt: '2026-11-15T12:00:00.000Z', isPublic: true, ownerId: 'u_me' },
  { id: 'c4', name: '범주표 12칸', sprite: 'd_categories', bookId: 'b_kant', bookTitle: '순수이성비판', nodeId: 'n_k_category', acquiredReason: '점검 2회 연속 정답', acquiredAt: '2026-11-16T21:40:00.000Z', isPublic: true, ownerId: 'u_me', villagePosition: { x: 8, y: 1 } },
  { id: 'c5', name: '감성 직관틀', sprite: 'd_sense', bookId: 'b_kant', bookTitle: '순수이성비판', nodeId: 'n_k_sense', acquiredReason: '관계도 탐색 5회', acquiredAt: '2026-11-14T21:40:00.000Z', isPublic: false, ownerId: 'u_me', villagePosition: { x: 1, y: 5 } },
]

export const seedExplore: ExploreCharacter[] = [
  { id: 'x1', name: '해시 버킷', sprite: 'd_hash', bookId: 'b_x1', bookTitle: '자료구조: 해시 테이블', acquiredReason: '점검 3회 완료', acquiredAt: now, isPublic: true, ownerId: 'u_other1', ownerNickname: '알고리즘러', category: 'major', contentSummary: '해시 함수, 충돌 해결(체이닝·개방 주소법) 정리 노트', downloadable: true },
  { id: 'x2', name: '어텐션 행렬', sprite: 'd_attention', bookId: 'b_x2', bookTitle: 'Transformer 논문 읽기', acquiredReason: '가설 2회 수정', acquiredAt: now, isPublic: true, ownerId: 'u_other2', ownerNickname: '논문반', category: 'paper', contentSummary: 'Self-attention, positional encoding 개념 요약', downloadable: false },
  { id: 'x3', name: '여행자', sprite: 'hatman', bookId: 'b_x3', bookTitle: '바람의 지도', acquiredReason: '완독', acquiredAt: now, isPublic: true, ownerId: 'u_other3', ownerNickname: '소설탐험가', category: 'novel', contentSummary: '샘플 모험 소설', downloadable: true },
]
