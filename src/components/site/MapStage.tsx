import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * A picture with image-buttons laid on it — the main map and every island use this.
 * Positions are % of the stage (Explore page pattern from Creatr365), so buttons stay
 * on the same spot at any screen size. The stage background can be an image or an .mp4.
 *
 * Anything without a position yet (or whose picture has not been made) still works:
 * it is listed as a plain button under the map, so the site is usable from day one.
 */
export interface StageButton {
  key: string;
  to: string;
  label: string;
  tooltip?: string | null;
  image: string | null;
  left: number | null;
  top: number | null;
  width: number | null;
  external?: boolean;
}

export function MapStage({
  background, aspect = '16/9', buttons, mobileFocusX = 50, children, floating = true,
}: {
  background: string | null; aspect?: string; buttons: StageButton[]; mobileFocusX?: number; children?: ReactNode; floating?: boolean;
}) {
  const placed = buttons.filter((b) => b.left !== null && b.top !== null && b.width !== null);
  const unplaced = buttons.filter((b) => !placed.includes(b));
  const isVideo = !!background && /\.(mp4|webm)(\?|$)/i.test(background);
  const [bgFailed, setBgFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Phones: the stage is wider than the screen and scrolls sideways; start centred on the
  // island's focus point (set per island in the back office).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || window.innerWidth >= 768) return;
    const stageWidth = wrap.scrollWidth;
    wrap.scrollLeft = Math.max(0, (stageWidth * mobileFocusX) / 100 - wrap.clientWidth / 2);
  }, [mobileFocusX, buttons.length]);

  return (
    <>
    <div className="i365-stage-wrap" ref={wrapRef}>
      <div className="i365-stage" style={{ aspectRatio: aspect.replace('/', ' / ') }}>
        {background && !bgFailed && (isVideo ? (
          <video className="i365-stage-bg" src={background} autoPlay muted loop playsInline aria-hidden="true" onError={() => setBgFailed(true)} />
        ) : (
          <img className="i365-stage-bg" src={background} alt="" aria-hidden="true" onError={() => setBgFailed(true)} />
        ))}
        {(!background || bgFailed) && <div className="i365-stage-bg i365-stage-placeholder" aria-hidden="true" />}
        <nav className="i365-stage-nav">
          {placed.map((b, i) => (
            <ImageButton key={b.key} b={b} floating={floating} delay={i * -0.7} />
          ))}
        </nav>
        {children}
      </div>
    </div>
      {/* buttons not placed on the picture yet — and, on phones, every button as a list too */}
      {buttons.length > 0 && (
        <div className={`i365-unplaced ${unplaced.length ? '' : 'i365-mobile-only'}`} aria-label="เมนู">
          {buttons.map((b) => (
            <ButtonLink key={b.key} b={b} className={`i365-pill ${placed.includes(b) ? 'i365-mobile-only' : ''}`}>{b.label}</ButtonLink>
          ))}
        </div>
      )}
    </>
  );
}

function ButtonLink({ b, className, style, children }: { b: StageButton; className: string; style?: React.CSSProperties; children: ReactNode }) {
  if (b.external) {
    return <a href={b.to} className={className} style={style} data-tooltip={b.tooltip ?? undefined} aria-label={b.label}>{children}</a>;
  }
  return <Link to={b.to} className={className} style={style} data-tooltip={b.tooltip ?? undefined} aria-label={b.label}>{children}</Link>;
}

function ImageButton({ b, floating, delay }: { b: StageButton; floating: boolean; delay: number }) {
  const [failed, setFailed] = useState(!b.image);
  return (
    <ButtonLink
      b={b}
      className={`i365-btn ${floating ? 'i365-float' : ''}`}
      style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%`, animationDelay: `${delay}s` }}
    >
      <span className="i365-badge">{b.label}</span>
      {!failed ? (
        <img src={b.image!} alt="" onError={() => setFailed(true)} draggable={false} />
      ) : (
        // picture not made yet: a soft island shape keeps the spot clickable
        <span className="i365-btn-fallback" aria-hidden="true" />
      )}
    </ButtonLink>
  );
}
