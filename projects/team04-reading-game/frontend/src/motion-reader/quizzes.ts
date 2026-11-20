import { pages } from './story';

export type ReadingQuiz = {
  id: string;
  question: string;
  choices: string[];
  correct: number;
  evidence: string;
  explanation: string;
  page: number;
};

// Hand-reviewed factual questions only. No future-aware question generation and
// no grading of motives, interpretations or predictions.
const definitions = [
  {
    id: 'sleeve', section: 1,
    question: '민서는 무엇을 등 뒤로 감췄을까?',
    choices: ['가방', '젖은 소매', '모자', '신발'], correct: 1,
    evidence: '민서는 젖은 소매를 등 뒤로 감췄다.',
    explanation: '민서가 감춘 것은 젖은 소매였어요. 왜 그랬는지는 아직 정답으로 정하지 않아요.',
  },
  {
    id: 'key', section: 2,
    question: '작은 은색 열쇠는 어디에서 나왔을까?',
    choices: ['창틀 위', '문고리 옆', '손수건 아래', '지우의 가방'], correct: 2,
    evidence: '민서가 손수건을 집어 들자 작은 은색 열쇠가 드러났다.',
    explanation: '민서가 손수건을 집어 들자 열쇠가 드러났어요.',
  },
  {
    id: 'blue', section: 3,
    question: '민서는 책이 젖은 걸 어떻게 알았다고 했을까?',
    choices: ['전화로 들어서', '쪽지를 읽어서', '빗소리를 듣고', '손에 파란 물이 묻어서'], correct: 3,
    evidence: '“넣고 나서 알았어. 손에 파란 물이 묻어서.”',
    explanation: '민서는 책을 넣은 뒤 손에 파란 물이 묻어 알았다고 말했어요.',
  },
  {
    id: 'note', section: 4,
    question: '민서는 왜 반납을 막는 종이를 붙였다고 했을까?',
    choices: ['책이 더 들어와 젖은 책이 눌릴까 봐', '반납함을 꾸미려고', '도서실 시간을 알리려고', '자리를 예약하려고'], correct: 0,
    evidence: '“그러다 누가 책을 더 넣으면 이 책이 눌릴 것 같아서 종이를 붙였어.”',
    explanation: '다른 책이 더 들어와 젖은 책을 누르지 않도록 막았다는 설명이에요.',
  },
];

export const quizzes: ReadingQuiz[] = definitions.map(({ section, ...quiz }) => {
  const page = pages.findIndex(p => p.section === section && p.paragraphs.some(text => text.includes(quiz.evidence)));
  if (page < 0) throw new Error(`Quiz evidence is missing: ${quiz.id}`);
  return { ...quiz, page };
});

export function visibleQuiz(page: number, confirmed: readonly number[]) {
  if (!confirmed.includes(page)) return undefined;
  return quizzes.find(quiz => quiz.page === page);
}
