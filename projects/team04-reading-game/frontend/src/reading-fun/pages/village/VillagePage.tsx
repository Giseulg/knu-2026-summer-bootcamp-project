import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { rainCharacter, rainSlots, useRainCollection } from '../../../motion-reader/collection'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { formatLocation } from '@/domain/location'
import { useBooks, useMyCharacters } from '@/hooks/queries'
import './village.css'
import { Button } from '@/components/ui'

/** 배치 좌표(타일)를 장면 % 좌표로. 가로 10칸·세로 7칸 */
const toLeft = (x: number) => `${8 + (x % 10) * 9.4}%`
const toTop = (y: number) => `${14 + (y % 7) * 12.5}%`

/** 장면 고정 소품. 좌표는 field 기준 % (발 위치) */
const DECO: Array<{ s: string; l: string; t: string; k: number }> = [
  { s: 'house', l: '50%', t: '20%', k: 4 },
  { s: 'lamp', l: '62%', t: '20%', k: 3 },
  { s: 'tree', l: '12%', t: '18%', k: 4 },
  { s: 'tree', l: '88%', t: '20%', k: 4 },
  { s: 'tree', l: '10%', t: '100%', k: 4 },
  { s: 'fence', l: '80%', t: '42%', k: 4 },
  { s: 'bush', l: '14%', t: '50%', k: 3 },
  { s: 'bush', l: '30%', t: '96%', k: 3 },
  { s: 'flowerv', l: '22%', t: '44%', k: 4 },
  { s: 'flowery', l: '40%', t: '86%', k: 4 },
  { s: 'flowery', l: '92%', t: '50%', k: 4 },
  { s: 'sign', l: '42%', t: '52%', k: 3 },
]

/** 1.0 캐릭터 마을 */
export function VillagePage() {
  const chars = useMyCharacters()
  const books = useBooks()
  const recent = books.data
    ?.filter((b) => b.status === 'ready' && b.progress.lastReadAt)
    .sort((a, b) => (b.progress.lastReadAt ?? '').localeCompare(a.progress.lastReadAt ?? ''))[0]
  const placed = chars.data?.filter((c) => c.villagePosition) ?? []
  const { discovery, slot } = useRainCollection()
  const rainPosition = discovery && slot !== null ? rainSlots[slot] : null

  return (
    <section className="scene" aria-label="내 마을">
      <div className="field">
        <div className="path-v" />
        <div className="path-h" />
        <div className="pond" />
        {DECO.map((d, i) => (
          <div key={i} className="deco" style={{ left: d.l, top: d.t }}>
            <PixelSprite name={d.s} scale={d.k} />
          </div>
        ))}
        {placed.map((c) => (
          <div key={c.id} className="chr" style={{ left: toLeft(c.villagePosition!.x), top: toTop(c.villagePosition!.y) }}>
            <span className="namecard">{c.name}</span>
            <PixelSprite name={c.sprite} fit={64} title={c.name} />
            <span className="sh" />
          </div>
        ))}
        {rainPosition && (
          <Link to="/my/characters" className="chr" style={{ left: toLeft(rainPosition.x), top: toTop(rainPosition.y) }}>
            <span className="namecard">{rainCharacter.name}</span>
            <PixelSprite name={rainCharacter.sprite} fit={64} />
            <span className="sh" />
          </Link>
        )}
      </div>

      <div className="plate">
        내 마을
        {chars.data && <span className="num">{placed.length + Number(!!rainPosition)}/{chars.data.length + Number(!!discovery)}</span>}
      </div>

      {recent && (
        <div className="quest">
          <div className="row" style={{ gap: 12 }}>
            <span className="cover" style={{ '--c': `var(--${recent.coverColor})` } as CSSProperties} />
            <div className="col grow" style={{ gap: 4 }}>
              <span className="lbl">이어 읽기</span>
              <span className="t">{recent.title}</span>
              <span className="lbl">
                {recent.progress.percent > 0 ? `${formatLocation(recent.progress.confirmed)}까지 읽음` : '처음부터'}
              </span>
            </div>
            <span className="num" style={{ fontSize: 13 }}>{recent.progress.percent}%</span>
          </div>
          <div className="quest-actions">
            <Button to={`/library/${recent.id}/read`} size="sm" icon="i_book">이어서 읽기</Button>
            <Link className="btn wood sm" to="/library/rain">문장 단서 찾기</Link>
          </div>
        </div>
      )}
      {!recent && <div className="quest"><Link className="btn wood" to="/library/rain">문장 단서 찾기</Link></div>}
    </section>
  )
}
