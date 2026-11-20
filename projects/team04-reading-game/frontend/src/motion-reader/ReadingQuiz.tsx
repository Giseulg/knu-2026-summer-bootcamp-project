import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion/mini';
import type { ReadingQuiz as Quiz } from './quizzes';
import './reading-quiz.css';

export default function ReadingQuiz({ quiz, still, onStart }: { quiz: Quiz; still: boolean; onStart: () => void }) {
  const [open, setOpen] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [burst, setBurst] = useState(false);
  const [effects, setEffects] = useState(true);
  const reaction = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const cancel = useRef<(() => void) | null>(null);
  const correct = answer === quiz.correct;

  useEffect(() => {
    cancel.current?.();
    setBurst(false);
    if (answer === null || still || !effects || !reaction.current || !frame.current) return;
    setBurst(true);
    const root = reaction.current;
    const card = frame.current;
    const controls: { stop: () => void }[] = [];
    const letters = [...root.querySelectorAll<HTMLElement>('[data-quiz-letter]')];
    if (!correct) {
      controls.push(animate(card, { transform: ['translateX(0px)', 'translateX(-3px)', 'translateX(3px)', 'translateX(0px)'] }, { duration: 0.3 }));
    }
    letters.forEach((letter, index) => {
      const angle = (index % 2 ? 1 : -1) * (12 + index * 3);
      controls.push(animate(letter, {
        transform: correct
          ? ['translateY(0px) scale(1)', 'translateY(-12px) scale(1.12)', 'translateY(0px) scale(1)']
          : ['translateY(0px) rotate(0deg)', `translateY(75px) rotate(${angle}deg)`, `translateY(58px) rotate(${angle / 2}deg)`, 'translateY(0px) rotate(0deg)'],
      }, { duration: correct ? 0.75 : 1.2, delay: index * 0.035, ease: 'easeInOut' }));
    });
    const cleanup = () => {
      controls.forEach(control => control.stop());
      card.removeAttribute('style');
      letters.forEach(letter => letter.removeAttribute('style'));
    };
    const timer = setTimeout(() => { cleanup(); setBurst(false); }, 1800);
    const hide = () => { if (document.hidden) { cleanup(); clearTimeout(timer); setBurst(false); } };
    document.addEventListener('visibilitychange', hide);
    cancel.current = () => { clearTimeout(timer); cleanup(); document.removeEventListener('visibilitychange', hide); };
    return () => { cancel.current?.(); cancel.current = null; };
  }, [answer, attempt, correct, still, effects]);

  function reset() { setAnswer(null); }

  if (skipped) return <div className="rq-skipped">장면 놀이를 건너뛰었어요.<button onClick={() => { onStart(); setSkipped(false); setOpen(true); }}>다시 열기</button></div>;

  return <section className="rq" aria-label="선택형 장면 퀴즈">
    {!open ? <div className="rq-invitation"><div><span className="rq-eyebrow">SCENE PLAY</span><h3>방금 장면, 살짝 떠올려볼까요?</h3><p>객관식 한 문제. 건너뛰어도 이야기는 계속돼요.</p></div><div className="rq-invite-actions"><button className="rq-start" onClick={() => { onStart(); setOpen(true); }}>잠깐 놀기 ✧</button><button className="rq-skip" onClick={() => setSkipped(true)}>건너뛰기</button></div></div> : <>
      <div className="rq-top"><span className="rq-eyebrow">SCENE PLAY / 장면 기억 놀이</span><button className="rq-skip" onClick={() => { cancel.current?.(); setSkipped(true); }}>닫고 계속 읽기 ↗</button></div>
      <div ref={frame} className={`rq-stage ${answer !== null ? correct ? 'is-right' : 'is-wrong' : ''} ${burst && !correct ? 'is-breaking' : ''}`}>
        <div className="rq-visual" aria-hidden="true">
          <span className={`rq-face ${burst && !correct ? 'is-crying' : ''}`}>{answer === null ? '( •ᴗ• )' : correct ? '( ˶ᵔ ᵕ ᵔ˶ )' : '( ；ω；)'}</span>
          <div ref={reaction} className="rq-reaction">{Array.from(answer === null ? '기억 한 조각' : correct ? '반짝, 떠올랐다!' : '앗, 와르르…').map((letter, index) => <span key={index} data-quiz-letter="">{letter === ' ' ? '\u00a0' : letter}</span>)}</div>
          {burst && !correct && <svg className="rq-cracks" viewBox="0 0 600 160" preserveAspectRatio="none"><path d="M300 0 283 34 310 62 291 92 315 126 300 160 M310 62 358 43 389 49 422 23 M291 92 247 79 217 101 178 93" /></svg>}
          {burst && !correct && <><i className="rq-tear rq-tear-left" /><i className="rq-tear rq-tear-right" /></>}
        </div>
        <h3>{quiz.question}</h3>
        <div className="rq-choices" role="group" aria-label="정답 고르기">{quiz.choices.map((choice, index) => <button key={choice} disabled={correct} aria-pressed={answer === index} className={answer === index ? correct ? 'is-correct' : 'is-incorrect' : ''} onClick={() => { setAnswer(index); setAttempt(value => value + 1); }}><span>{index + 1}</span>{choice}{answer === index && <b>{correct ? '✓' : '↻'}</b>}</button>)}</div>
      </div>
      <div className="rq-feedback" role="status" aria-live="polite">{answer === null ? '장면 속 사실만 확인해요. 인물의 속마음에는 정답을 매기지 않아요.' : correct ? `맞아요! ${quiz.explanation}` : '조금 달랐어요. 글자들이 잠깐 놀랐네요. 감점 없이 다시 골라도 괜찮아요.'}</div>
      {answer !== null && <div className="rq-after"><details><summary>원문 근거 펼치기</summary><blockquote>{quiz.evidence}</blockquote><p>{quiz.explanation}</p></details><button className="rq-skip" onClick={reset}>다시 풀기</button></div>}
      <label className="rq-effect-toggle"><input type="checkbox" checked={effects} onChange={event => setEffects(event.target.checked)} /> 정답·오답 효과{still ? ' (현재는 동작 줄이기 적용 중)' : ''}</label>
    </>}
  </section>;
}
