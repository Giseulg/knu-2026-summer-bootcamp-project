import one from './story/01.txt?raw';
import two from './story/02.txt?raw';
import three from './story/03.txt?raw';
import four from './story/04.txt?raw';

// Paragraphs are preserved verbatim. A page holds a small group; animation never
// changes text, reveals another page, or marks anything as read.
export const pages = [one, two, three, four].flatMap((text, section) => {
  const paragraphs = text.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/).slice(2);
  const groups: string[][] = [];
  let group: string[] = [];
  let size = 0;
  for (const paragraph of paragraphs) {
    if (group.length && (size + paragraph.length > 155 || group.length >= 3)) {
      groups.push(group);
      group = [];
      size = 0;
    }
    group.push(paragraph);
    size += paragraph.length;
  }
  if (group.length) groups.push(group);
  return groups.map((paragraphs, part) => ({ section: section + 1, part: part + 1, paragraphs }));
});

export const STORAGE_KEY = 'spokeeper:motion-reader:rain-v1';
export type Effect = 'wave' | 'breathe' | 'ink';
export type Passage = { page: number; paragraph: number };
export type SavedReading = { page: number; confirmed: number[]; effect: Effect; still: boolean; fontSize: number; auto: boolean; pocket: Passage[] };
export const initialReading: SavedReading = { page: 0, confirmed: [], effect: 'wave', still: false, fontSize: 25, auto: false, pocket: [] };

export function readSaved(value: string | null): SavedReading {
  try {
    const data = JSON.parse(value ?? 'null');
    if (!data || typeof data !== 'object') return initialReading;
    return {
      page: Number.isInteger(data.page) && data.page >= 0 && data.page < pages.length ? data.page : 0,
      confirmed: Array.isArray(data.confirmed)
        ? [...new Set<number>(data.confirmed.filter((p: unknown) => Number.isInteger(p) && Number(p) >= 0 && Number(p) < pages.length))]
        : [],
      effect: ['wave', 'breathe', 'ink'].includes(data.effect) ? data.effect : 'wave',
      still: data.still === true,
      fontSize: [22, 25, 29].includes(data.fontSize) ? data.fontSize : 25,
      auto: data.auto === true,
      pocket: Array.isArray(data.pocket) ? data.pocket.filter((item: Passage, index: number, all: Passage[]) =>
        item && Number.isInteger(item.page) && Number.isInteger(item.paragraph) &&
        item.page >= 0 && item.page < pages.length && item.paragraph >= 0 &&
        item.paragraph < pages[item.page].paragraphs.length &&
        all.findIndex(other => other?.page === item.page && other?.paragraph === item.paragraph) === index,
      ) : [],
    };
  } catch { return initialReading; }
}
