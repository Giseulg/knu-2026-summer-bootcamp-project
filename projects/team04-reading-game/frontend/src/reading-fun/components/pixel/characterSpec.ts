/**
 * 읽기의 재미 — 픽셀아트 캐릭터 규격 (v0.2, 2026-11-18)
 *
 * 인물(소설 등장인물)은 아래 파츠 슬롯 규격을 따른다.
 * 개념 캐릭터는 몸통을 개념 도식으로 만든다 → diagramCharacter.ts / conceptCharacters.ts, 문서 §8
 *
 * 근거: neta.art 픽셀아트 크기 가이드 https://neta.art/explore/guide/pixel-art-sizes?locale=ko
 *  - 32x32: 요소당 4~6색, 총 12~16색, 3단계 램프, 1px 윤곽(순흑 대신 어두운 색)
 *  - 64x64: 요소당 4~8색, 총 16~32색, 재질당 3~5단계 램프, 눈 8~20칸·하이라이트 가능
 *  - 표시·내보내기는 정수배, 최근접 이웃 확대
 * 팔레트: src/styles/tokens.css 토큰(Cozy RPG Pixel System) 기준. source:'added'는 토큰에 없는 신규 램프.
 * 광원: 좌상단 (UI의 inset 하이라이트 방향과 동일)
 */

export type Hex = `#${string}`;

/* ───────────── 1. 색 램프 ───────────── */

export type RampId =
  | 'outline' | 'skin' | 'hairBrown' | 'hairGold' | 'hairBerry'
  | 'clothGreen' | 'clothAmber' | 'clothBerry' | 'clothParch' | 'clothSky'
  | 'leather' | 'metal' | 'gold' | 'eye' | 'blush';

export interface Ramp {
  id: RampId;
  /** 밝음 → 어두움. index 0 = 하이라이트 */
  steps: Hex[];
  role: string;
  source: 'token' | 'added';
}

export const RAMPS: Record<RampId, Ramp> = {
  outline:    { id: 'outline',    steps: ['#68381E', '#34190C'], role: '외곽선(0=밝은 면 내부선, 1=외곽)', source: 'token' },
  skin:       { id: 'skin',       steps: ['#FFE4C2', '#F5C99B', '#E8B974', '#B0743B'], role: '피부', source: 'token' },
  hairBrown:  { id: 'hairBrown',  steps: ['#B0743B', '#874B28', '#6A3A1E', '#4A2311'], role: '머리(갈색)', source: 'token' },
  hairGold:   { id: 'hairGold',   steps: ['#FFF2D6', '#F7C948', '#D97B29', '#7A3D0C'], role: '머리(금색)', source: 'token' },
  hairBerry:  { id: 'hairBerry',  steps: ['#FFD7F5', '#C57ABD', '#883E82', '#4D1F4A'], role: '머리(보라)', source: 'token' },
  clothGreen: { id: 'clothGreen', steps: ['#7FDB82', '#3FA34D', '#2B8739', '#1E3A1C'], role: '의상(모스 그린)', source: 'token' },
  clothAmber: { id: 'clothAmber', steps: ['#FD9844', '#D97B29', '#A85A1C', '#7A3D0C'], role: '의상(앰버)', source: 'token' },
  clothBerry: { id: 'clothBerry', steps: ['#FFD7F5', '#C57ABD', '#883E82', '#4D1F4A'], role: '의상(베리)', source: 'token' },
  clothParch: { id: 'clothParch', steps: ['#FFF8EC', '#F8E0B3', '#F3D097', '#B0743B'], role: '의상(셔츠·앞치마·종이)', source: 'token' },
  clothSky:   { id: 'clothSky',   steps: ['#C9ECF8', '#7FC8E8', '#3B8FBF', '#2F6FB0'], role: '의상(하늘색)', source: 'token' },
  leather:    { id: 'leather',    steps: ['#D9A35F', '#B7803F', '#8A5A3B', '#4A2F1D'], role: '신발·벨트·가방', source: 'token' },
  metal:      { id: 'metal',      steps: ['#FFFFFF', '#C9D3D6', '#8C9AA0', '#4F5B60', '#2C3438'], role: '금속(명도 대비로 표현)', source: 'added' },
  gold:       { id: 'gold',       steps: ['#FFF2D6', '#F7C948', '#D9A035', '#9A6A1F'], role: '장식 금속·단추', source: 'added' },
  eye:        { id: 'eye',        steps: ['#FFFFFF', '#5FB3D9', '#2F6FB0', '#34190C'], role: '눈(0=하이라이트, 3=동공)', source: 'token' },
  blush:      { id: 'blush',      steps: ['#FF9EB5'], role: '볼 홍조(강조색)', source: 'token' },
};

/* ───────────── 2. 해상도 등급 ───────────── */

export type Tier = 'S' | 'M';

export interface TierSpec {
  canvas: { w: number; h: number };
  /** 정수배만 허용 */
  displayScales: number[];
  usage: string;
  maxColorsTotal: number;      // 투명 제외
  maxRampSteps: number;        // 재질 1개당 단계 수
  headRatio: string;           // 머리:몸 비율
  headBox: { w: number; h: number };
  eye: { w: number; h: number; highlight: boolean };
}

export const TIERS: Record<Tier, TierSpec> = {
  S: {
    canvas: { w: 32, h: 32 }, displayScales: [2, 3, 4],
    usage: 'Village 맵 배치, 리스트 썸네일, 관계도 노드',
    maxColorsTotal: 16, maxRampSteps: 3, headRatio: '1:1',
    headBox: { w: 16, h: 14 }, eye: { w: 1, h: 2, highlight: false },
  },
  M: {
    canvas: { w: 64, h: 64 }, displayScales: [2, 3, 4],
    usage: '1.1 캐릭터 상세, 회상 질문·피드백 대화, 온보딩',
    maxColorsTotal: 32, maxRampSteps: 5, headRatio: '1:1.2 (2.2등신)',
    headBox: { w: 30, h: 27 }, eye: { w: 4, h: 5, highlight: true },
  },
};

/* ───────────── 3. 요소(파츠) 슬롯 ───────────── */

export type PartSlot =
  | 'hairBack' | 'body' | 'bottom' | 'shoes' | 'top' | 'head'
  | 'face' | 'hairFront' | 'headAcc' | 'prop' | 'fx';

export interface Box { x: number; y: number; w: number; h: number }

export interface PartSpec {
  slot: PartSlot;
  /** 그리기 순서(작을수록 뒤) */
  z: number;
  /** 각 등급 캔버스 내 허용 영역 */
  box: Record<Tier, Box>;
  allowedRamps: RampId[];
  /** 요소 내 고유 색 수(외곽선 포함) */
  maxColors: Record<Tier, number>;
  /** 하이라이트(램프 index 0) 사용 허용 */
  highlight: boolean;
  required: boolean;
}

const HAIR: RampId[] = ['outline', 'hairBrown', 'hairGold', 'hairBerry'];
const CLOTH: RampId[] = ['outline', 'clothGreen', 'clothAmber', 'clothBerry', 'clothParch', 'clothSky', 'gold', 'leather'];

export const PARTS: PartSpec[] = [
  { slot: 'hairBack',  z: 0,  box: { S: { x: 7, y: 1, w: 18, h: 18 },  M: { x: 14, y: 2, w: 36, h: 36 } }, allowedRamps: HAIR, maxColors: { S: 4, M: 6 }, highlight: true,  required: false },
  { slot: 'body',      z: 1,  box: { S: { x: 9, y: 14, w: 14, h: 16 }, M: { x: 18, y: 28, w: 28, h: 32 } }, allowedRamps: ['outline', 'skin'], maxColors: { S: 3, M: 5 }, highlight: false, required: true },
  { slot: 'bottom',    z: 2,  box: { S: { x: 10, y: 22, w: 12, h: 7 }, M: { x: 20, y: 44, w: 24, h: 14 } }, allowedRamps: CLOTH, maxColors: { S: 4, M: 6 }, highlight: false, required: true },
  { slot: 'shoes',     z: 3,  box: { S: { x: 9, y: 28, w: 14, h: 3 },  M: { x: 18, y: 56, w: 28, h: 7 } },  allowedRamps: ['outline', 'leather', 'clothAmber', 'clothBerry'], maxColors: { S: 3, M: 4 }, highlight: false, required: true },
  { slot: 'top',       z: 4,  box: { S: { x: 8, y: 15, w: 16, h: 9 },  M: { x: 16, y: 29, w: 32, h: 18 } }, allowedRamps: CLOTH, maxColors: { S: 5, M: 8 }, highlight: false, required: true },
  { slot: 'head',      z: 5,  box: { S: { x: 8, y: 2, w: 16, h: 14 },  M: { x: 17, y: 3, w: 30, h: 27 } },  allowedRamps: ['outline', 'skin'], maxColors: { S: 3, M: 5 }, highlight: false, required: true },
  { slot: 'face',      z: 6,  box: { S: { x: 10, y: 8, w: 12, h: 6 },  M: { x: 21, y: 15, w: 22, h: 12 } }, allowedRamps: ['outline', 'eye', 'blush', 'skin'], maxColors: { S: 3, M: 6 }, highlight: true, required: true },
  { slot: 'hairFront', z: 7,  box: { S: { x: 7, y: 1, w: 18, h: 9 },   M: { x: 15, y: 1, w: 34, h: 18 } },  allowedRamps: HAIR, maxColors: { S: 4, M: 6 }, highlight: true, required: true },
  { slot: 'headAcc',   z: 8,  box: { S: { x: 6, y: 0, w: 20, h: 6 },   M: { x: 12, y: 0, w: 40, h: 12 } },  allowedRamps: [...CLOTH, 'metal'], maxColors: { S: 3, M: 5 }, highlight: true, required: false },
  { slot: 'prop',      z: 9,  box: { S: { x: 20, y: 14, w: 12, h: 14 }, M: { x: 40, y: 26, w: 24, h: 28 } }, allowedRamps: [...CLOTH, 'metal'], maxColors: { S: 4, M: 7 }, highlight: true, required: false },
  { slot: 'fx',        z: 10, box: { S: { x: 0, y: 0, w: 32, h: 32 },  M: { x: 0, y: 0, w: 64, h: 64 } },   allowedRamps: ['gold', 'clothSky', 'blush'], maxColors: { S: 2, M: 3 }, highlight: true, required: false },
];

/* ───────────── 4. 에셋 데이터 ───────────── */

/** 픽셀 1칸 = legend 문자 1개. '.' = 투명 */
export interface PartAsset {
  id: string;
  slot: PartSlot;
  tier: Tier;
  /** 캔버스 좌상단 기준 위치 (PartSpec.box 내부여야 함) */
  offset: { x: number; y: number };
  rows: string[];
  legend: Record<string, { ramp: RampId; step: number }>;
}

export interface CharacterDef {
  id: string;
  name: string;
  /** 서비스 개념 연결 (예: 등장인물, 회상, 가설) */
  concept: string;
  tier: Tier;
  parts: PartAsset[];
  /** 같은 형태로 색만 바꿀 때 사용: 원래 램프 → 대체 램프 (단계 수 같아야 함) */
  recolor?: Partial<Record<RampId, RampId>>;
}

/* ───────────── 5. 검증 ───────────── */

export function resolveColor(a: PartAsset, ch: string, recolor?: CharacterDef['recolor']): Hex | null {
  if (ch === '.') return null;
  const e = a.legend[ch];
  if (!e) throw new Error(`${a.id}: legend에 '${ch}' 없음`);
  const ramp = RAMPS[recolor?.[e.ramp] ?? e.ramp];
  const hex = ramp.steps[e.step];
  if (!hex) throw new Error(`${a.id}: ${ramp.id}[${e.step}] 없음`);
  return hex;
}

export function validateCharacter(c: CharacterDef): string[] {
  const errs: string[] = [];
  const tier = TIERS[c.tier];
  const all = new Set<Hex>();
  const stepsByRamp: Partial<Record<RampId, Set<number>>> = {};
  for (const a of c.parts) {
    const spec = PARTS.find((p) => p.slot === a.slot)!;
    const b = spec.box[c.tier];
    const h = a.rows.length, w = Math.max(...a.rows.map((r) => r.length));
    if (a.offset.x < b.x || a.offset.y < b.y || a.offset.x + w > b.x + b.w || a.offset.y + h > b.y + b.h)
      errs.push(`${a.id}: 허용 영역 ${JSON.stringify(b)} 초과`);
    const used = new Set<Hex>();
    for (const row of a.rows) for (const ch of row) {
      if (ch === '.') continue;
      const e = a.legend[ch];
      if (!e) { errs.push(`${a.id}: legend에 '${ch}' 없음`); continue; }
      if (!spec.allowedRamps.includes(e.ramp)) errs.push(`${a.id}: ${e.ramp} 램프 사용 불가`);
      if (e.step === 0 && !spec.highlight && e.ramp !== 'outline') errs.push(`${a.id}: 하이라이트 사용 불가 요소`);
      (stepsByRamp[e.ramp] ??= new Set()).add(e.step);
      const hex = resolveColor(a, ch, c.recolor);
      if (hex) { used.add(hex); all.add(hex); }
    }
    if (used.size > spec.maxColors[c.tier]) errs.push(`${a.id}: 색 ${used.size}개 > 허용 ${spec.maxColors[c.tier]}`);
  }
  for (const [r, set] of Object.entries(stepsByRamp))
    if (r !== 'outline' && set!.size > tier.maxRampSteps) errs.push(`${r}: ${c.tier} 등급 램프 단계 ${set!.size} > ${tier.maxRampSteps}`);
  for (const p of PARTS) if (p.required && !c.parts.some((a) => a.slot === p.slot)) errs.push(`필수 요소 ${p.slot} 없음`);
  if (all.size > tier.maxColorsTotal) errs.push(`총 색 ${all.size}개 > 허용 ${tier.maxColorsTotal}`);
  return errs;
}

/** 파츠를 z순으로 합성해 SVG 문자열 생성 (scale은 정수) */
export function renderSVG(c: CharacterDef, scale: number): string {
  if (!Number.isInteger(scale)) throw new Error('scale은 정수만 허용');
  const { w, h } = TIERS[c.tier].canvas;
  const z = (s: PartSlot) => PARTS.find((p) => p.slot === s)!.z;
  let rects = '';
  for (const a of [...c.parts].sort((p, q) => z(p.slot) - z(q.slot)))
    a.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const hex = resolveColor(a, ch, c.recolor);
      if (hex) rects += `<rect x="${a.offset.x + x}" y="${a.offset.y + y}" width="1" height="1" fill="${hex}"/>`;
    }));
  return `<svg width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" style="image-rendering:pixelated">${rects}</svg>`;
}
