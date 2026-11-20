import { Link } from 'react-router'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { QueryState } from '@/components/QueryState'
import { CATEGORY_LABEL } from '@/domain/labels'
import { useMe, useStats } from '@/hooks/queries'
import { Panel } from '@/components/ui'
import { useRainCollection } from '../../../motion-reader/collection'

const MENU = [
  { to: '/my/characters', label: '내 캐릭터', icon: 'i_star' }, // 4.1
  { to: '/my/interests', label: '관심 분야', icon: 'i_heart' }, // 4.2
  { to: '/my/settings', label: '읽기·학습 설정', icon: 'i_gear' }, // 4.3
  { to: '/my/data', label: '데이터 관리', icon: 'i_dl' }, // 4.4
]

/** 4.0 My 홈 */
export function MyPage() {
  const me = useMe()
  const stats = useStats()
  const discovery = useRainCollection(state => state.discovery)
  const cells = [
    ['책', stats.data?.bookCount],
    ['메모', stats.data?.memoCount],
    ['점검', stats.data?.quizCount],
    ['캐릭터', stats.data && stats.data.characterCount + Number(!!discovery)],
  ] as const
  return (
    <>
      <QueryState isLoading={me.isLoading || stats.isLoading} error={me.error ?? stats.error}>
        <Panel tone="white" stack gap={16}>
          <div className="row" style={{ gap: 12 }}>
            <span className="avatar" style={{ width: 56, height: 56 }}><PixelSprite name="person" scale={3} /></span>
            <div className="col" style={{ gap: 4 }}>
              <b className="h" style={{ fontSize: 24 }}>{me.data?.nickname}</b>
              <span className="lbl">{me.data?.interests.map((c) => CATEGORY_LABEL[c]).join(' · ')}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '2px solid rgba(52,25,12,.12)', paddingTop: 12 }}>
            {cells.map(([label, n]) => (
              <div key={label} className="col" style={{ alignItems: 'center', gap: 0 }}>
                <span className="num" style={{ fontSize: 20, color: 'var(--ink)' }}>{n ?? '-'}</span>
                <span className="lbl">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </QueryState>
      <nav className="menu">
        {MENU.map((m) => (
          <Link key={m.to} to={m.to} className="menu-row">
            <span className="ic"><PixelSprite name={m.icon} scale={2} /></span>
            {m.label}
            <span className="chev"><PixelSprite name="i_chev" scale={2} /></span>
          </Link>
        ))}
      </nav>
    </>
  )
}
