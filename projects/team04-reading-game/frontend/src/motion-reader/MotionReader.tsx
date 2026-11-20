import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { playMotion } from './playMotion';
import ReadingQuiz from './ReadingQuiz';
import { quizzes, visibleQuiz } from './quizzes';
import { initialReading, pages, readSaved, STORAGE_KEY } from './story';
import type { Effect, SavedReading } from './story';
import { eligibleClues, rainCharacter, useRainCollection } from './collection';
import './motion-reader.css';

const effects: { id: Effect; name: string; detail: string }[] = [
  { id: 'wave', name: '물결', detail: '글자를 따라 작은 물결이 지나가요' },
  { id: 'breathe', name: '숨결', detail: '글자가 차례로 살짝 부풀었다 돌아와요' },
  { id: 'ink', name: '잉크', detail: '글자를 따라 잉크빛이 머물다 돌아와요' },
];

function loadReading(): SavedReading {
  try { return readSaved(localStorage.getItem(STORAGE_KEY)); } catch { return initialReading; }
}

export default function MotionReader({ embedded = false }: { embedded?: boolean }) {
  const [anchor] = useState(() => {
    const params = new URLSearchParams(location.search);
    const page = Number(params.get('page')) - 1;
    const paragraph = Number(params.get('paragraph')) - 1;
    return pages[page]?.paragraphs[paragraph] ? { page, paragraph } : null;
  });
  const [reading, setReading] = useState(() => {
    const saved = loadReading();
    return anchor && saved.confirmed.includes(anchor.page) && saved.pocket.some(
      item => item.page === anchor.page && item.paragraph === anchor.paragraph,
    ) ? { ...saved, page: anchor.page } : saved;
  });
  const [selected, setSelected] = useState(() => anchor?.page === reading.page ? anchor.paragraph : 0);
  const [reflection, setReflection] = useState('');
  const discovery = useRainCollection(state => state.discovery);
  const discover = useRainCollection(state => state.discover);
  const clues = discovery ? null : eligibleClues(reading);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [systemStill, setSystemStill] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [storageError, setStorageError] = useState(false);
  const [notice, setNotice] = useState('');
  const article = useRef<HTMLElement>(null);
  const cancelRun = useRef<(() => void) | null>(null);
  const page = pages[reading.page];
  const reduceMotion = systemStill || reading.still;
  const quiz = visibleQuiz(reading.page, reading.confirmed);
  const quizHere = quizzes.some(item => item.page === reading.page);

  useEffect(() => {
    if (anchor?.page !== reading.page || anchor.paragraph !== selected) return;
    article.current?.querySelector(`[data-paragraph="${selected}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [anchor, reading.page, selected]);

  function clearAnimation() {
    cancelRun.current?.();
    cancelRun.current = null;
  }

  function stop() {
    clearAnimation();
    setPlaying(false);
    setActive(null);
  }

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { clearAnimation(); setPlaying(false); setActive(null); setSystemStill(media.matches); };
    const hidden = () => { if (document.hidden) { clearAnimation(); setPlaying(false); setActive(null); } };
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', hidden);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', hidden); clearAnimation(); };
  }, []);

  useEffect(() => {
    clearAnimation();
    setActive(null);
    setPlaying(false);
    if (!reading.auto || !article.current || document.hidden) return;
    setPlaying(true);
    cancelRun.current = playMotion(article.current, pages[reading.page].paragraphs.map((_, index) => index), reading.effect, reduceMotion, setActive, () => {
      setPlaying(false);
      setActive(null);
    });
    return clearAnimation;
  }, [reading.page, reading.auto, reading.effect, reduceMotion]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reading)); }
    catch { setStorageError(true); }
  }, [reading]);

  function patch(value: Partial<SavedReading>) { setReading(previous => ({ ...previous, ...value })); }

  function move(next: number) {
    if (next < 0 || next >= pages.length) return;
    stop();
    setSelected(0);
    setNotice('');
    patch({ page: next });
    article.current?.scrollTo(0, 0);
    article.current?.focus();
  }

  function play() {
    stop();
    if (!article.current) return;
    setPlaying(true);
    cancelRun.current = playMotion(article.current, reading.auto ? page.paragraphs.map((_, index) => index) : [selected], reading.effect, reduceMotion, setActive, () => {
      setPlaying(false);
      setActive(null);
      setNotice('움직임이 끝났어요. 내 속도로 계속 읽어보세요.');
    });
  }

  function collect() {
    if (reading.pocket.some(item => item.page === reading.page && item.paragraph === selected)) {
      setNotice('이미 문장 주머니에 담긴 문단이에요.');
      return;
    }
    patch({ pocket: [...reading.pocket, { page: reading.page, paragraph: selected }] });
    setNotice('문장 주머니에 담았어요. 아래에서 다시 펼쳐볼 수 있어요.');
  }

  function confirm() {
    patch({ confirmed: [...new Set([...reading.confirmed, reading.page])] });
    setNotice('이 화면을 읽음으로 표시했어요. 다음으로 이동해도 자동 확인되지는 않아요.');
  }

  return (
    <div className={embedded ? 'mr-app mr-embedded' : 'mr-app'}>
      {!embedded && <header className="mr-header">
        <a className="mr-brand" href="?experience=motion" aria-label="SpoKeeper 움직이는 글 체험">S<span>✦</span><b>SpoKeeper</b></a>
        <span className="mr-lab">READING LAB <i /> 움직이는 글</span>
        <a className="mr-legacy" href="/library">서재로 돌아가기</a>
      </header>}

      <div className="mr-main">
        {embedded ? <div className="mr-reader-nav"><Link to="/library">‹ 서재로 돌아가기</Link><a href="#reading-motion-settings">글자 움직임 설정</a></div> : <div className="mr-intro"><span className="mr-eyebrow">WORDS, A LITTLE MORE ALIVE</span><h1>글에, 작은 움직임을.</h1><p>자동 모션을 켜면, 글이 차례로 움직여요.<br className="mr-mobile-break" /> 페이지는 내 속도로 넘겨보세요.</p></div>}
        <div className="mr-workspace">
          <section className="mr-book" aria-label="단편 읽기">
            <div className="mr-book-top"><span>창작 단편</span><span>구간 {page.section} / 4 · 화면 {reading.page + 1} / {pages.length}</span></div>
            <div className="mr-book-title"><span className="mr-book-mark">雨</span><div><h2>비 오는 날의 반납함</h2><p>한 장면씩, 내 속도로 읽기</p></div></div>
            <article ref={article} tabIndex={-1} className="mr-text" style={{ fontSize: reading.fontSize }} aria-label={`구간 ${page.section}, 화면 ${reading.page + 1} 원문`}>
              {page.paragraphs.map((paragraph, index) => (
                <p key={`${reading.page}-${index}`} className={`mr-paragraph ${selected === index && !reading.auto ? 'is-selected' : ''} ${active === index ? 'is-active' : ''} ${reduceMotion && active === index ? 'is-static' : ''}`} data-paragraph={index}>
                  {!reading.auto && <button className="mr-paragraph-pick" aria-label={`${index + 1}번째 문단 선택`} aria-pressed={selected === index} onClick={() => { stop(); setSelected(index); setNotice('문단을 골랐어요. 아래 버튼으로 움직임을 줄 수 있어요.'); }}>{String(index + 1).padStart(2, '0')}</button>}
                  <span className="mr-sr-only">{paragraph}</span>
                  <span aria-hidden="true" className="mr-original" onClick={() => { if (!reading.auto) stop(); setSelected(index); }}>
                    {paragraph.split(/(\s+)/).map((word, wi) => /^\s+$/.test(word) ? word : <span className="mr-word" key={wi}>{[...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(word)].map(({ segment }, ci) => <span key={ci} data-letter="">{segment}</span>)}</span>)}
                  </span>
                </p>
              ))}
            </article>
            <div className="mr-book-bottom"><button className="mr-collect" onClick={collect}>＋ {selected + 1}번째 문단 담기</button><button className="mr-confirm" onClick={confirm} disabled={reading.confirmed.includes(reading.page)}>{reading.confirmed.includes(reading.page) ? '✓ 읽음 확인됨' : '○ 여기까지 읽었어요'}</button></div>
            {embedded && <button className="mr-inline-play btn wood sm full" onClick={playing ? stop : play}>{playing ? '움직임 멈추기' : reduceMotion ? '문단에 밑줄 표시' : '글자 움직이기'}</button>}
            <div className="mr-navigation"><button onClick={() => move(reading.page - 1)} disabled={reading.page === 0}>← 이전</button><div className="mr-page-track" aria-hidden="true"><span style={{ width: `${((reading.page + 1) / pages.length) * 100}%` }} /></div><button onClick={() => move(reading.page + 1)} disabled={reading.page === pages.length - 1}>다음 문장 →</button></div>
            {quiz ? <ReadingQuiz key={quiz.id} quiz={quiz} still={reduceMotion} onStart={stop} /> : quizHere && <p className="rq-locked">이 화면을 ‘읽음 확인’하면 짧은 객관식 장면 놀이를 열 수 있어요. 바로 다음으로 넘어가도 괜찮아요.</p>}
            {reading.page === pages.length - 1 && <p className="mr-ending">마지막 장면이에요. 움직임을 준 뒤 문장이 더 들어왔나요?</p>}
          </section>

          <aside className="mr-panel" id="reading-motion-settings" aria-label="글자 움직임 설정">
            {embedded ? <h2>글자 움직임 설정</h2> : <><div className="mr-panel-icon" aria-hidden="true">Aa<span>✦</span></div><span className="mr-eyebrow">A LITTLE NUDGE</span><h2>다시, 문장 속으로</h2><p className="mr-panel-description">한 번 켜면 다음 화면에서도 이어져요.<br />소리 낭독 없이 글자만 움직입니다.</p></>}
            <label className="mr-auto"><input type="checkbox" checked={reading.auto} onChange={event => { stop(); patch({ auto: event.target.checked }); }} /><span><b>자동 모션</b><small>화면마다 처음부터 끝까지 한 번씩</small></span></label>
            <div className="mr-effects" role="group" aria-label="움직임 종류">{effects.map(effect => <button key={effect.id} aria-pressed={reading.effect === effect.id} onClick={() => { stop(); patch({ effect: effect.id }); }}><span aria-hidden="true">{effect.id === 'wave' ? '〰' : effect.id === 'breathe' ? '◌' : '✒'}</span>{effect.name}</button>)}</div>
            <p className="mr-effect-detail">{effects.find(effect => effect.id === reading.effect)?.detail}</p>
            {!embedded && <button className="mr-play" onClick={playing ? stop : play}>{playing ? '■ 움직임 멈추기' : reading.auto ? '↻ 이 화면 다시 따라가기' : reduceMotion ? '선택 문단에 밑줄' : '✦ 선택 문단 움직이기'}</button>}
            <span className="mr-play-note">{reading.auto ? '문단을 차례로 · 페이지 자동 넘김 없음' : '누를 때만 · 한 번 재생 후 멈춤'}</span>
            <div className="mr-preferences"><label>글자 크기<select aria-label="글자 크기" value={reading.fontSize} onChange={event => { stop(); patch({ fontSize: Number(event.target.value) }); }}><option value={22}>보통</option><option value={25}>크게</option><option value={29}>더 크게</option></select></label><label className="mr-checkbox"><input type="checkbox" checked={reading.still} onChange={event => { stop(); patch({ still: event.target.checked }); }} /> 움직임 대신 밑줄</label>{systemStill && <p className="mr-system-note">기기의 ‘동작 줄이기’ 설정에 따라 밑줄로 표시해요.</p>}</div>
            <div className="mr-rule"><span aria-hidden="true">↳</span><p>문장은 그대로예요.<br />넘기거나 움직여도 읽음으로 자동 표시하지 않아요.</p></div>
          </aside>
        </div>
        <details className="mr-pocket"><summary>✧ 문장 주머니 <span>내가 담은 원문 다시 펼치기</span></summary><p className="mr-pocket-help">마음에 든 문단을 눌러 고른 뒤 ‘담기’를 누르세요. 이전 화면으로 돌아가면 그 뒤에서 담은 문장은 잠시 가려져요.</p>{reading.pocket.filter(item => item.page <= reading.page).length === 0 ? <p>아직 담아둔 문장이 없어요. 그냥 읽어도 괜찮아요.</p> : reading.pocket.filter(item => item.page <= reading.page).map(item => <blockquote key={`${item.page}-${item.paragraph}`}><p>{pages[item.page].paragraphs[item.paragraph]}</p><footer>화면 {item.page + 1}<button onClick={() => move(item.page)}>원문으로 ↗</button></footer></blockquote>)}</details>
        <details className="mr-pocket">
          <summary>단서 잇기 <span>{discovery ? '캐릭터 획득' : '선택 활동'}</span></summary>
          {discovery ? (
            <p><b>{rainCharacter.name}</b>를 만났어요. {embedded ? <Link to="/my/characters">내 캐릭터에서 마을에 배치하기</Link> : <a href="/my/characters">내 캐릭터에서 마을에 배치하기</a>}</p>
          ) : clues ? (
            <form onSubmit={event => { event.preventDefault(); if (discover(reading, reflection)) setNotice(`${rainCharacter.name}를 획득했어요.`); }}>
              {clues.map(clue => <blockquote key={clue.page}><p>{pages[clue.page].paragraphs[clue.paragraph]}</p><footer>구간 {pages[clue.page].section}</footer></blockquote>)}
              <label className="mr-reflection">두 문장을 읽고 어떤 생각이 들었나요?
                <textarea value={reflection} maxLength={280} onChange={event => setReflection(event.target.value)} />
              </label>
              <button className="mr-collect" disabled={!reflection.trim()}>단서 연결하고 캐릭터 만나기</button>
            </form>
          ) : <p>서로 다른 두 구간에서 문단을 하나씩 담고, 각 화면을 읽음 확인하면 단서를 이어볼 수 있어요.</p>}
        </details>
        <div className="mr-status" role="status" aria-live="polite">{storageError ? '브라우저 저장을 사용할 수 없어 이번 창에서만 읽을 수 있어요.' : notice || '읽던 화면과 설정은 이 브라우저에 저장돼요.'}</div>
        {!embedded && <footer className="mr-footer"><span>SPOKEEPER / 작은 독서 실험</span><span>꾸준히 움직이기보다, 잠깐 다시 바라보기.</span></footer>}
      </div>
    </div>
  );
}
