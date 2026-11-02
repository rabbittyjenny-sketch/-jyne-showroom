// Copied from the Creatr365 repo (src/lib/articleTemplate.ts) for iDEAS365's own articles; default brand → iDEAS365.
/**
 * Structured articles — the article's CONTENT is stored as data, the page
 * DESIGN lives here, once.
 *
 * Why: pasting a whole designed HTML page per article means every article
 * carries its own copy of the design (hundreds of KB), a design change means
 * redoing every article, and files exported from a design tool often need
 * that tool's scripts to display at all. Storing only the content (a few KB of
 * JSON: meta + blocks) and rendering it with one template is how content
 * systems normally work, and it keeps working whatever tool wrote the content.
 *
 * The content format is the one Claude Design's "Creatr365 Article" template
 * already uses (`window.C365_ARTICLE = { meta, blocks }`, see its
 * articles/_template.js). The markup below is a port of that template
 * ("Creatr365 Article.dc.html"), block by block.
 *
 * Output is a complete, script-free HTML document. It is shown by
 * ArticleBody's existing sandboxed frame (the site's CSS can't reach it), so
 * it looks the same as opening the file in a browser. All text is escaped and
 * every URL must be http(s) or site-relative.
 */

export interface ArticleMeta {
  brand?: string; kicker?: string; titleAccent?: string; title?: string;
  subtitle?: string; dek?: string; updated?: string;
  heroImage?: string; heroAlt?: string; footer?: string; tagline?: string;
  /** 'split' (default) or 'full-bleed' */
  coverLayout?: string;
  /** default true */
  showToc?: boolean;
}
export type ArticleBlock = { type?: string } & Record<string, unknown>;
export interface StructuredArticle { meta: ArticleMeta; blocks: ArticleBlock[] }

/* ── helpers ─────────────────────────────────────────────────────────── */

const esc = (v: unknown): string =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
/** http(s) or site-relative only — never javascript:, data:, etc. */
export function safeUrl(v: unknown): string {
  const u = text(v).trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(u) ? u : '';
}
// Same test the design uses to decide a table cell line is a link.
const isUrlLine = (t: string) => /^(https?:\/\/)?[^\s|]+\.[a-z฀-๿]{2,}(\/\S*)?$/i.test(t.trim());
const safeId = (v: string) => v.replace(/[^A-Za-z0-9_\-฀-๿]/g, '-');

export function isStructuredArticle(a: unknown): a is StructuredArticle {
  return !!a && typeof a === 'object'
    && typeof (a as StructuredArticle).meta === 'object' && (a as StructuredArticle).meta !== null
    && Array.isArray((a as StructuredArticle).blocks);
}

/** Body is a JSON string of a structured article → the object, else null. */
export function parseStructuredArticle(body?: string | null): StructuredArticle | null {
  const t = (body ?? '').trim();
  if (t[0] !== '{') return null;
  try {
    const o = JSON.parse(t);
    return isStructuredArticle(o) ? o : null;
  } catch { return null; }
}

/* ── known block types (anything else is skipped, and reported) ───────── */
const KNOWN = ['chapter', 'h3', 'p', 'list', 'stats', 'timeline', 'table', 'compare', 'callout', 'image', 'source', 'note', 'summary', 'quote'];

/** Human-readable problems (Thai) to show the admin before saving. */
export function validateStructuredArticle(a: StructuredArticle): string[] {
  const w: string[] = [];
  const m = a.meta || {};
  if (!text(m.title).trim()) w.push('ยังไม่มี meta.title (หัวข้อบทความ)');
  if (!safeUrl(m.heroImage)) w.push('ยังไม่มีรูปปก (meta.heroImage ต้องเป็นลิงก์ https://…) — ปกจะแสดงเฉพาะข้อความ');
  if (!a.blocks.length) w.push('ไม่มีเนื้อหา (blocks ว่าง)');
  a.blocks.forEach((b, i) => {
    const n = i + 1;
    const t = text(b?.type);
    if (!KNOWN.includes(t)) { w.push(`บล็อกที่ ${n}: ไม่รู้จักชนิด "${t}" — จะไม่ถูกแสดง`); return; }
    if (t === 'image' && !safeUrl(b.src)) w.push(`บล็อกที่ ${n} (image): ไม่มี src ที่เป็นลิงก์ https://… — รูปนี้จะไม่แสดง`);
    if (t === 'table' && (!Array.isArray(b.headers) || !Array.isArray(b.rows))) w.push(`บล็อกที่ ${n} (table): ต้องมี headers และ rows`);
    if (['list', 'stats', 'timeline', 'summary'].includes(t) && !Array.isArray(b.items)) w.push(`บล็อกที่ ${n} (${t}): ต้องมี items`);
    if (t === 'compare' && !Array.isArray(b.columns)) w.push(`บล็อกที่ ${n} (compare): ต้องมี columns`);
  });
  return w;
}

/* ── renderer ────────────────────────────────────────────────────────── */

const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans+Thai:wght@400;500;600;700&amp;family=Overpass:wght@500;700;800&amp;family=Sarabun:wght@400;500;600&amp;display=swap';
const THAI = "'IBM Plex Sans Thai',sans-serif";
const MONO = "'IBM Plex Mono',monospace";
const bullet = (mt: string) => `<span style="flex:0 0 6px;width:6px;height:6px;background:#C1121F;margin-top:${mt}"></span>`;

function renderBlock(b: ArticleBlock, chapterId: string): string {
  const t = text(b?.type);
  switch (t) {
    case 'chapter':
      return `<div id="${esc(chapterId)}" style="margin:76px 0 20px;border-top:1.5px solid #C1121F;padding-top:14px;scroll-margin-top:20px">`
        + `<div style="font:500 12px ${MONO};letter-spacing:.14em;color:#C1121F">${esc(b.num)}</div>`
        + `<h2 style="margin:8px 0 0;font-family:${THAI};font-weight:700;font-size:clamp(28px,4vw,40px);line-height:1.22;letter-spacing:-.01em;text-wrap:balance">${esc(b.title)}</h2></div>`;
    case 'h3':
      return `<h3 style="margin:36px 0 10px;font-family:${THAI};font-weight:600;font-size:22px;line-height:1.45;text-wrap:balance">${esc(b.text)}</h3>`;
    case 'p':
      return `<p style="margin:0 0 1.1em;text-wrap:pretty">${esc(b.text)}</p>`;
    case 'list':
      return `<div style="display:flex;flex-direction:column;gap:8px;margin:4px 0 24px">${arr(b.items).map(it =>
        `<div style="display:flex;gap:14px;align-items:flex-start">${bullet('.8em')}<span style="text-wrap:pretty">${esc(it)}</span></div>`).join('')}</div>`;
    case 'stats':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px;margin:20px 0 28px">${arr(b.items).map(s => {
        const o = (s || {}) as Record<string, unknown>;
        return `<div style="background:#0D0D0D;color:#F8F8F6;padding:20px 18px;display:flex;flex-direction:column;gap:6px">`
          + `<div style="font-family:Overpass,${THAI};font-weight:800;font-size:30px;line-height:1.15;letter-spacing:-.01em">${esc(o.value)}</div>`
          + `<div style="font-size:15px;line-height:1.55">${esc(o.label)}</div>`
          + `<div style="font:11px/1.6 ${MONO};color:#B9B7B0;margin-top:auto">${esc(o.note)}</div></div>`;
      }).join('')}</div>`;
    case 'timeline':
      return `<div style="margin:12px 0 28px;border-bottom:1px solid #d8d6d0">${arr(b.items).map(x => {
        const o = (x || {}) as Record<string, unknown>;
        return `<div style="display:grid;grid-template-columns:72px minmax(0,1fr);gap:20px;border-top:1px solid #d8d6d0;padding:14px 0">`
          + `<div style="font-family:Overpass,sans-serif;font-weight:800;font-size:22px;line-height:1.5;color:#C1121F">${esc(o.year)}</div>`
          + `<div style="text-wrap:pretty">${esc(o.text)}</div></div>`;
      }).join('')}</div>`;
    case 'table': {
      const linkCol = typeof b.linkColumn === 'number' ? b.linkColumn : -1;
      const head = arr(b.headers).map(h =>
        `<th style="background:#0D0D0D;color:#F8F8F6;text-align:left;vertical-align:bottom;padding:12px 16px;font-family:${THAI};font-weight:600;font-size:15px">${esc(h)}</th>`).join('');
      const rows = arr(b.rows).map(row => `<tr>${arr(row).map((c, ci) => {
        const lines = text(c).split('\n').map(ln => {
          const link = ci === linkCol && isUrlLine(ln);
          if (link) {
            const href = safeUrl(/^https?:/i.test(ln.trim()) ? ln.trim() : 'https://' + ln.trim());
            if (href) return `<a href="${esc(href)}" target="_blank" rel="noopener" style="font:13px/1.6 ${MONO};word-break:break-all">${esc(ln)}</a>`;
          }
          return ci === 0 && !link
            ? `<span style="font-weight:600;color:#0D0D0D">${esc(ln)}</span>`
            : `<span>${esc(ln)}</span>`;
        }).join('');
        return `<td style="padding:13px 16px;border-top:1px solid #d8d6d0;vertical-align:top"><div style="display:flex;flex-direction:column;gap:4px">${lines}</div></td>`;
      }).join('')}</tr>`).join('');
      return `<div style="overflow-x:auto;border:1px solid #0D0D0D;margin:18px 0 22px;background:#fff">`
        + `<table style="width:100%;min-width:640px;border-collapse:collapse;font-size:15.5px;line-height:1.7"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case 'compare':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px;margin:16px 0 28px">${arr(b.columns).map(c => {
        const o = (c || {}) as Record<string, unknown>;
        return `<div style="border:1px solid #0D0D0D;border-top:3px solid #0D0D0D;padding:20px 22px;background:#fff">`
          + `<div style="font-family:${THAI};font-weight:600;font-size:18px;margin-bottom:12px">${esc(o.title)}</div>`
          + `<div style="display:flex;flex-direction:column;gap:8px;font-size:16.5px;line-height:1.7">${arr(o.items).map(it =>
            `<div style="display:flex;gap:12px;align-items:flex-start">${bullet('.75em')}<span style="text-wrap:pretty">${esc(it)}</span></div>`).join('')}</div></div>`;
      }).join('')}</div>`;
    case 'callout':
      return b.tone === 'light'
        ? `<div style="border:1.5px solid #0D0D0D;padding:20px 24px;margin:20px 0 28px;font-family:${THAI};font-weight:600;font-size:19px;line-height:1.7;text-wrap:pretty">${esc(b.text)}</div>`
        : `<div style="background:#0D0D0D;color:#F8F8F6;border-top:3px solid #C1121F;padding:24px 26px;margin:24px 0 28px;font-size:18px;line-height:1.85;text-wrap:pretty">${esc(b.text)}</div>`;
    case 'source':
    case 'note': {
      const label = text(b.label) || (t === 'note' ? 'หมายเหตุ' : 'แหล่งอ้างอิง');
      return `<div style="display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;border-top:1px solid #d8d6d0;padding-top:10px;margin:14px 0 28px;font-size:14px;line-height:1.75;color:#4a4843">`
        + `<span style="font:500 11px ${MONO};letter-spacing:.12em;color:#0D0D0D;flex:0 0 auto">${esc(label)}</span>`
        + `<span style="flex:1 1 300px;text-wrap:pretty">${esc(b.text)}</span></div>`;
    }
    case 'image': {
      const src = safeUrl(b.src);
      if (!src) return ''; // nothing to show — reported by validateStructuredArticle
      const cap = text(b.caption);
      return `<figure style="margin:36px 0"><img src="${esc(src)}" alt="${esc(b.alt || cap)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#e4e2dc">`
        + (cap ? `<figcaption style="font:12px/1.7 ${MONO};color:#4a4843;margin-top:10px">${esc(cap)}</figcaption>` : '') + `</figure>`;
    }
    case 'summary':
      return `<div style="background:#0D0D0D;color:#F8F8F6;padding:clamp(28px,5vw,52px);margin:80px 0 0">`
        + `<div style="font:500 11px ${MONO};letter-spacing:.16em;color:#B9B7B0">${esc(b.kicker)}</div>`
        + `<h2 style="margin:10px 0 22px;font-family:${THAI};font-weight:700;font-size:clamp(26px,3.6vw,36px);line-height:1.25">${esc(b.title)}</h2>`
        + `<div style="display:flex;flex-direction:column;gap:12px">${arr(b.items).map(it =>
          `<div style="display:flex;gap:14px;align-items:flex-start;padding-top:12px;border-top:1px solid #2e2e2e">${bullet('.8em')}<span style="text-wrap:pretty">${esc(it)}</span></div>`).join('')}</div></div>`;
    case 'quote':
      return `<blockquote style="margin:56px 0 0;padding:0;display:flex;flex-direction:column;gap:12px">`
        + `<div style="font-family:${THAI};font-weight:700;font-size:clamp(28px,4.4vw,44px);line-height:1.3;letter-spacing:-.01em;text-wrap:balance">${esc(b.text)}</div>`
        + `<div style="font:500 12px ${MONO};letter-spacing:.12em;color:#C1121F">${esc(b.cite)}</div></blockquote>`;
    default:
      return '';
  }
}

/** Full, script-free HTML document for an article. */
export function renderArticleHtml(a: StructuredArticle): string {
  const m: ArticleMeta = a.meta || {};
  const blocks = arr(a.blocks) as ArticleBlock[];

  // Chapter ids/TOC — same numbering rule as the design: ch-1, ch-2, …
  let ch = 0;
  const chapters = blocks.filter(b => text(b?.type) === 'chapter').map(b => {
    const id = safeId(text(b.id) || `ch-${++ch}`);
    return { id, num: text(b.num), title: text(b.title) };
  });
  let ci = 0;
  const body = blocks.map(b => renderBlock(b, text(b?.type) === 'chapter' ? chapters[ci++].id : '')).join('');

  const hero = safeUrl(m.heroImage);
  const heroImg = hero
    ? `<img src="${esc(hero)}" alt="${esc(m.heroAlt || m.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">`
    : '';
  const titleH1 = (size: string, lh: string) =>
    `<h1 style="margin:0;font-family:${THAI};font-weight:700;font-size:${size};line-height:${lh};letter-spacing:-.02em;text-wrap:balance">`
    + `<span style="color:#E0303C">${esc(m.titleAccent)}</span><br>${esc(m.title)}</h1>`;

  const full = m.coverLayout === 'full-bleed';
  const cover = full
    ? `<header style="position:relative;min-height:clamp(480px,62vw,720px);background:#0D0D0D;color:#F8F8F6;display:flex;align-items:flex-end;overflow:hidden">${heroImg}`
      + `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,13,13,0) 25%,rgba(13,13,13,.92) 78%)"></div>`
      + `<div style="position:relative;max-width:980px;width:100%;margin:0 auto;padding:clamp(32px,6vw,72px) clamp(20px,5vw,48px);display:flex;flex-direction:column;gap:18px">`
      + `<div style="font:500 11px ${MONO};letter-spacing:.16em;color:#DDDBD4">${esc(m.kicker)}</div>${titleH1('clamp(38px,6vw,76px)', '1.1')}`
      + `<p style="margin:0;font-size:19px;line-height:1.8;color:#E8E6E0;max-width:640px;text-wrap:pretty">${esc(m.dek)}</p>`
      + `<div style="display:flex;flex-wrap:wrap;gap:8px 20px;font:12px ${MONO};color:#DDDBD4;letter-spacing:.04em"><span>${esc(m.subtitle)}</span><span>${esc(m.updated)}</span></div></div></header>`
    : `<header style="background:#0D0D0D;color:#F8F8F6;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">`
      + `<div style="padding:clamp(32px,6vw,72px) clamp(20px,5vw,64px);display:flex;flex-direction:column;justify-content:flex-end;gap:18px">`
      + `<div style="font:500 11px ${MONO};letter-spacing:.16em;color:#B9B7B0">${esc(m.kicker)}</div>${titleH1('clamp(36px,5.4vw,68px)', '1.12')}`
      + `<div style="height:3px;width:56px;background:#C1121F"></div>`
      + `<div style="display:flex;flex-wrap:wrap;gap:8px 20px;font:12px ${MONO};color:#B9B7B0;letter-spacing:.04em"><span style="width:459px;max-width:100%;min-height:52px">${esc(m.subtitle)}</span><span>${esc(m.updated)}</span></div></div>`
      + (hero ? `<div style="position:relative;min-height:clamp(300px,42vw,560px);background:#151515">${heroImg}</div>` : '')
      + `</header>`;

  const toc = m.showToc !== false && chapters.length
    ? `<nav class="c365-toc" style="border-top:2px solid #0D0D0D;border-bottom:1px solid #d8d6d0;padding:18px 0 20px;margin-bottom:48px">`
      + `<div style="font:500 11px ${MONO};letter-spacing:.16em;color:#C1121F;margin-bottom:12px">สารบัญ</div>`
      + `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:6px 32px">${chapters.map(c =>
        `<a href="#${esc(c.id)}" style="display:flex;gap:14px;align-items:baseline;color:#111;text-decoration:none;font-size:16px;line-height:1.6;padding:4px 0">`
        + `<span style="font:500 12px ${MONO};color:#6b6962;flex:0 0 auto">${esc(c.num)}</span><span>${esc(c.title)}</span></a>`).join('')}</div></nav>`
    : '';

  const docTitle = [text(m.titleAccent), text(m.title)].filter(Boolean).join(' ');
  return `<!DOCTYPE html>\n<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${esc(docTitle || 'iDEAS365')}</title>`
    + `<link href="${FONTS}" rel="stylesheet">`
    + `<style>body{margin:0;background:#F8F8F6}a{color:#C1121F;text-decoration:underline;text-underline-offset:3px}a:hover{color:#0D0D0D}.c365-toc a:hover{color:#C1121F!important}</style></head><body>`
    + `<div style="min-height:100vh;background:#F8F8F6;color:#111;font-family:'Sarabun','IBM Plex Sans Thai',sans-serif;font-size:18px;line-height:1.85">`
    + `<div style="background:#0D0D0D;color:#F8F8F6;padding:14px clamp(20px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #2a2a2a">`
    + `<span style="font-family:Overpass,sans-serif;font-weight:800;font-size:20px;letter-spacing:-.01em">${esc(m.brand || 'iDEAS365')}</span>`
    + `<span style="font:500 11px ${MONO};letter-spacing:.14em;color:#B9B7B0">ARTICLE</span></div>`
    + cover
    + `<main style="max-width:860px;margin:0 auto;padding:clamp(36px,6vw,72px) 20px 88px">${toc}${body}</main>`
    + `<footer style="background:#0D0D0D;color:#B9B7B0;padding:22px clamp(20px,4vw,48px);display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px;font:12px/1.7 ${MONO}">`
    + `<span style="max-width:760px">${esc(m.footer)}</span><span style="color:#F8F8F6">${esc(m.tagline || 'Be a Creator. Not a Consumer.')}</span></footer>`
    + `</div></body></html>`;
}

/* ── turning what the admin pastes into stored JSON ─────────────────── */

/** True for pasted article *files* (`window.C365_ARTICLE = {…};`, comments, JS-style keys). */
export function looksLikeArticleScript(input: string): boolean {
  const t = input.trim();
  if (t[0] === '<') return false; // an HTML document, not a script
  return /^(\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*(window\.|var |let |const )?[A-Za-z_$][\w$.]*\s*=\s*\{/.test(t)
    || (t[0] === '{' && !parseStructuredArticle(t) && /\bblocks\s*:/.test(t));
}

// (A plain shape rather than a discriminated union: the project builds without strictNullChecks, so `ok` wouldn't narrow.)
export interface NormalizeResult { ok: boolean; json?: string; article?: StructuredArticle; error?: string }

/**
 * Runs the pasted article file in a throw-away frame (`sandbox="allow-scripts"`
 * with NO same-origin: it can't touch the site, its storage or the session)
 * and returns the article as JSON. Needed because the file is JavaScript
 * (unquoted keys, comments), not strict JSON.
 */
export function normalizeArticleScript(code: string, timeoutMs = 5000): Promise<NormalizeResult> {
  return new Promise(resolve => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none';
    frame.srcdoc = `<!doctype html><script>addEventListener('message',function(e){var out;try{`
      + `var before=Object.keys(window),c=String(e.data.code).trim();`
      + `var v=(0,eval)(c.charAt(0)==='{'?'('+c+')':c);`
      + `var found=(v&&typeof v==='object'&&v.blocks)?v:null;`
      + `if(!found){Object.keys(window).forEach(function(k){if(!found&&before.indexOf(k)<0){var x=window[k];if(x&&typeof x==='object'&&x.blocks)found=x}})}`
      + `out=found?{json:JSON.stringify(found)}:{error:'ไม่พบข้อมูลบทความ (ต้องมี meta และ blocks)'}`
      + `}catch(err){out={error:'อ่านไฟล์ไม่ได้: '+String(err&&err.message||err)}}`
      + `parent.postMessage({c365:'normalized',out:out},'*')});</script>`;
    let done = false;
    const finish = (r: NormalizeResult) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMsg);
      clearTimeout(timer);
      frame.remove();
      resolve(r);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow || e.data?.c365 !== 'normalized') return;
      const out = e.data.out as { json?: string; error?: string };
      if (out.error || !out.json) return finish({ ok: false, error: out.error || 'แปลงไม่สำเร็จ' });
      try {
        const article = JSON.parse(out.json);
        if (!isStructuredArticle(article)) return finish({ ok: false, error: 'ข้อมูลบทความต้องมี meta และ blocks' });
        finish({ ok: true, article, json: JSON.stringify(article, null, 2) });
      } catch { finish({ ok: false, error: 'แปลงข้อมูลไม่สำเร็จ' }); }
    };
    const timer = setTimeout(() => finish({ ok: false, error: 'แปลงไฟล์ไม่สำเร็จ (หมดเวลา) — ตรวจว่าวางไฟล์ครบทั้งไฟล์' }), timeoutMs);
    window.addEventListener('message', onMsg);
    frame.addEventListener('load', () => frame.contentWindow?.postMessage({ code }, '*'));
    document.body.appendChild(frame);
  });
}
