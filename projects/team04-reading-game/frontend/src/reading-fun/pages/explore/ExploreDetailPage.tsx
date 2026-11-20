import { useParams } from 'react-router'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { QueryState } from '@/components/QueryState'
import { useExploreDetail } from '@/hooks/queries'
import { Button, Panel } from '@/components/ui'

/** 3.1 캐릭터 상세. 다운로드 저작권 정책 미결정 */
export function ExploreDetailPage() {
  const { characterId = '' } = useParams()
  const { data: c, isLoading, error } = useExploreDetail(characterId)
  return (
    <QueryState isLoading={isLoading} error={error}>
      {c && (
        <Panel tone="white" stack gap={12}>
          <span className="pedestal" style={{ height: 160 }}><PixelSprite name={c.sprite} fit={128} /></span>
          <div className="col" style={{ gap: 4 }}>
            <b className="h" style={{ fontSize: 24 }}>{c.name}</b>
            <span className="lbl">{c.ownerNickname} · {c.bookTitle}</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{c.contentSummary}</p>
          <span className="lbl">획득: {c.acquiredReason}</span>
          <Button to="/explore" full variant="wood">탐색 목록으로</Button>
        </Panel>
      )}
    </QueryState>
  )
}
