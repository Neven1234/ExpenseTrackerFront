/** The mockup palette. Colours are assigned per category id so they never shuffle. */
const PALETTE = ['#2c5f7c', '#4a7c59', '#b07d3a', '#6b5b95', '#a8322b', '#2f6f6f', '#8a6d3b', '#5b6070'];

export const FALLBACK_COLOR = '#8b8f9c';

export function categoryColor(categoryId: string | null | undefined): string {
  if (!categoryId) {
    return FALLBACK_COLOR;
  }

  let hash = 0;

  for (let index = 0; index < categoryId.length; index++) {
    hash = (hash * 31 + categoryId.charCodeAt(index)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length] ?? FALLBACK_COLOR;
}
