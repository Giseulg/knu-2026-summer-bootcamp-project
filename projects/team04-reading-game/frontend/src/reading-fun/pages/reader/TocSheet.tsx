import { Sheet } from '@/components/ui'
import type { BookContent, ReadingLocation } from '@/domain/types'

/** 목차 */
export function TocSheet({ content, current, onPick, onClose }: { content: BookContent; current: ReadingLocation; onPick: (chapter: number) => void; onClose: () => void }) {
  return (
    <Sheet title="목차" onClose={onClose}>
      <nav className="menu">
        {content.chapters.map((ch, i) => (
          <button key={i} type="button" className="menu-row" style={{ width: '100%' }} aria-current={i === current.chapter} onClick={() => onPick(i)}>
            <span className="grow" style={{ textAlign: 'left', fontWeight: i === current.chapter ? 700 : 500 }}>{ch.title}</span>
            <span className="lbl">{ch.paragraphs.length}문단</span>
          </button>
        ))}
      </nav>
    </Sheet>
  )
}
