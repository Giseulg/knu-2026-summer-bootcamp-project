import { animate } from 'motion/mini';
import type { Effect } from './story';

// One cancellable sweep. Timers, styles and native animations all belong to this
// run, so a page change, hidden tab or unmount cannot leave delayed motion behind.
export function playMotion(
  root: HTMLElement,
  paragraphs: number[],
  effect: Effect,
  still: boolean,
  onParagraph: (index: number) => void,
  onDone: () => void,
) {
  const controls: { stop: () => void }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let cursor = 250;
  for (const paragraph of paragraphs) {
    const letters = [...root.querySelectorAll<HTMLElement>(`[data-paragraph="${paragraph}"] [data-letter]`)];
    const sweep = Math.max(1.4, Math.min(5, letters.length * 0.055));
    timers.push(setTimeout(() => {
      if (cancelled) return;
      onParagraph(paragraph);
      if (still) return;
      letters.forEach((letter, index) => {
        const keyframes = effect === 'wave'
          ? { transform: ['translateY(0px)', 'translateY(-5px)', 'translateY(2px)', 'translateY(0px)'] }
          : effect === 'breathe'
            ? { transform: ['scale(1)', 'scale(1.09)', 'scale(1)'] }
            : { color: ['#243b36', '#a3682d', '#243b36'] };
        controls.push(animate(letter, keyframes, { duration: 0.7, delay: index * sweep / Math.max(1, letters.length), ease: 'easeInOut' }));
      });
    }, cursor));
    cursor += (sweep + 1.1) * 1000;
  }
  const cleanup = () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    controls.forEach(control => control.stop());
    root.querySelectorAll<HTMLElement>('[data-letter]').forEach(letter => letter.removeAttribute('style'));
  };
  timers.push(setTimeout(() => { cleanup(); onDone(); }, cursor));
  return cleanup;
}
