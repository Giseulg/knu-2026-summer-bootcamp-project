import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { QueryState } from '@/components/QueryState'
import { SubBar } from '@/components/SubBar'
import { TabBar } from '@/components/TabBar'
import { Button } from '@/components/ui'
import { compareLocation, formatLocation, paragraphAt, parseLocation, percentAt } from '@/domain/location'
import type { Memo, Quote, ReadingLocation } from '@/domain/types'
import { useBook, useBookContent, useConfirmRead, useCreateMemo, useDueReviews, useMemos, useSaveCurrent, useSettings } from '@/hooks/queries'
import { MemoSheet } from './MemoSheet'
import { ReaderMoreMenu, type MoreItem } from './ReaderMoreMenu'
import { ReaderProgress } from './ReaderProgress'
import { ReaderSettingsSheet } from './ReaderSettingsSheet'
import { RecallSheet } from './RecallSheet'
import { ReviewModal } from './ReviewModal'
import { TocSheet } from './TocSheet'
import { SchedulingGame } from './SchedulingGame'

type Panel = 'memo' | 'settings' | 'toc' | null

const THEME_STYLE: Record<string, CSSProperties> = {
  parchment: { background: 'var(--parch-l)', color: 'var(--ink)' },
  light: { background: '#ffffff', color: '#1e1e1e' },
  dark: { background: '#2a1a10', color: 'var(--sand)' },
}

const pid = (l: ReadingLocation) => `p-${l.chapter}-${l.paragraph}`
const recallKey = (bookId: string) => `rf-recall-shown-${bookId}`

/** 2.5 Reader. ?loc= 가 바뀌면 해당 위치로 다시 열리도록 key 로 재마운트 */
export function ReaderPage() {
  const { bookId = '' } = useParams()
  const [params] = useSearchParams()
  const loc = params.get('loc')
  return <ReaderView key={`${bookId}:${loc ?? ''}`} bookId={bookId} jumpTo={parseLocation(loc)} />
}

function readRecallSeen(bookId: string) {
  try {
    return !!sessionStorage.getItem(recallKey(bookId))
  } catch {
    return false
  }
}

/** 진도(확정/현재 구분), 문단 선택, 여기까지 읽음, 2.5a~d */
function ReaderView({ bookId, jumpTo }: { bookId: string; jumpTo?: ReadingLocation }) {
  const navigate = useNavigate()
  const book = useBook(bookId)
  const content = useBookContent(bookId)
  const settings = useSettings()
  const memos = useMemos(bookId)
  const saveClue = useCreateMemo()
  const confirm = useConfirmRead(bookId)
  const saveCurrent = useSaveCurrent(bookId)
  const due = useDueReviews(bookId, false)

  const [selected, setSelected] = useState<ReadingLocation | null>(jumpTo ?? null)
  const [selText, setSelText] = useState<{ loc: ReadingLocation; text: string } | null>(null)
  const [visible, setVisible] = useState<ReadingLocation | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [recallSeen] = useState(() => readRecallSeen(bookId))
  const [recallDone, setRecallDone] = useState(false)
  const [review, setReview] = useState<Memo | null>(null)
  const [motion, setMotion] = useState<string | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  const start = jumpTo ?? book.data?.progress.current
  const current = visible ?? start ?? null
  const confirmed = book.data?.progress.confirmed

  // 첫 진입: 지정 위치(또는 마지막 위치)로 스크롤
  const scrolled = useRef(false)
  useEffect(() => {
    if (scrolled.current || !start || !content.data) return
    scrolled.current = true
    document.getElementById(pid(start))?.scrollIntoView({ block: jumpTo ? 'center' : 'start' })
  }, [content.data, start]) // eslint-disable-line react-hooks/exhaustive-deps

  // 2.5a: 재개 시 세션당 1회 회상 질문 제안 (원문 위치로 바로 온 경우·읽기 전 제외)
  const showRecall =
    !recallSeen && !recallDone && !jumpTo && !!book.data && book.data.progress.percent > 0 && !!settings.data?.learning.recallPrompt

  // 현재 위치 추적: 화면 위쪽에 걸친 첫 문단
  useEffect(() => {
    const root = mainRef.current
    if (!root || !content.data) return
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (!top) return
        const [, c, p] = top.target.id.split('-').map(Number)
        setVisible({ chapter: c, paragraph: p })
      },
      { root, rootMargin: '0px 0px -70% 0px' },
    )
    root.querySelectorAll('p[id^="p-"]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [content.data])

  // 현재 위치 저장 (1.5초 디바운스)
  useEffect(() => {
    if (!current || !book.data) return
    if (compareLocation(current, book.data.progress.current) === 0) return
    const t = setTimeout(() => saveCurrent.mutate(current), 1500)
    return () => clearTimeout(t)
  }, [current?.chapter, current?.paragraph]) // eslint-disable-line react-hooks/exhaustive-deps

  // 문장 드래그 선택 → 메모 인용문
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection()
      const text = sel?.toString().trim()
      const p = sel?.anchorNode?.parentElement?.closest('p[id^="p-"]')
      if (!text || !p) return
      const [, c, para] = p.id.split('-').map(Number)
      const loc = { chapter: c, paragraph: para }
      setSelText({ loc, text })
      setSelected(loc)
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const memoLocs = useMemo(() => {
    const m = new Map<string, Memo['type']>()
    for (const x of memos.data ?? []) {
      const k = pid(x.quote.location)
      if (m.get(k) !== 'hypothesis') m.set(k, x.type)
    }
    return m
  }, [memos.data])

  const target = selected ?? current
  const clueText = target && content.data ? paragraphAt(content.data, target) : ''
  const clueSaved = !!target && !!memos.data?.some(memo =>
    memo.type === 'memo' && memo.content === '문장 단서' && compareLocation(memo.quote.location, target) === 0,
  )
  const pctOf = useCallback((l?: ReadingLocation | null) => (content.data && l ? percentAt(content.data, l) : 0), [content.data])

  const memoQuote: Quote | null = useMemo(() => {
    if (!selected || !content.data) return null
    if (selText && compareLocation(selText.loc, selected) === 0) return { text: selText.text, location: selected }
    return { text: paragraphAt(content.data, selected), location: selected }
  }, [selected, selText, content.data])

  const doConfirm = () => {
    if (!target) return
    confirm.mutate(target, {
      onSuccess: async () => {
        setSelected(null)
        const { data } = await due.refetch()
        if (data?.[0]) setReview(data[0])
      },
    })
  }

  const reader = settings.data?.reader
  const textStyle: CSSProperties = {
    fontFamily: 'var(--font-reading)',
    fontSize: reader?.fontSize ?? 17,
    lineHeight: reader?.lineHeight ?? 1.8,
    ...THEME_STYLE[reader?.theme ?? 'parchment'],
  }
  const moreItems: MoreItem[] = [
    { key: 'toc', icon: 'i_toc', label: '목차', disabled: !content.data || !current, onSelect: () => setPanel('toc') },
    { key: 'graph', icon: 'i_graph', label: '관계도', hint: '읽은 범위까지의 인물·개념 관계', onSelect: () => navigate(`/library/${bookId}/graph`) },
    {
      key: 'memo',
      icon: 'i_pencil',
      label: '메모 쓰기',
      hint: memoQuote ? `${formatLocation(memoQuote.location)} 인용` : '문단을 먼저 눌러 고르세요',
      disabled: !memoQuote,
      onSelect: () => setPanel('memo'),
    },
    { key: 'notes', icon: 'i_memo', label: '메모 보기', hint: memos.data ? `${memos.data.length}개` : undefined, onSelect: () => navigate(`/library/${bookId}/notes`) },
    { key: 'settings', icon: 'i_gear', label: '읽기 설정', hint: '글자 크기·줄 간격·테마', disabled: !reader, onSelect: () => setPanel('settings') },
  ]
  const alreadyConfirmed = !!(target && confirmed && compareLocation(target, confirmed) <= 0)

  return (
    <>
      <SubBar
        title={book.data?.title ?? ''}
        subtitle={current ? `${content.data?.chapters[current.chapter]?.title ?? ''}` : undefined}
        backTo="/library"
      />
      {confirmed && current && (
        <ReaderProgress confirmed={confirmed} confirmedPct={book.data?.progress.percent ?? 0} current={current} currentPct={pctOf(current)} />
      )}

      <div className="reader-body">
      <main ref={mainRef} className="app-content reader-text" style={textStyle}>
        <QueryState isLoading={content.isLoading} error={content.error}>
          {content.data?.chapters.map((ch, ci) => (
            <section key={ci} className="col" style={{ gap: '0.6em' }}>
              <h2 className="h" style={{ fontSize: '1.3em', marginTop: 8 }}>{ch.title}</h2>
              {ch.paragraphs.map((p, pi) => {
                const loc = { chapter: ci, paragraph: pi }
                const read = confirmed && compareLocation(loc, confirmed) <= 0
                const isSel = selected && compareLocation(loc, selected) === 0
                const memo = memoLocs.get(pid(loc))
                return (
                  <Fragment key={pi}>
                  <p
                    id={pid(loc)}
                    className={['para', read && 'read', isSel && 'sel', motion === pid(loc) && 'reader-paragraph-motion'].filter(Boolean).join(' ')}
                    onAnimationEnd={() => setMotion(previous => previous === pid(loc) ? null : previous)}
                    onClick={() => !window.getSelection()?.toString() && setSelected(isSel ? null : loc)}
                  >
                    {memo && (
                      <span className={`para-pin ${memo}`} aria-label={memo === 'hypothesis' ? '가설 있음' : '메모 있음'}>
                        <PixelSprite name="i_pin" scale={2} color="currentColor" />
                      </span>
                    )}
                    {p}
                  </p>
                  {bookId === 'b_os' && ci === 1 && pi === 1 && read && <SchedulingGame />}
                  </Fragment>
                )
              })}
            </section>
          ))}
        </QueryState>
      </main>
      <ReaderMoreMenu items={moreItems} />
      </div>

      <div className="reader-foot">
        <div className="reader-inline-actions">
          <Button size="sm" variant="wood" disabled={!target || !clueText} onClick={() => {
            if (!target) return
            const id = pid(target)
            document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
            setMotion(previous => previous === id ? null : id)
          }}>{target && motion === pid(target) ? '효과 멈추기' : '문단 움직이기'}</Button>
          <Button size="sm" variant="wood" icon="i_pin" disabled={!target || !clueText || !memos.data || clueSaved || saveClue.isPending} onClick={() => {
            if (!target || !clueText) return
            saveClue.mutate({ bookId, type: 'memo', content: '문장 단서', quote: { text: memoQuote?.text || clueText, location: target } })
          }}>{clueSaved ? '단서 담음' : '문장 단서 담기'}</Button>
        </div>
        {saveClue.isError && <p className="lbl" role="alert">단서를 저장하지 못했어요. 다시 시도해 주세요.</p>}
        <span className="lbl" style={{ textAlign: 'center' }}>
          {target ? (alreadyConfirmed ? `${formatLocation(target)}은 이미 읽음 확정됨` : `${formatLocation(target)}까지 읽음으로 확정`) : '문단을 눌러 위치를 고르세요'}
        </span>
        <Button variant="secondary" full icon="i_check" disabled={!target || alreadyConfirmed || confirm.isPending} onClick={doConfirm}>
          여기까지 읽음
        </Button>
      </div>
      <TabBar />

      {showRecall && book.data && (
        <RecallSheet book={book.data} count={settings.data?.learning.recallCount ?? 2} onClose={() => setRecallDone(true)} />
      )}
      {panel === 'memo' && memoQuote && (
        <MemoSheet bookId={bookId} quote={memoQuote} percent={pctOf(memoQuote.location)} onClose={() => { setPanel(null); window.getSelection()?.removeAllRanges() }} />
      )}
      {panel === 'settings' && reader && <ReaderSettingsSheet value={reader} onClose={() => setPanel(null)} />}
      {panel === 'toc' && content.data && current && (
        <TocSheet
          content={content.data}
          current={current}
          onClose={() => setPanel(null)}
          onPick={(c) => { document.getElementById(pid({ chapter: c, paragraph: 0 }))?.scrollIntoView({ block: 'start' }); setPanel(null) }}
        />
      )}
      {review && confirmed && <ReviewModal memo={review} confirmed={confirmed} onClose={() => setReview(null)} />}
    </>
  )
}
