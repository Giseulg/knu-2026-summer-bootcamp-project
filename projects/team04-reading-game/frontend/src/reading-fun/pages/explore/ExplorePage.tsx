import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { QueryState } from '@/components/QueryState'
import { CATEGORY_LABEL } from '@/domain/labels'
import { qk, useExplore } from '@/hooks/queries'
import { IconButton } from '@/components/ui'

/** 3.0 캐릭터 탐색 */
export function ExplorePage() {
  const { data, isLoading, error } = useExplore()
  const qc = useQueryClient()
  return (
    <>
      <div className="sec-h" style={{ alignItems: 'center' }}>
        <b>다른 독자의 캐릭터</b>
        <IconButton tone="light" className="r" icon="i_refresh" iconScale={2} label="새로고침" onClick={() => qc.invalidateQueries({ queryKey: qk.explore })} />
      </div>
      <QueryState isLoading={isLoading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {data?.map((c) => (
            <Link key={c.id} to={`/explore/${c.id}`} className="book-row col" style={{ alignItems: 'stretch', gap: 8, padding: 8 }}>
              <span className="pedestal"><PixelSprite name={c.sprite} fit={64} /></span>
              <span className="col" style={{ gap: 2, padding: '0 4px 4px' }}>
                <span className="t" style={{ fontSize: 14 }}>{c.name}</span>
                <span className="lbl">{c.ownerNickname} · {CATEGORY_LABEL[c.category]}</span>
              </span>
            </Link>
          ))}
        </div>
      </QueryState>
    </>
  )
}
