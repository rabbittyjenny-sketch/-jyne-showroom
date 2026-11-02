// Copied from the Creatr365 repo (src/components/live-notes/LiveNotePlayerDialog.tsx) and trimmed for iDEAS365:
// same in-site YouTube player (no leaving to youtube.com, playsinline, fallback embed), without the
// Live Notes view logging and course links, which belong to Creatr365 only.
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { loadYouTubeApi, parseYouTubeId, isYouTubeShorts, type YTPlayer } from '@/lib/youtube';
import { RotateCcw } from 'lucide-react';

export interface PlayableClip {
  id: string;
  title: string;
  summary: string;
  body?: string | null;
  video_url: string | null;
}

export const ClipPlayerDialog: React.FC<{ clip: PlayableClip | null; onClose: () => void; label: string; accent: string }> = ({ clip, onClose, label, accent }) => {
  // callback-ref state: the dialog content mounts through a portal one render later
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const [ended, setEnded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const videoId = parseYouTubeId(clip?.video_url);

  useEffect(() => {
    if (!clip || !videoId || !mountEl) return;
    let cancelled = false;
    let player: YTPlayer | null = null;
    setEnded(false);
    setFallback(false);
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        const el = document.createElement('div');
        mountEl.innerHTML = '';
        mountEl.appendChild(el);
        player = new YT.Player(el, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, autoplay: 1 },
          events: { onStateChange: (e: { data: number }) => { if (e.data === YT.PlayerState.ENDED) setEnded(true); } },
        });
      })
      .catch(() => { if (!cancelled) setFallback(true); });
    return () => {
      cancelled = true;
      try { player?.destroy(); } catch { /* already gone */ }
    };
  }, [clip, videoId, replayKey, mountEl]);

  // sized to the video's own shape: Shorts 9:16 narrow, 16:9 wide; always fully visible
  const vertical = isYouTubeShorts(clip?.video_url);

  return (
    <Dialog open={!!clip} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-none p-0 gap-0 overflow-hidden rounded-none sm:rounded-none border-t-4 bg-white max-h-[94vh] overflow-y-auto"
        style={{
          borderTopColor: accent,
          width: vertical ? 'min(calc(100vw - 1rem), calc(78vh * 9 / 16))' : 'min(calc(100vw - 1rem), 1100px, calc(70vh * 16 / 9))',
        }}
      >
        <div className="h-11 px-4 flex items-center border-b">
          <span className="text-xs font-semibold" style={{ color: accent }}>{label}</span>
        </div>
        <div className={`relative bg-black w-full ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
          {!videoId ? (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/60 px-6 text-center">ลิงก์วิดีโอของคลิปนี้ไม่ถูกต้อง</div>
          ) : fallback ? (
            <iframe
              title={clip?.title}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div ref={setMountEl} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
          )}
          {ended && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-5">
              <div className="text-white text-center">
                <p className="text-sm text-white/60 mb-3">ดูจบแล้ว</p>
                <button onClick={() => setReplayKey((k) => k + 1)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-white/30 text-white">
                  <RotateCcw className="w-4 h-4" aria-hidden="true" /> ดูอีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <DialogTitle className="cm-dialog-title">{clip?.title}</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{clip?.summary}</DialogDescription>
          {clip?.body && <div className="cm-post-content" dangerouslySetInnerHTML={{ __html: clip.body }} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
