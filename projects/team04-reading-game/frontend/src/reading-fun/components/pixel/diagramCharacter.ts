/**
 * 개념 도식 캐릭터 생성기 (규격 docs/pixel-character-spec.md §8)
 *
 * 개념 캐릭터의 몸통은 그 개념을 설명하는 도식(그래프·자료구조 그림·타임라인)이다.
 * 정의(DiagramCharacterDef)는 도식의 선·면을 S 격자(32x32) 좌표로 적고,
 * 생성기가 1px 외곽선·좌상단 광원 음영·눈·팔다리를 붙여 PixelSprite용 행 문자열로 바꾼다.
 * M(64x64)은 같은 정의를 좌표 2배로 다시 래스터화한다(외곽선은 1px 유지, 눈 하이라이트 추가).
 */
import { RAMPS, TIERS, type Hex, type RampId, type Tier } from './characterSpec'

export type Pt = [number, number]
/** 1 = 주 램프, 2 = 보조 램프 */
type Tone = 1 | 2

export type DiagramPrim =
  /** 꺾은선(두께 2). 도식의 선·화살표 몸체 */
  | { kind: 'line'; pts: Pt[]; tone?: Tone; w?: 1 | 2 }
  /** 채운 사각형. 막대·칸·블록 */
  | { kind: 'rect'; x: number; y: number; w: number; h: number; tone?: Tone }
  /** 원판 / 고리 */
  | { kind: 'disc'; cx: number; cy: number; r: number; tone?: Tone }
  | { kind: 'ring'; cx: number; cy: number; r: number; w: number; tone?: Tone }
  /** 채운 다각형. 화살촉·레이더 영역 */
  | { kind: 'poly'; pts: Pt[]; tone?: Tone }
  /** 칸 비우기. 칸 사이 구분(외곽선이 생김) */
  | { kind: 'clear'; x: number; y: number; w: number; h: number }

export interface DiagramRig {
  /** 눈 중심. 도식의 꼭짓점·노드·칸 위에 둔다. look = 동공 방향 */
  eyes: Array<{ x: number; y: number; look?: -1 | 0 | 1 }>
  /** 팔: from(몸통 가장자리) → to(손 위치) */
  arms?: Array<{ from: Pt; to: Pt }>
  /** 다리: from → to(발 위치) */
  legs?: Array<{ from: Pt; to: Pt }>
  mouth?: { x: number; y: number; w: number }
  /** 도식 안의 강조점(예: FCFS의 현재 헤드 위치) */
  markers?: Pt[]
  blush?: boolean
}

export interface DiagramCharacterDef {
  key: string
  /** 도식 이름과 출처 개념 */
  diagram: string
  ramp: RampId
  ramp2?: RampId
  body: DiagramPrim[]
  rig: DiagramRig
}

/* ───── 팔레트 문자 ───── */
// k 외곽선, a/m/d 주 램프 밝음·중간·어두움, e/f/g 보조 램프, w 흰자, x 강조점, p 홍조
const ACCENT = '#E0674F'
const BLUSH = RAMPS.blush.steps[0]

function rampColors(id: RampId): [Hex, Hex, Hex] {
  const s = RAMPS[id].steps
  // S 등급 램프 3단계: 밝음(0)·중간(1)·어두움(2)
  return [s[0], s[1], s[Math.min(2, s.length - 1)]]
}

type Cell = { tone: Tone; fill: boolean } | null

export interface BuiltSprite {
  rows: string[]
  colors: Record<string, string>
}

export function buildDiagramSprite(def: DiagramCharacterDef, tier: Tier = 'S'): BuiltSprite {
  const { w: W, h: H } = TIERS[tier].canvas
  const k = tier === 'M' ? 2 : 1
  const core: Cell[][] = Array.from({ length: H }, () => Array<Cell>(W).fill(null))
  const out: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('.'))
  const inb = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H
  const set = (x: number, y: number, c: Cell) => { if (inb(x, y)) core[y][x] = c }

  const plotLine = (a: Pt, b: Pt, put: (x: number, y: number) => void) => {
    let [x0, y0] = [Math.round(a[0]), Math.round(a[1])]
    const [x1, y1] = [Math.round(b[0]), Math.round(b[1])]
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      put(x0, y0)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x0 += sx }
      if (e2 <= dx) { err += dx; y0 += sy }
    }
  }
  const sc = (p: Pt): Pt => [p[0] * k, p[1] * k]
  const insidePoly = (pts: Pt[], x: number, y: number) => {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }

  /* 1. 도식 몸통 */
  for (const p of def.body) {
    const tone = ('tone' in p && p.tone) || 1
    switch (p.kind) {
      case 'line': {
        const t = (p.w ?? 2) * k
        for (let i = 1; i < p.pts.length; i++)
          plotLine(sc(p.pts[i - 1]), sc(p.pts[i]), (x, y) => {
            for (let oy = 0; oy < t; oy++) for (let ox = 0; ox < t; ox++) set(x + ox, y + oy, { tone, fill: false })
          })
        break
      }
      case 'rect':
        for (let y = p.y * k; y < (p.y + p.h) * k; y++) for (let x = p.x * k; x < (p.x + p.w) * k; x++) set(x, y, { tone, fill: true })
        break
      case 'clear':
        for (let y = p.y * k; y < (p.y + p.h) * k; y++) for (let x = p.x * k; x < (p.x + p.w) * k; x++) set(x, y, null)
        break
      case 'disc':
      case 'ring': {
        const r = p.r * k, inner = p.kind === 'ring' ? (p.r - p.w) * k : -1
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const d = Math.hypot(x + 0.5 - p.cx * k, y + 0.5 - p.cy * k)
          if (d <= r && d > inner) set(x, y, { tone, fill: p.kind === 'disc' })
        }
        break
      }
      case 'poly': {
        const pts = p.pts.map(sc)
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (insidePoly(pts, x + 0.5, y + 0.5)) set(x, y, { tone, fill: true })
        break
      }
    }
  }

  /* 2. 손·발(몸통과 같은 램프 덩어리) */
  const blob = (c: Pt, w: number, h: number) => {
    const [cx, cy] = sc(c)
    const bw = w * k, bh = h * k
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) set(cx - Math.floor(bw / 2) + x, cy - Math.floor(bh / 2) + y, { tone: 1, fill: true })
  }
  def.rig.arms?.forEach((a) => blob(a.to, 2, 2))
  def.rig.legs?.forEach((l) => blob(l.to, 4, 2))

  /* 3. 음영: 좌상단 광원. 면은 위 가장자리 밝음, 아래·오른쪽 가장자리 어두움 / 선은 아래 가장자리 어두움 */
  const isCore = (x: number, y: number) => inb(x, y) && core[y][x] !== null
  const L = { 1: ['a', 'm', 'd'], 2: ['e', 'f', 'g'] } as const
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = core[y][x]
    if (!c) continue
    const [lt, md, dk] = L[c.tone]
    const up = !isCore(x, y - 1), down = !isCore(x, y + 1), right = !isCore(x + 1, y), left = !isCore(x - 1, y)
    if (c.fill) out[y][x] = up || (left && !down) ? lt : down || right ? dk : md
    else out[y][x] = down ? dk : up && left ? lt : md
  }

  /* 4. 1px 외곽선(8방향) */
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (core[y][x]) continue
    let near = false
    for (let oy = -1; oy <= 1 && !near; oy++) for (let ox = -1; ox <= 1; ox++) if ((ox || oy) && isCore(x + ox, y + oy)) { near = true; break }
    if (near) out[y][x] = 'k'
  }

  /* 5. 팔다리: 외곽선 색 1px 선. 몸통 위는 덮지 않음 */
  const limb = (a: Pt, b: Pt) =>
    plotLine(sc(a), sc(b), (x, y) => {
      for (let o = 0; o < k; o++) if (inb(x + o, y) && !core[y][x + o]) out[y][x + o] = 'k'
    })
  def.rig.arms?.forEach((a) => limb(a.from, a.to))
  def.rig.legs?.forEach((l) => limb(l.from, l.to))

  /* 6. 얼굴·강조점: 템플릿 덮어쓰기 */
  const stamp = (cx: number, cy: number, tpl: string[]) => {
    const ox = cx - Math.floor(tpl[0].length / 2), oy = cy - Math.floor(tpl.length / 2)
    tpl.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && inb(ox + x, oy + y)) out[oy + y][ox + x] = ch }))
  }
  const EYE_S = (l: number) => ['.kkk.', 'kwwwk', l < 0 ? 'kkwwk' : l > 0 ? 'kwwkk' : 'kwkwk', 'kwwwk', '.kkk.']
  // M: 2x2 동공 + 좌상단 하이라이트 1칸
  const EYE_M = (l: number) => {
    const c = l < 0 ? 3 : l > 0 ? 5 : 4
    const row = (top: boolean) => [...'kwwwwwk'].map((ch, i) => (i === c - 1 ? (top ? 'w' : 'k') : i === c ? 'k' : ch)).join('')
    // 행 3: 동공 윗줄(왼쪽 칸 = 하이라이트), 행 4: 동공 아랫줄
    return ['..kkk..', '.kwwwk.', 'kwwwwwk', row(true), row(false), '.kwwwk.', '..kkk..']
  }
  for (const e of def.rig.eyes) {
    const [x, y] = sc([e.x, e.y])
    stamp(x, y, tier === 'M' ? EYE_M(e.look ?? 0) : EYE_S(e.look ?? 0))
  }
  for (const m of def.rig.markers ?? []) {
    const [x, y] = sc(m)
    stamp(x, y, tier === 'M' ? ['.kkkk.', 'kxxxxk', 'kxwxxk', 'kxxxxk', 'kxxxxk', '.kkkk.'] : ['.kk.', 'kxxk', 'kxxk', '.kk.'])
  }
  if (def.rig.mouth) {
    const [x, y] = sc([def.rig.mouth.x, def.rig.mouth.y])
    for (let i = 0; i < def.rig.mouth.w * k; i++) if (inb(x + i, y)) out[y][x + i] = 'k'
  }
  if (def.rig.blush)
    for (const e of def.rig.eyes) {
      const [x, y] = sc([e.x, e.y + 3])
      for (let i = 0; i < k; i++) for (const dx of [-2 * k, 2 * k - 1]) if (inb(x + dx + i, y) && out[y][x + dx + i] !== 'k' && out[y][x + dx + i] !== 'w') out[y][x + dx + i] = 'p'
    }

  const [a, m, d] = rampColors(def.ramp)
  const [e, f, g] = rampColors(def.ramp2 ?? def.ramp)
  return {
    rows: out.map((r) => r.join('')),
    colors: { k: RAMPS.outline.steps[1], a, m, d, e, f, g, w: '#FFFFFF', x: ACCENT, p: BLUSH },
  }
}
