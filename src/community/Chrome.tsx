import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const LOGO = 'https://ik.imagekit.io/ideas365logo/LOGO_iDEAS365Black.png?updatedAt=1772818424343';
const BACK_IMG = 'https://ik.imagekit.io/ideas365logo/BACK%20(1)%20(1).png?updatedAt=1773177420277';

/** BACK = previous page on this site, otherwise `fallback` (same rule as the other island pages). */
function goBack(e: React.MouseEvent, fallback: string) {
  e.preventDefault();
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { history.back(); return; }
  } catch { /* fall through */ }
  location.href = fallback;
}

/** Header (logo = main map), footer and BACK button of the original island pages — no other way out (as the originals). */
export function Chrome({ children, back }: { children: ReactNode; back: string }) {
  return (
    <div className="cm-page">
      <header className="cm-header">
        <a href="/index.html"><img src={LOGO} alt="iDEAS365" className="logo-img" /></a>
      </header>
      {children}
      <footer className="cm-footer">
        <p className="footer-brand"><span className="dot-r">J</span><span className="dot-g">Y</span><span className="dot-b">N</span><span className="dot-y">E</span>&nbsp;:&nbsp;iDEAS365</p>
        <p className="footer-tagline">Smart Lazy Style</p>
        <p className="footer-copy">© 2026 All right reserved &nbsp;|&nbsp; Created by iDEAS365 x Generative AI</p>
      </footer>
      {back.startsWith('/community')
        ? <Link to={back} className="cm-back" onClick={(e) => goBack(e, back)}><img src={BACK_IMG} alt="BACK" /></Link>
        : <a href={back} className="cm-back" onClick={(e) => goBack(e, back)}><img src={BACK_IMG} alt="BACK" /></a>}
    </div>
  );
}
