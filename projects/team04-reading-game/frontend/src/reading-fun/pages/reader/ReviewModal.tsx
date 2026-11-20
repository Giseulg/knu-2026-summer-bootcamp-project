import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { formatLocation } from '@/domain/location'
import type { Memo, ReadingLocation } from '@/domain/types'
import { useReviseMemo } from '@/hooks/queries'

/** 2.5c 가설 재검토 알림. 관련 구간을 확정했을 때 표시 */
export function ReviewModal({ memo, confirmed, onClose }: { memo: Memo; confirmed: ReadingLocation; onClose: () => void }) {
  const [text, setText] = useState('')
  const revise = useReviseMemo(memo.bookId)
  const h = memo.hypothesis!
  const ev = h.reviewEvidence ?? { for: [], against: [] }

  return (
    <Modal title="가설 재검토" icon="i_bell" onClose={onClose}>
      <p style={{ fontSize: 15, lineHeight: 1.6 }}>
        {formatLocation(confirmed)}까지 읽음 확정. <b>{formatLocation(memo.quote.location)}</b>에서 세운 가설과 관련된 내용이 나왔어요.
      </p>
      <div className="panel accent sm col" style={{ gap: 6 }}>
        <div className="row">
          <span className="tag v">이전 가설</span>
          <span className="lbl" style={{ marginLeft: 'auto' }}>확신도 <b className="num">{h.confidence * 20}%</b></span>
        </div>
        <b style={{ fontSize: 16, lineHeight: 1.5 }}>{memo.content}</b>
      </div>
      {ev.for.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <span className="tag g" style={{ alignSelf: 'flex-start' }}>{ev.against.length ? '지지 근거' : '관련 내용'}</span>
          {ev.for.map((q, i) => <div key={i} className="quote">{q.text}</div>)}
        </div>
      )}
      {ev.against.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <span className="tag" style={{ alignSelf: 'flex-start', background: 'var(--err)', color: '#fff' }}>반대 근거</span>
          {ev.against.map((q, i) => <div key={i} className="quote">{q.text}</div>)}
        </div>
      )}
      <label className="col" style={{ gap: 4 }}>
        <span className="lbl">설명 수정</span>
        <textarea className="input area" value={text} onChange={(e) => setText(e.target.value)} placeholder="지금 이해한 내용으로 다시 설명해 보세요" />
      </label>
      <div className="row">
        <Button variant="ghost" className="grow" onClick={onClose}>나중에</Button>
        <Button
          className="grow"
          disabled={!text.trim() || revise.isPending}
          onClick={() => revise.mutate({ memoId: memo.id, revision: { content: text, evidenceFor: ev.for, evidenceAgainst: ev.against } }, { onSuccess: onClose })}
        >
          수정 저장
        </Button>
      </div>
    </Modal>
  )
}
