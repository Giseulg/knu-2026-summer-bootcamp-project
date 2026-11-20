import { Link } from 'react-router'
import { useMe, useStats } from '@/hooks/queries'
import { PixelSprite } from './pixel/PixelSprite'
import { useRainCollection } from '../../motion-reader/collection'

/** 탭 화면 공통 HUD (목업 .appbar): 플레이어 + 보유 수치 */
export function AppBar() {
  const { data: me } = useMe()
  const { data: stats } = useStats()
  const discovery = useRainCollection(state => state.discovery)
  return (
    <header className="appbar">
      <Link to="/my" className="hud-player" aria-label="My">
        <span className="avatar"><PixelSprite name="person" scale={2} /></span>
        <b>{me?.nickname ?? ''}</b>
      </Link>
      <div className="sp1" />
      <div className="counter" title="보유 캐릭터">
        <span className="ic"><PixelSprite name="i_star" scale={2} /></span>
        <span className="v">{stats ? stats.characterCount + Number(!!discovery) : '-'}</span>
      </div>
      <div className="counter" title="메모">
        <span className="ic" style={{ color: 'var(--ink2)' }}><PixelSprite name="i_memo" scale={2} /></span>
        <span className="v">{stats?.memoCount ?? '-'}</span>
      </div>
    </header>
  )
}
