import { useState } from 'react';
import { parseYouTubeId, youTubeThumb, isYouTubeShorts } from '@/lib/youtube';
import type { DisplayStyle, FeedEntry, FieldDef, Item, ItemType, Tag } from '@/lib/types';
import { recordDownload } from '@/lib/data';
import { SafeImg } from './SafeImg';

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lines = (v: unknown) => str(v).split('\n').map((s) => s.trim()).filter(Boolean);

/** The picture that represents an item: its cover, else the first image field, else a video thumbnail. */
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

function monthLabel(v: string) {
  if (!/^\d{4}-\d{2}/.test(v)) return v;
  const [y, m] = v.split('-').map(Number);
  const th = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${th[m - 1] ?? ''} ${y + 543}`;
}

/** Shows the extra fields of an item (everything except the ones a display already used). */
export function FieldList({ item, fields, skip = [] }: { item: Item; fields: FieldDef[]; skip?: string[] }) {
  const shown = fields.filter((f) => !skip.includes(f.key) && str(item.data[f.key]) !== '' && !['image', 'video'].includes(f.type));
  if (!shown.length) return null;
  return (
    <dl className="i365-fields">
      {shown.map((f) => {
        const v = item.data[f.key];
        let out: React.ReactNode = str(v);
        if (f.type === 'select') out = f.options?.find((o) => o.value === v)?.label ?? str(v);
        if (f.type === 'boolean') out = v ? 'ใช่' : 'ไม่';
        if (f.type === 'month') out = monthLabel(str(v));
        if (f.type === 'url' || f.type === 'file') out = <a href={str(v)} target="_blank" rel="noreferrer">เปิดลิงก์ ↗</a>;
        if (f.type === 'textarea') {
          const ls = lines(v);
          out = ls.length > 1 ? <ul>{ls.map((l, i) => <li key={i}>{l}</li>)}</ul> : str(v);
        }
        return (
          <div key={f.key}>
            <dt>{f.label_th}</dt>
            <dd>{out}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function TagChips({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;
  return <div className="i365-tags">{tags.map((t) => <span key={t.id} className="i365-tag">{t.name_th}</span>)}</div>;
}

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const id = parseYouTubeId(url);
  if (!id) {
    return <a className="i365-pill" href={url} target="_blank" rel="noreferrer">เปิดคลิป ↗</a>;
  }
  const vertical = isYouTubeShorts(url);
  return (
    <div className={`i365-video ${vertical ? 'is-vertical' : ''}`}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function DownloadButton({ item, url, mode }: { item: Item; url: string; mode: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (mode !== 'email') {
    return <a className="i365-pill i365-pill-solid" href={url} target="_blank" rel="noreferrer">ดาวน์โหลด ↓</a>;
  }
  if (!open) return <button className="i365-pill i365-pill-solid" onClick={() => setOpen(true)}>รับไฟล์ฟรี ↓</button>;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('กรอกอีเมลให้ถูกต้อง'); return; }
    if (!consent) { setErr('กรุณากดยินยอมก่อน'); return; }
    setBusy(true);
    try { await recordDownload(item.id, email, name); window.open(url, '_blank', 'noopener'); setOpen(false); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'ส่งไม่สำเร็จ'); }
    finally { setBusy(false); }
  };
  return (
    <form className="i365-dl-form" onSubmit={submit}>
      <input placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="อีเมล" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} />
      <label><input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErr(null); }} /> ยินยอมให้เก็บอีเมลเพื่อส่งข่าวสาร</label>
      {err && <p className="i365-error">{err}</p>}
      <button className="i365-pill i365-pill-solid" disabled={busy}>{busy ? 'กำลังส่ง…' : 'รับไฟล์'}</button>
    </form>
  );
}

export function ItemsDisplay({
  style, items, type, tagsFor, showTags,
}: { style: DisplayStyle; items: Item[]; type: ItemType | null; tagsFor: (id: string) => Tag[]; showTags: boolean }) {
  const [open, setOpen] = useState<Item | null>(null);
  const fields = type?.fields ?? [];
  const videoKey = fields.find((f) => f.type === 'video')?.key;
  const fileKey = fields.find((f) => f.type === 'file')?.key;

  if (!items.length) return <div className="i365-empty"><p>ยังไม่มีผลงานในส่วนนี้</p></div>;

  if (style === 'text') {
    return (
      <div className="i365-text-blocks">
        {items.map((it) => (
          <article key={it.id} className="i365-text-block">
            <h2>{it.title_th}</h2>
            <SafeImg src={str(it.data.image)} />
            {lines(it.data.body_th).map((p, i) => <p key={i}>{p}</p>)}
            {showTags && <TagChips tags={tagsFor(it.id)} />}
          </article>
        ))}
      </div>
    );
  }

  if (style === 'timeline') {
    // Sort by start date only when every entry has one; otherwise keep the order set in the back office.
    const sorted = items.every((it) => str(it.data.start))
      ? [...items].sort((a, b) => str(b.data.start).localeCompare(str(a.data.start)))
      : items;
    const when = (it: Item) => str(it.data.period_th)
      || (str(it.data.start) ? `${monthLabel(str(it.data.start))} – ${it.data.end ? monthLabel(str(it.data.end)) : 'ปัจจุบัน'}` : '');
    return (
      <ol className="i365-timeline">
        {sorted.map((it) => (
          <li key={it.id}>
            {when(it) && <div className="i365-timeline-when">{when(it)}</div>}
            <div className="i365-timeline-card">
              <h3>{str(it.data.role) || it.title_th}</h3>
              <p className="i365-muted">{[str(it.data.organization), str(it.data.location)].filter(Boolean).join(' · ')}</p>
              {lines(it.data.highlights_th).length > 0 && <ul>{lines(it.data.highlights_th).map((l, i) => <li key={i}>{l}</li>)}</ul>}
              {showTags && <TagChips tags={tagsFor(it.id)} />}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (style === 'list') {
    return (
      <ul className="i365-list">
        {items.map((it) => (
          <li key={it.id}>
            <div>
              <h3>{it.title_th}</h3>
              {it.summary_th && <p className="i365-muted">{it.summary_th}</p>}
              <FieldList item={it} fields={fields} skip={[fileKey ?? '', 'download_mode']} />
              {showTags && <TagChips tags={tagsFor(it.id)} />}
            </div>
            {fileKey && str(it.data[fileKey]) && <DownloadButton item={it} url={str(it.data[fileKey])} mode={str(it.data.download_mode)} />}
          </li>
        ))}
      </ul>
    );
  }

  const grid = (
    <div className={`i365-grid i365-grid-${style}`}>
      {items.map((it) => {
        const pic = itemPicture(it, type);
        return (
          <button key={it.id} className="i365-card" onClick={() => setOpen(it)}>
            <div className={`i365-card-pic ${style === 'video_grid' ? 'is-video' : ''}`}>
              <SafeImg src={pic} loading="lazy" fallback={<span className="i365-card-nopic">{it.title_th.slice(0, 1)}</span>} />
              {style === 'video_grid' && <span className="i365-play" aria-hidden="true">▶</span>}
            </div>
            {style !== 'gallery' && (
              <div className="i365-card-body">
                <h3>{it.title_th}</h3>
                {it.summary_th && <p className="i365-muted">{it.summary_th}</p>}
                {str(it.data.tool_kind) === 'pro' && <span className="i365-tag i365-tag-strong">ระบบใหญ่ · ทดลองได้</span>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {grid}
      {open && (
        <div className="i365-modal" role="dialog" aria-modal="true" aria-label={open.title_th} onClick={() => setOpen(null)}>
          <div className="i365-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="i365-modal-close" onClick={() => setOpen(null)} aria-label="ปิด">×</button>
            {videoKey && str(open.data[videoKey]) ? (
              <VideoPlayer url={str(open.data[videoKey])} title={open.title_th} />
            ) : itemPicture(open, type) ? (
              <SafeImg className="i365-modal-img" src={itemPicture(open, type)} alt={open.title_th} />
            ) : null}
            <h2>{open.title_th}</h2>
            {open.summary_th && <p>{open.summary_th}</p>}
            <FieldList item={open} fields={fields} skip={[videoKey ?? '']} />
            {str(open.data.tool_kind) === 'pro' && <p className="i365-note">ระบบนี้ทดลองใช้ได้ ถ้าสนใจใช้งานจริงหรือให้ทำแบบนี้ ติดต่อที่เกาะติดต่อได้เลย</p>}
            {showTags && <TagChips tags={tagsFor(open.id)} />}
          </div>
        </div>
      )}
    </>
  );
}

export function FeedDisplay({ entries }: { entries: FeedEntry[] }) {
  if (!entries.length) return <div className="i365-empty"><p>ยังไม่มีรายการ</p></div>;
  return (
    <div className="i365-grid i365-grid-cards">
      {entries.map((e) => (
        <a key={e.id} className="i365-card" href={e.href} target="_blank" rel="noreferrer">
          <div className="i365-card-pic"><SafeImg src={e.image} loading="lazy" fallback={<span className="i365-card-nopic">{e.title.slice(0, 1)}</span>} /></div>
          <div className="i365-card-body">
            <h3>{e.title}</h3>
            {e.summary && <p className="i365-muted">{e.summary}</p>}
            <span className="i365-tag">อ่านต่อที่ Creatr365 ↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}
