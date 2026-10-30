/**
 * YouTube helpers for in-site playback (Live Notes on /courses, activity
 * clips on /articles). Admins paste any normal YouTube link; the site never
 * sends viewers out to youtube.com.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Accepts watch?v=, youtu.be/, /embed/, /shorts/, /live/, nocookie, or a bare 11-char ID. */
export function parseYouTubeId(input: string | null | undefined): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  if (ID_RE.test(raw)) return raw;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/')[1];
      return ID_RE.test(id) ? id : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v');
      if (v && ID_RE.test(v)) return v;
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch { /* not a URL */ }
  return null;
}

export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** YouTube Shorts are vertical (9:16) — the player sizes itself to match. */
export const isYouTubeShorts = (input: string | null | undefined) => /youtube\.com\/shorts\//i.test(input ?? '');

/* ── IFrame Player API (loaded once, on first use) ───────────────────── */

type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;
export interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2 };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
export type { YTPlayerState };

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => { apiPromise = null; reject(new Error('YouTube API failed to load')); };
    document.head.appendChild(s);
  });
  return apiPromise;
}
