// Copied from the Creatr365 repo (src/components/ArticleBody.tsx) for iDEAS365's own articles.
import React, { useEffect, useMemo, useRef } from 'react';
import { parseStructuredArticle, renderArticleHtml } from '@/lib/articleTemplate';

/**
 * Renders an article's `body` (the one "เนื้อหาเต็ม (HTML)" field in
 * Admin → เนื้อหา). Used by /articles/:slug and the Admin preview.
 *
 * Three kinds of body come through that field:
 * - Plain HTML fragments (h2/p/ul/img…) → the site's dark `.article-body`
 *   styling, exactly as before.
 * - A whole HTML file with its own design (<html>/<head>/<style>, or the
 *   article design tool's `id="dc-root"` export) → shown as the file itself,
 *   in its own frame. The site's CSS (heading hover underline, inline-block
 *   headings, 500 font weight, white heading colour…) cannot reach it, so it
 *   looks the same as opening the file in a browser.
 * - Structured article content (JSON `{ meta, blocks }`, see
 *   lib/articleTemplate.ts) → turned into a whole HTML document by the one
 *   shared article template, then shown the same way as the previous kind.
 *   This is the format for new articles: only the content is stored.
 *
 * The frame is sandboxed without allow-scripts: scripts in the file don't
 * run (the page height and #anchor links are handled from out here), and
 * external links open in a new tab.
 */

export function isDocumentHtml(html?: string | null): boolean {
  return !!html && (parseStructuredArticle(html) !== null
    || /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]|<style[\s>]|id=["']dc-root["']/i.test(html));
}

function toSrcDoc(source: string): string {
  const structured = parseStructuredArticle(source);
  const html = structured ? renderArticleHtml(structured) : source;
  const base = '<base target="_blank">';
  if (/<head[\s>]/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + base);
  if (/<html[\s>]/i.test(html)) return html.replace(/<html[^>]*>/i, m => `${m}<head><meta charset="utf-8">${base}</head>`);
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + base + '<style>body{margin:0}</style></head><body>' + html + '</body></html>';
}

const DocumentFrame: React.FC<{ html: string; scrollOffset?: number }> = ({ html, scrollOffset }) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => toSrcDoc(html), [html]);

  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    let doc: Document | null = null;
    let ro: ResizeObserver | undefined;
    let last = 0;

    // Size the frame to its content. Measured with the frame collapsed so
    // `min-height:100vh` in the file can't pin it to its previous height.
    const fit = () => {
      if (!doc?.documentElement) return;
      f.style.height = '0px';
      last = doc.documentElement.scrollHeight;
      f.style.height = `${last}px`;
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = doc?.getElementById(decodeURIComponent(id));
      if (!target) return;
      e.preventDefault();
      if (scrollOffset != null) {
        window.scrollTo({
          top: f.getBoundingClientRect().top + window.scrollY + target.getBoundingClientRect().top - scrollOffset,
          behavior: 'smooth',
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const attach = () => {
      doc = f.contentDocument;
      if (!doc?.body) return;
      fit();
      ro?.disconnect();
      // The frame's own ResizeObserver, so it works whichever window observes.
      const RO = (f.contentWindow as (Window & { ResizeObserver?: typeof ResizeObserver }) | null)?.ResizeObserver ?? ResizeObserver;
      ro = new RO(() => { if (doc && doc.documentElement.scrollHeight !== last) fit(); });
      ro.observe(doc.body);
      // Web fonts swapping in after load change the text height.
      doc.fonts?.ready.then(fit).catch(() => undefined);
      doc.addEventListener('click', onClick);
    };

    f.addEventListener('load', attach);
    if (f.contentDocument?.readyState === 'complete') attach();
    window.addEventListener('resize', fit);
    return () => {
      f.removeEventListener('load', attach);
      window.removeEventListener('resize', fit);
      doc?.removeEventListener('click', onClick);
      ro?.disconnect();
    };
  }, [srcDoc, scrollOffset]);

  return (
    <iframe
      ref={frame}
      title="เนื้อหาบทความ"
      srcDoc={srcDoc}
      scrolling="no"
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ display: 'block', width: '100%', height: 600, border: 0, background: '#fff' }}
    />
  );
};

export const ArticleBody: React.FC<{ html: string; scrollOffset?: number; className?: string }> = ({
  html, scrollOffset, className = 'cm-post-content',
}) => (
  isDocumentHtml(html)
    ? <DocumentFrame html={html} scrollOffset={scrollOffset} />
    : <div className={`article-body ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
);

export default ArticleBody;
