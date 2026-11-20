import { memo, type ReactNode } from 'react'
import { PALETTE, SPRITES, SPRITE_COLORS } from './sprites'

interface Props {
  name: string
  /** 1px 당 화면 픽셀 수 */
  scale?: number
  /** 이 크기(px) 안에 들어가는 최대 정수 배율로 그림. scale 보다 우선.
   *  128 이상이고 M 등급('<name>@M')이 있으면 M을 사용 */
  fit?: number
  /** 팔레트 문자 덮어쓰기. 예: { G: '#c57abd' } */
  colors?: Record<string, string>
  /** 아이콘(i_*)의 선 색. 기본 currentColor */
  color?: string
  title?: string
  className?: string
}

function PixelSpriteBase({ name: base, scale: baseScale = 3, fit, colors, color, title, className }: Props) {
  const name = fit && fit >= 128 && SPRITES[`${base}@M`] ? `${base}@M` : base
  const rows = SPRITES[name]
  if (!rows) return null
  const own = SPRITE_COLORS[name]
  const pal = own || colors ? { ...PALETTE, ...own, ...colors } : PALETTE
  const isIcon = name.startsWith('i_')
  const w = Math.max(...rows.map((r) => r.length))
  const h = rows.length
  const scale = fit ? Math.max(1, Math.floor(fit / Math.max(w, h))) : baseScale

  const rects: ReactNode[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.' || ch === ' ') continue
      const fill = isIcon && ch === 'k' ? (color ?? 'currentColor') : pal[ch]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />)
    }
  })

  return (
    <svg
      className={['px', className].filter(Boolean).join(' ')}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects}
    </svg>
  )
}

export const PixelSprite = memo(PixelSpriteBase)
