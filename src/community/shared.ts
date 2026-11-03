export interface ArticleRow {
  id: string; slug: string; title: string; summary: string; kind: string; target_url: string;
  body: string | null; cover_image_url: string | null; author: string | null; tags: string[] | null;
  meta_description: string | null; video_url: string | null; created_at: string; updated_at: string;
  audio_url: string | null; audio_title: string | null; audio_image_url: string | null; audio_duration_sec: number | null;
}

/** Article kinds (same set and labels as Creatr365's community kinds, without Live Notes / quiz / events). */
export const KIND_LABEL: Record<string, string> = {
  video: 'คลิปกิจกรรม', blog: 'บทความ', tool: 'เครื่องมือ', news: 'ข่าวกิจกรรม', update: 'อัปเดต', community: 'คอมมูนิตี้',
};

/** The page's groups, in order (Creatr365 Articles.tsx GROUPS), each with one color of the original blog page. */
export const GROUPS: { label: string; color: string; kinds: string[] }[] = [
  { label: 'คลิปกิจกรรม', color: 'blue', kinds: ['video'] },
  { label: 'บทความ', color: 'yellow', kinds: ['blog', 'tool'] },
  { label: 'ข่าวกิจกรรม', color: 'green', kinds: ['news', 'update', 'community'] },
];

export const COLOR_HEX: Record<string, string> = { blue: '#4285F4', yellow: '#F5B800', green: '#34A853', red: '#EA4335', dark: '#1A1A1A' };

export const colorOfKind = (kind: string) => GROUPS.find((g) => g.kinds.includes(kind))?.color ?? 'dark';
