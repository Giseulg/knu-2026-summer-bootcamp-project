import { useNavigate } from 'react-router'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { formatLocation } from '@/domain/location'
import type { Book } from '@/domain/types'
import { Button, Sheet } from '@/components/ui'

const SKILLS = [
  { path: 'graph', icon: 'i_graph', label: '관계도', sub: '읽은 곳까지' },
  { path: 'quiz', icon: 'i_quiz', label: '점검', sub: '이전 내용' },
  { path: 'notes', icon: 'i_memo', label: '메모', sub: '나의 메모' },
] as const

/** 2.4 책 액션 시트: 4개 활동 공통 진입점 */
export function BookActionSheet({ book, onClose }: { book: Book; onClose: () => void }) {
  const navigate = useNavigate()
  const go = (path: string) => navigate(`/library/${book.id}/${path}`)

  return (
    <Sheet title={book.title} onClose={onClose}>
      <div className="col" style={{ gap: 8 }}>
        <div className="row">
          <span className="lbl grow">{book.progress.percent > 0 ? `${formatLocation(book.progress.confirmed)}까지 읽음` : '읽기 전'}</span>
          <span className="num" style={{ fontSize: 13 }}>{book.progress.percent}%</span>
        </div>
        <div className="bar mark"><i style={{ width: `${book.progress.percent}%` }} /></div>
      </div>
      <Button full icon="i_book" style={{ marginTop: 4 }} onClick={() => go('read')}>
        이어서 읽기
      </Button>
      <div className="skills">
        {SKILLS.map((s) => (
          <button key={s.path} type="button" className="skill" onClick={() => go(s.path)}>
            <PixelSprite name={s.icon} scale={3} />
            <b>{s.label}</b>
            <small>{s.sub}</small>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
