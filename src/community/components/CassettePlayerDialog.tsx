// Copied from the Creatr365 repo (src/components/podcast/CassettePlayerDialog.tsx); logs to iDEAS365's own i365_log_podcast_play().
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastArticle {
  id: string;
  title: string;
  audio_url: string;
  audio_duration_sec?: number | null;
  /** Small sticker picture shown on the cassette label (optional). */
  image_url?: string | null;
}

interface Props {
  article: PodcastArticle | null;
  onClose: () => void;
}

const GOLD = '#C0A060';
const SKIP_SECONDS = 15;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
const LOG_EVERY_SECONDS = 10;

// A pocket cassette recorder: speaker on top, cassette bay, tape counter /
// seek strip, volume vents, and a row of six keys at the bottom. The picture
// is drawn here (viewBox 300 × 540); every control is a transparent button
// laid over its drawn part by the boxes below (drawing units), so it scales
// with the picture and clicking the picture works like a normal player.
const W = 300;
const H = 540;
type Box = { x: number; y: number; w: number; h: number };
const KEY_Y = 488;
const KEY_W = 40;
const KEY_H = 38;
const keyX = (i: number) => 23 + i * 43;
const SEEK: Box = { x: 24, y: 372, w: 252, h: 20 };
const VENTS: Box = { x: 172, y: 412, w: 106, h: 40 };
const VENT_COUNT = 8;
// where the podcast name and the sticker picture sit on the cassette
const TITLE_BOX: Box = { x: 96, y: 243, w: 154, h: 26 };
const STICKER_BOX: Box = { x: 48, y: 277, w: 38, h: 38 };

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const boxStyle = (b: Box): React.CSSProperties => ({
  left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H),
});

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
};

const newSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/**
 * Floating cassette player for an article's podcast (articles.audio_url).
 * Not a modal: the page behind stays usable and it closes only with its ✕.
 * The podcast name (audio_title, else the article title — never the file
 * name) is written on the cassette label and the optional sticker picture
 * sits in the "A SIDE" box. Listening is logged through log_podcast_play() —
 * first play, every 10 s of listening, pause/end/close — which also works
 * for visitors who are not logged in.
 */
export const CassettePlayerDialog: React.FC<Props> = ({ article, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef('');
  const startedRef = useRef(false);
  const listenedRef = useRef(0);
  const lastLoggedRef = useRef(-1);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(article?.audio_duration_sec ?? 0);
  const [volume, setVolume] = useState(1);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [flash, setFlash] = useState<'rew' | 'ff' | null>(null);
  const [failed, setFailed] = useState(false);

  const log = useCallback(() => {
    const a = audioRef.current;
    if (!article || !a || !startedRef.current) return;
    const dur = a.duration || 0;
    const progress = dur ? Math.round((a.currentTime / dur) * 100) : 0;
    const listened = Math.round(listenedRef.current);
    lastLoggedRef.current = listened;
    supabase.rpc('i365_log_podcast_play', {
      _article_id: article.id,
      _play_session: sessionRef.current,
      _progress_pct: progress,
      _listened_seconds: listened,
    }).then(({ error }) => { if (error) console.warn('i365_log_podcast_play', error.message); });
  }, [article]);

  // New session each time the pop-up opens on an article.
  useEffect(() => {
    if (!article) return;
    sessionRef.current = newSessionId();
    startedRef.current = false;
    listenedRef.current = 0;
    lastLoggedRef.current = -1;
    setPlaying(false); setStarted(false); setEnded(false); setFailed(false);
    setTime(0); setDuration(article.audio_duration_sec ?? 0); setSpeedIdx(0);
    return () => {
      // switching article: send the final numbers (the <audio> is replaced/unmounted with it)
      log();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  // Count real listening time (not seeks) once a second while playing.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      listenedRef.current += 1;
      if (listenedRef.current - lastLoggedRef.current >= LOG_EVERY_SECONDS) log();
    }, 1000);
    return () => clearInterval(id);
  }, [playing, log]);

  const play = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.ended) a.currentTime = 0;
    a.play().catch(() => setFailed(true));
  };
  const pause = () => audioRef.current?.pause();
  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setTime(0); setStarted(false); setEnded(false);
  };
  const skip = (delta: number, which: 'rew' | 'ff') => {
    const a = audioRef.current;
    if (!a) return;
    const max = a.duration || duration || 0;
    a.currentTime = Math.max(0, Math.min(max || Infinity, a.currentTime + delta));
    setTime(a.currentTime);
    setFlash(which);
    window.setTimeout(() => setFlash(null), 160);
  };
  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const progress = duration ? Math.min(1, time / duration) : 0;
  const speed = SPEEDS[speedIdx];

  // Tape moves from the left reel to the right one as the program plays.
  const rLeft = 20 - 10 * progress;
  const rRight = 11 + 10 * progress;
  const spin = playing ? '' : ' pc-paused';

  const pressed = (on: boolean) => (on ? { y: 2, top: '#9c9992', bottom: '#77746e' } : { y: 0, top: '#e6e4de', bottom: '#b7b4ac' });
  const kPause = pressed(started && !playing && !ended);
  const kPlay = pressed(playing);
  const kRew = pressed(flash === 'rew');
  const kFf = pressed(flash === 'ff');
  const kStop = pressed(false);
  const kSpeed = pressed(false);
  const keys = [
    { label: 'PAUSE', aria: 'หยุดชั่วคราว', k: kPause, on: pause },
    { label: 'PLAY', aria: 'เล่น', k: kPlay, on: play },
    { label: 'REW', aria: `ย้อนกลับ ${SKIP_SECONDS} วินาที`, k: kRew, on: () => skip(-SKIP_SECONDS, 'rew') },
    { label: 'FF', aria: `ข้ามไป ${SKIP_SECONDS} วินาที`, k: kFf, on: () => skip(SKIP_SECONDS, 'ff') },
    { label: 'STOP', aria: 'หยุด', k: kStop, on: stop },
    { label: 'SPEED', aria: `ความเร็ว ${speed}x (กดเพื่อเปลี่ยน)`, k: kSpeed, on: cycleSpeed },
  ];

  if (!article) return null;

  const ICON = '#262626';
  const iconY = (i: number) => KEY_Y + keys[i].k.y;
  const cx = (i: number) => keyX(i) + KEY_W / 2;
  const litVents = Math.round(volume * VENT_COUNT);
  const titleX = TITLE_BOX.x + 2;
  const status = failed ? 'ERROR' : ended ? 'END' : playing ? '▶ PLAY' : started ? '❚❚ PAUSE' : 'STOP';

  return (
    <section
      role="region"
      aria-label="เครื่องเล่น Podcast"
      className="section-accent fixed z-[60] bottom-3 right-3 sm:right-4 sm:bottom-4 w-[min(calc(100vw-1.5rem),290px)] bg-[#0e0e0e] border border-white/10 border-t-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      style={{ '--hover-accent': GOLD, '--section-accent': GOLD, borderTopColor: GOLD } as React.CSSProperties}
    >
      {/* Floating, not a modal: the page behind stays usable. It closes only
          with this button (no overlay, no Esc, no click-outside). */}
      <div className="flex items-center justify-between pl-3 pr-1 py-1">
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: GOLD }}>ฟังเป็น Podcast</span>
        <button
          type="button"
          aria-label="ปิดเครื่องเล่น"
          onClick={() => { log(); onClose(); }}
          className="p-1.5 text-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C0A060]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-2.5 pb-2.5">
        {/* keeps the whole recorder on screen on short windows */}
        <div className="relative mx-auto select-none" style={{ width: `min(100%, calc((100vh - 8rem) * ${W} / ${H}))`, aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" aria-hidden="true" focusable="false">
            <style>{`
              .pc-spin{animation:pc-rot 2.2s linear infinite;transform-box:fill-box;transform-origin:center}
              .pc-paused{animation-play-state:paused}
              @keyframes pc-rot{to{transform:rotate(360deg)}}
              @media (prefers-reduced-motion: reduce){.pc-spin{animation:none}}
            `}</style>
            <defs>
              <linearGradient id="pc-metal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#d9d6cf" /><stop offset="0.5" stopColor="#b9b6ae" /><stop offset="1" stopColor="#d2cfc8" />
              </linearGradient>
              <linearGradient id="pc-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e4e1da" /><stop offset="1" stopColor="#a9a69e" />
              </linearGradient>
              <pattern id="pc-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.6" fill="#2f2f2f" />
              </pattern>
              {keys.map((k, i) => (
                <linearGradient key={k.label} id={`pc-key${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={k.k.top} /><stop offset="1" stopColor={k.k.bottom} />
                </linearGradient>
              ))}
              <clipPath id="pc-title"><rect x={TITLE_BOX.x} y={TITLE_BOX.y} width={TITLE_BOX.w} height={TITLE_BOX.h} /></clipPath>
              <clipPath id="pc-sticker"><rect x={STICKER_BOX.x} y={STICKER_BOX.y} width={STICKER_BOX.w} height={STICKER_BOX.h} rx="4" /></clipPath>
            </defs>

            {/* case */}
            <rect x="4" y="4" width="292" height="532" rx="18" fill="#2a2c2d" stroke="#555" strokeWidth="1.5" />

            {/* speaker */}
            <rect x="12" y="12" width="276" height="206" rx="8" fill="url(#pc-metal)" stroke="#1c1c1c" strokeWidth="2" />
            <rect x="12" y="12" width="276" height="206" rx="8" fill="url(#pc-dots)" />

            {/* cassette bay */}
            <rect x="12" y="226" width="276" height="124" rx="8" fill="#1b1d1e" stroke="#3a3a3a" />
            <rect x="40" y="236" width="220" height="104" rx="7" fill="#6e7673" />
            <rect x="46" y="241" width="208" height="30" rx="3" fill="#efe9d8" />
            <line x1="52" x2="248" y1="250" y2="250" stroke="#b9b29c" strokeWidth="0.8" />
            <line x1="52" x2="248" y1="258" y2="258" stroke="#b9b29c" strokeWidth="0.8" />
            {/* podcast name: audio_title, else the article title (never the file name) */}
            <text x={titleX} y="262" fontSize="12" fontWeight="bold" fill="#8a2f2f" clipPath="url(#pc-title)">{article.title}</text>
            {/* sticker picture ("A SIDE" spot) */}
            <rect x={STICKER_BOX.x} y={STICKER_BOX.y} width={STICKER_BOX.w} height={STICKER_BOX.h} rx="4" fill="#d9d4c4" stroke="#efe9d8" strokeWidth="1.5" />
            {article.image_url ? (
              <image href={article.image_url} x={STICKER_BOX.x} y={STICKER_BOX.y} width={STICKER_BOX.w} height={STICKER_BOX.h} preserveAspectRatio="xMidYMid slice" clipPath="url(#pc-sticker)" />
            ) : (
              <>
                <text x={STICKER_BOX.x + STICKER_BOX.w / 2} y="302" fontSize="22" fontWeight="bold" fill="#4b4f4d" textAnchor="middle">A</text>
                <text x={STICKER_BOX.x + STICKER_BOX.w / 2} y="312" fontSize="7" fontWeight="bold" fill="#4b4f4d" textAnchor="middle">SIDE</text>
              </>
            )}
            {/* tape window + reels */}
            <rect x="92" y="280" width="116" height="44" rx="22" fill="#141414" />
            <circle cx="118" cy="302" r={rLeft} fill="#3a2a1e" />
            <circle cx="182" cy="302" r={rRight} fill="#3a2a1e" />
            {[118, 182].map(x => (
              <g key={x} className={`pc-spin${spin}`}>
                <circle cx={x} cy="302" r="9.5" fill="#d6d6d6" />
                {[0, 60, 120, 180, 240, 300].map(a => (
                  <line key={a} x1={x} y1="302" x2={x} y2="294" stroke="#444" strokeWidth="2" transform={`rotate(${a} ${x} 302)`} />
                ))}
                <circle cx={x} cy="302" r="3" fill="#161616" />
              </g>
            ))}
            <path d="M72 340 L84 328 H216 L228 340 Z" fill="#4d5452" />
            <text x="254" y="336" fontSize="6.5" fill="#d9d6cc" textAnchor="end" letterSpacing="1.5">iDEAS365</text>

            {/* metal band: counter + seek strip */}
            <rect x="12" y="350" width="276" height="50" rx="6" fill="url(#pc-band)" stroke="#6b6962" />
            <text x="24" y="366" fontSize="11" fill="#1f1f1f" fontFamily="monospace" fontWeight="bold">{fmt(time)} / {fmt(duration)}</text>
            <text x="276" y="366" fontSize="9" fill="#3a3a3a" fontFamily="monospace" textAnchor="end">{status} · {speed}x</text>
            <rect x="24" y="376" width="252" height="8" rx="4" fill="#2f2f2f" />
            <rect x="24" y="376" width={252 * progress} height="8" rx="4" fill="#c0392b" />
            <rect x={24 + (252 - 6) * progress} y="372" width="6" height="16" rx="2" fill="#f2efe8" stroke="#222" />

            {/* strip: on-air LED + volume vents */}
            <rect x="12" y="408" width="276" height="48" rx="6" fill="#d6d1c6" stroke="#8d897f" />
            <rect x="26" y="418" width="18" height="8" fill={playing ? '#e0392b' : '#6a2a24'} />
            <text x="26" y="441" fontSize="9" fontWeight="bold" fill="#3a3a3a">ON AIR</text>
            <text x="166" y="436" fontSize="7" fill="#555" textAnchor="end" letterSpacing="1">VOL</text>
            {Array.from({ length: VENT_COUNT }).map((_, i) => (
              <rect key={i} x={VENTS.x + 4 + i * 12.5} y="416" width="6" height="32" rx="3" fill={i < litVents ? '#1b1b1b' : '#a8a398'} />
            ))}

            {/* keys */}
            <rect x="12" y="462" width="276" height="70" rx="8" fill="#1b1d1e" stroke="#3a3a3a" />
            <rect x="22" y="468" width="256" height="14" rx="2" fill="#cfcac0" />
            {keys.map((k, i) => (
              <text key={k.label} x={cx(i)} y="478" fontSize="6.5" fontWeight="bold" fill="#3a3a3a" textAnchor="middle">{k.label}</text>
            ))}
            {keys.map((k, i) => (
              <rect key={k.label} x={keyX(i)} y={KEY_Y + k.k.y} width={KEY_W} height={KEY_H} rx="3" fill={`url(#pc-key${i})`} stroke="#2a2a2a" />
            ))}
            {keys.map((k, i) => (
              <line key={k.label} x1={keyX(i) + 8} x2={keyX(i) + KEY_W - 8} y1={KEY_Y + k.k.y + KEY_H - 7} y2={KEY_Y + k.k.y + KEY_H - 7} stroke="#7a776f" strokeWidth="1" />
            ))}
            <path d={`M${cx(0) - 5} ${iconY(0) + 9} h4 v14 h-4z M${cx(0) + 1} ${iconY(0) + 9} h4 v14 h-4z`} fill={ICON} />
            <path d={`M${cx(1) - 5} ${iconY(1) + 9} l12 7 -12 7z`} fill={ICON} />
            <path d={`M${cx(2) - 1} ${iconY(2) + 9} l-9 7 9 7z M${cx(2) + 9} ${iconY(2) + 9} l-9 7 9 7z`} fill={ICON} />
            <path d={`M${cx(3) - 9} ${iconY(3) + 9} l9 7 -9 7z M${cx(3) + 1} ${iconY(3) + 9} l9 7 -9 7z`} fill={ICON} />
            <rect x={cx(4) - 6} y={iconY(4) + 10} width="12" height="12" fill={ICON} />
            <text x={cx(5)} y={iconY(5) + 21} fontSize="11" fontWeight="bold" fill={ICON} textAnchor="middle">{speed}x</text>
          </svg>

          {/* translucent controls laid on the drawn keys */}
          {keys.map((k, i) => (
            <button
              key={k.label}
              type="button"
              aria-label={k.aria}
              title={k.aria}
              onClick={k.on}
              className="absolute rounded-[3px] bg-white/0 hover:bg-white/20 active:bg-white/35 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C0A060]"
              style={boxStyle({ x: keyX(i), y: KEY_Y, w: KEY_W, h: KEY_H })}
            />
          ))}

          <div className="absolute rounded-[4px] focus-within:outline focus-within:outline-2 focus-within:outline-[#C0A060]" style={boxStyle(SEEK)}>
            <input
              type="range" min={0} max={1000} step={1}
              aria-label="เลื่อนตำแหน่งการฟัง"
              aria-valuetext={`${fmt(time)} จาก ${fmt(duration)}`}
              value={Math.round(progress * 1000)}
              disabled={!duration}
              onChange={e => {
                const a = audioRef.current;
                if (!a || !duration) return;
                a.currentTime = (Number(e.target.value) / 1000) * duration;
                setTime(a.currentTime);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
            />
          </div>
          <div className="absolute rounded-[4px] focus-within:outline focus-within:outline-2 focus-within:outline-[#C0A060]" style={boxStyle(VENTS)}>
            <input
              type="range" min={0} max={100} step={1}
              aria-label="ระดับเสียง"
              value={Math.round(volume * 100)}
              onChange={e => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
            />
          </div>
        </div>

        {failed && (
          <p className="text-xs text-[#FF6B7F] mt-2" role="alert">เล่นไฟล์เสียงนี้ไม่ได้ ลองใหม่อีกครั้ง หรือแจ้งทีมงาน</p>
        )}

        <audio
          ref={audioRef}
          src={article.audio_url}
          preload="metadata"
          autoPlay
          onLoadedMetadata={e => setDuration(e.currentTarget.duration || article.audio_duration_sec || 0)}
          onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
          onPlay={() => {
            setPlaying(true); setStarted(true); setEnded(false);
            if (!startedRef.current) { startedRef.current = true; log(); }
          }}
          onPause={() => { setPlaying(false); log(); }}
          onEnded={() => { setPlaying(false); setEnded(true); log(); }}
          onError={() => setFailed(true)}
        />
      </div>
    </section>
  );
};

export default CassettePlayerDialog;
