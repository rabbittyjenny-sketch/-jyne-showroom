import { parseYouTubeId, youTubeThumb } from './youtube';
import type { Item, ItemType } from './types';

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** The picture that represents an item in the back office: its cover, else its first image / YouTube field. */
export function itemPicture(item: Item, type: ItemType | null): string | null {
  if (item.cover_image) return item.cover_image;
  for (const f of type?.fields ?? []) {
    const v = str(item.data[f.key]);
    if (!v) continue;
    if (f.type === 'image') return v;
    if (f.type === 'video') { const id = parseYouTubeId(v); if (id) return youTubeThumb(id); }
  }
  return null;
}
