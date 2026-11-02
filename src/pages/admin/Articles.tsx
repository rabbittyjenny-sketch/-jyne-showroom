// COMMUNITY · บทความ — copied from the Creatr365 repo (src/pages/AdminArticles.tsx) for iDEAS365's own table
// i365_articles: the same editor (type guide, slug, summary, YouTube clip, full body as HTML / a whole HTML
// file / a structured article file, preview, cover upload, podcast audio + sticker, tags, order, publish,
// SEO) and the same list (filter, publish toggle, edit, delete, open page, podcast plays).
// Not copied: Live Notes, events, course links and their stats — those are Creatr365's own.
import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ExternalLink, Upload, Headphones } from 'lucide-react';
import { AdminLayout, Notice } from '@/components/admin/AdminLayout';
import { supabase, IS_MOCK } from '@/integrations/supabase/client';
import { uploadMedia } from '@/lib/adminApi';
import { parseYouTubeId, youTubeThumb } from '@/lib/youtube';
import { ArticleBody, isDocumentHtml } from '@/community/components/ArticleBody';
import { looksLikeArticleScript, normalizeArticleScript, parseStructuredArticle, validateStructuredArticle } from '@/lib/articleTemplate';

interface Article {
  id: string; slug: string; title: string; summary: string; body: string | null;
  cover_image_url: string | null; kind: Kind; author: string | null;
  tags: string[] | null; meta_description: string | null; target_url: string;
  is_active: boolean; sort_order: number; created_at: string;
  video_url: string | null;
  audio_url: string | null; audio_duration_sec: number | null; audio_title: string | null; audio_image_url: string | null;
}
type Kind = 'blog' | 'video' | 'news' | 'update' | 'community' | 'tool';

const KINDS: Kind[] = ['blog', 'video', 'news', 'update', 'community', 'tool'];
const TYPE_LABEL: Record<Kind, string> = {
  blog: 'บทความ', video: 'คลิปกิจกรรม', news: 'ข่าวกิจกรรม', update: 'อัปเดต', community: 'คอมมูนิตี้', tool: 'เครื่องมือ',
};
const TYPE_GUIDE: Record<Kind, { target: string; url: string; media: string; required: string }> = {
  blog: {
    target: 'หน้า COMMUNITY HARBOR › หมวดบทความ และเปิดอ่านเป็นหน้า /community/[slug]',
    url: '/community/[slug]',
    media: 'แนะนำรูปปก 16:9 อย่างน้อย 1600x900 ชื่อไฟล์: article-[slug]-cover.jpg',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ, เนื้อหา (ไฟล์บทความ .js/JSON หรือ HTML)',
  },
  video: {
    target: 'หน้า COMMUNITY HARBOR › หมวดคลิปกิจกรรม (แถวเลื่อน) เล่นในเว็บ ไม่พาออกไป YouTube',
    url: 'เปิดเป็นหน้าต่างเล่นคลิปในหน้า /community',
    media: 'ไม่ใส่รูปปกได้ ระบบใช้ภาพจาก YouTube ให้อัตโนมัติ',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ, YouTube URL',
  },
  news: {
    target: 'หน้า COMMUNITY HARBOR › หมวดข่าวกิจกรรม',
    url: '/community/[slug] หรือ External URL',
    media: 'แนะนำรูปปก 16:9 ชื่อไฟล์: news-[slug]-cover.jpg',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ',
  },
  update: {
    target: 'หน้า COMMUNITY HARBOR › หมวดข่าวกิจกรรม',
    url: '/community/[slug]',
    media: 'ใช้รูปปกได้แต่ไม่บังคับ ชื่อไฟล์: update-[slug]-cover.jpg',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ',
  },
  community: {
    target: 'หน้า COMMUNITY HARBOR › หมวดข่าวกิจกรรม',
    url: '/community/[slug]',
    media: 'ใช้รูปปกได้แต่ไม่บังคับ ชื่อไฟล์: community-[slug]-cover.jpg',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ',
  },
  tool: {
    target: 'หน้า COMMUNITY HARBOR › หมวดบทความ (เครื่องมือที่เล่าเป็นบทความ) — การ์ดเครื่องมือจริงอยู่ที่เกาะ AI&TECH',
    url: '/community/[slug] หรือ External URL',
    media: 'แนะนำรูปปก 16:9 ชื่อไฟล์: tool-[slug]-cover.jpg',
    required: 'ชื่อเรื่อง, Slug, สรุปย่อ, URL หรือเนื้อหา',
  },
};

type EditorForm = Partial<Article> & { kind: Kind };
const EMPTY: EditorForm = {
  kind: 'blog', title: '', slug: '', summary: '', body: '', cover_image_url: '', author: 'iDEAS365', tags: [],
  meta_description: '', target_url: '', is_active: true, sort_order: 0, video_url: '',
  audio_url: '', audio_duration_sec: null, audio_title: '', audio_image_url: '',
};

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const AUDIO_TYPES: Record<string, string> = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav' };
const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const input = 'w-full bg-[#1a1a1a] border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A843]/50 placeholder-white/20';
const label = 'text-xs text-white/40 font-medium block mb-1';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9ก-๙\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

const PublishToggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className="inline-flex border border-white/10" role="group" aria-label="สถานะการเผยแพร่">
    <button type="button" onClick={() => onChange(true)} aria-pressed={value}
      className={`px-4 py-2 text-xs font-semibold transition-colors ${value ? 'bg-[#34A853] text-black' : 'text-white/40 hover:text-white'}`}>เผยแพร่</button>
    <button type="button" onClick={() => onChange(false)} aria-pressed={!value}
      className={`px-4 py-2 text-xs font-semibold transition-colors ${!value ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}>ฉบับร่าง</button>
  </div>
);

/* ─── Editor modal ─────────────────────────────────────── */
const ContentEditor: React.FC<{ initial: EditorForm; onSave: (f: EditorForm) => Promise<string | null>; onClose: () => void }> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState<EditorForm>(initial);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState((initial.tags || []).join(', '));
  const isEditingExisting = !!initial.id;
  const guide = TYPE_GUIDE[form.kind];
  const set = (k: keyof EditorForm, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  // A pasted article file (`window.C365_ARTICLE = {…}` / `window.ARTICLE = {…}`) is converted to stored JSON;
  // a structured article is checked and its problems listed before saving. Plain HTML is left as it is.
  const [bodyCheck, setBodyCheck] = useState<{ state: 'idle' | 'converting' | 'ok' | 'error'; message: string; warnings: string[] }>({ state: 'idle', message: '', warnings: [] });
  const bodyText = form.body || '';
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const structured = parseStructuredArticle(bodyText);
      if (structured) {
        if (!cancelled) setBodyCheck({
          state: 'ok',
          message: `บทความแบบโครงสร้าง · ${structured.blocks.filter((b) => b?.type === 'chapter').length} บท · ${structured.blocks.length} บล็อก — แสดงด้วยแม่แบบบทความ`,
          warnings: validateStructuredArticle(structured),
        });
        return;
      }
      if (looksLikeArticleScript(bodyText)) {
        if (!cancelled) setBodyCheck({ state: 'converting', message: 'กำลังแปลงไฟล์บทความ…', warnings: [] });
        const r = await normalizeArticleScript(bodyText);
        if (cancelled) return;
        if (r.ok) set('body', r.json);
        else setBodyCheck({ state: 'error', message: r.error || 'แปลงไฟล์ไม่สำเร็จ', warnings: [] });
        return;
      }
      if (!cancelled) setBodyCheck({ state: 'idle', message: '', warnings: [] });
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyText]);

  const pickType = (k: Kind) => { if (!isEditingExisting) setForm((f) => ({ ...f, kind: k })); };
  const handleTitle = (v: string) => { set('title', v); if (!initial.id) set('slug', slugify(v)); };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, folder: string, field: 'cover_image_url' | 'audio_image_url') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!IMAGE_TYPES.includes(file.type)) { setError('รองรับเฉพาะไฟล์ JPG, PNG, GIF หรือ WebP'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError('ไฟล์ใหญ่เกิน 5MB'); return; }
    setUploading(true);
    try { set(field, await uploadMedia(file, folder)); }
    catch (x) { setError('อัปโหลดไม่สำเร็จ: ' + (x instanceof Error ? x.message : String(x))); }
    finally { setUploading(false); }
  };

  // podcast audio: the browser reads the length from the file itself
  const uploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!AUDIO_TYPES[ext]) { setError('รองรับเฉพาะไฟล์เสียง MP3, M4A หรือ WAV'); return; }
    if (file.size > MAX_AUDIO_BYTES) { setError('ไฟล์เสียงใหญ่เกิน 50MB'); return; }
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'podcasts');
      const seconds = await new Promise<number | null>((resolve) => {
        const probe = new Audio();
        const obj = URL.createObjectURL(file);
        const done = (v: number | null) => { URL.revokeObjectURL(obj); resolve(v); };
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => done(isFinite(probe.duration) ? Math.round(probe.duration) : null);
        probe.onerror = () => done(null);
        probe.src = obj;
      });
      setForm((f) => ({ ...f, audio_url: url, audio_duration_sec: seconds }));
    } catch (x) { setError('อัปโหลดไม่สำเร็จ: ' + (x instanceof Error ? x.message : String(x))); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const err = await onSave({ ...form, tags });
    if (err) setError(err);
    setSaving(false);
  };

  const isClip = form.kind === 'video';
  const videoId = parseYouTubeId(form.video_url);
  const canSave = !!form.title && !!form.slug && !!form.summary && (!isClip || !!videoId)
    && bodyCheck.state !== 'converting' && bodyCheck.state !== 'error';

  return (
    <div className="admin-modal-surface fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-[#111] border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-[#111] border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">{initial.id ? 'แก้ไขเนื้อหา' : 'สร้างเนื้อหาใหม่'}</h2>
          <div className="flex gap-2">
            <button onClick={() => setPreview(!preview)} className="text-xs px-3 py-1.5 border border-white/15 text-white/50 hover:text-white transition-colors flex items-center gap-1">
              <Eye className="w-3 h-3" /> {preview ? 'Editor' : 'Preview'}
            </button>
            <button onClick={onClose} aria-label="ปิด" className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="content-kind" className="text-xs text-white/40 font-medium block mb-2">เลือกหมวดที่จะแสดงผล</label>
            <select id="content-kind" disabled={isEditingExisting} value={form.kind} onChange={(e) => pickType(e.target.value as Kind)}
              className="w-full bg-[#1a1a1a] border border-white/10 px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-[#D4A843]/50 disabled:opacity-40 disabled:cursor-not-allowed">
              {KINDS.map((k) => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
            </select>
            {isEditingExisting && <p className="text-white/20 text-xs mt-1.5">แก้ไขประเภทไม่ได้หลังสร้างแล้ว — ลบแล้วสร้างใหม่ถ้าต้องการเปลี่ยน</p>}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {([['แสดงที่', guide.target, false], ['ต้องเตรียม', guide.required, false], ['URL', guide.url, true], ['รูป/ไฟล์', guide.media, false]] as const).map(([h, v, mono]) => (
                <div key={h} className="border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A843] mb-1">{h}</p>
                  <p className={`text-xs text-white/55 leading-relaxed ${mono ? 'font-mono' : ''}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {preview ? (
            <div className="bg-white text-[#1A1A1A] p-6">
              <p className="text-[10px] text-neutral-400 mb-4 uppercase tracking-widest">Preview</p>
              {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-full mb-4 max-h-48 object-cover" />}
              <span className="px-2 py-0.5 text-[10px] bg-neutral-900 text-white uppercase">{TYPE_LABEL[form.kind]}</span>
              <h1 className="text-2xl font-bold mt-3 mb-2">{form.title || '(ชื่อเนื้อหา)'}</h1>
              <p className="text-neutral-500 text-sm mb-6">{form.summary}</p>
              {form.body && <ArticleBody html={form.body} />}
            </div>
          ) : (
            <>
              <div><label className={label}>ชื่อเรื่อง *</label><input className={input} placeholder="ชื่อเนื้อหา..." value={form.title || ''} onChange={(e) => handleTitle(e.target.value)} /></div>
              <div>
                <label className={label}>Slug (URL) *</label>
                <input className={`${input} font-mono`} placeholder="article-slug" value={form.slug || ''} onChange={(e) => set('slug', slugify(e.target.value))} />
                <p className="text-white/20 text-xs mt-1">URL: /community/{form.slug || 'slug'}</p>
              </div>
              <div><label className={label}>ผู้เขียน</label><input className={input} value={form.author || ''} onChange={(e) => set('author', e.target.value)} /></div>
              <div><label className={label}>สรุปย่อ / Excerpt *</label><textarea className={`${input} resize-none`} rows={3} placeholder="สรุปเนื้อหา 1-2 ประโยค..." value={form.summary || ''} onChange={(e) => set('summary', e.target.value)} /></div>
              {isClip && (
                <div className="border border-white/10 p-4">
                  <label htmlFor="clip-url" className={label}>YouTube URL *</label>
                  <input id="clip-url" className={`${input} font-mono`} placeholder="https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                    value={form.video_url || ''} onChange={(e) => set('video_url', e.target.value.trim())} />
                  {form.video_url && !videoId && <p className="text-xs text-[#FF6B7F] mt-1">อ่านลิงก์นี้ไม่ได้ ใช้ลิงก์จากปุ่มแชร์ของ YouTube</p>}
                  {videoId && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={form.cover_image_url || youTubeThumb(videoId)} alt="" className="w-28 aspect-video object-cover border border-white/10" />
                      <p className="text-xs text-white/40">คลิปจะเล่นในเว็บ ไม่พาผู้ชมออกไป YouTube</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className={label}>{isClip ? 'รายละเอียดใต้คลิป (HTML, ไม่บังคับ)' : 'เนื้อหาเต็ม (HTML) — ใส่เนื้อหาเต็มที่นี่'}</label>
                <textarea className={`${input} font-mono resize-y`} rows={12} placeholder={'<h2>หัวข้อ</h2>\n<p>เนื้อหา...</p>\n<ul>\n  <li>รายการ 1</li>\n</ul>'}
                  value={form.body || ''} onChange={(e) => set('body', e.target.value)} />
                <p className="text-white/20 text-xs mt-1">
                  <span className="text-white/40 font-semibold">ใส่ได้ 3 แบบ:</span> ไฟล์เนื้อหาบทความแบบโครงสร้าง (window.C365_ARTICLE = …) ระบบแปลงและแสดงด้วยแม่แบบบทความให้เอง
                  · HTML ทั้งหน้าที่มี &lt;style&gt; / &lt;html&gt; (แสดงตามไฟล์) · HTML ชิ้นสั้น h1-h4, p, ul/ol/li, a, strong, em, blockquote, img
                </p>
                {bodyCheck.state !== 'idle' && (
                  <div className={`mt-2 text-xs ${bodyCheck.state === 'error' ? 'text-[#FF6B7F]' : bodyCheck.state === 'ok' ? 'text-[#34A853]' : 'text-white/50'}`} role={bodyCheck.state === 'error' ? 'alert' : 'status'}>
                    <p>{bodyCheck.state === 'ok' ? '✓ ' : ''}{bodyCheck.message}</p>
                    {bodyCheck.warnings.length > 0 && <ul className="mt-1 list-disc pl-5 text-[#D4A843]">{bodyCheck.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
                  </div>
                )}
                {isDocumentHtml(form.body) && /\{\{\s*[\w.]+\s*\}\}|<sc-(if|for)/i.test(form.body || '') && (
                  <p className="text-[#FF6B7F] text-xs mt-1" role="alert">นี่คือไฟล์แม่แบบที่ยังไม่มีเนื้อหา (มี {'{{ }}'} / &lt;sc-if&gt;) — ใช้ไฟล์ HTML ที่แสดงบทความครบแล้ว</p>
                )}
              </div>
              {!isClip && (
                <div>
                  <label className={label}>External URL (ถ้าลิงก์ไปภายนอก)</label>
                  <input className={input} placeholder="https://..." value={form.target_url || ''} onChange={(e) => set('target_url', e.target.value)} />
                  {parseYouTubeId(form.target_url) && <p className="text-xs text-[#D4A843] mt-1">ลิงก์นี้เป็น YouTube — หน้า COMMUNITY จะเล่นในเว็บให้ แต่ถ้าเป็นคลิป แนะนำเลือกประเภท "คลิปกิจกรรม"</p>}
                </div>
              )}
              <div>
                <label className={label}>รูปปก</label>
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-full h-32 object-cover mb-2 border border-white/10" />}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] border border-dashed border-white/15 px-4 py-3 text-white/40 text-sm cursor-pointer hover:text-white hover:border-white/30 transition-colors sm:w-56">
                    <Upload className="w-4 h-4" />{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปปก'}
                    <input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'articles', 'cover_image_url')} disabled={uploading} className="hidden" />
                  </label>
                  <input className={`flex-1 ${input}`} placeholder="หรือวาง URL รูปปกจากภายนอก..." value={form.cover_image_url || ''} onChange={(e) => set('cover_image_url', e.target.value)} />
                </div>
              </div>
              {!isClip && (
                <div className="border border-white/10 p-4 space-y-3">
                  <label className="text-xs text-white/40 font-medium flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5" /> Podcast (เสียงประกอบบทความ — ไม่บังคับ)</label>
                  {form.audio_url ? (
                    <div className="space-y-2">
                      <audio controls preload="metadata" src={form.audio_url} className="w-full" />
                      <div className="flex items-center justify-between gap-3 text-xs text-white/40">
                        <span>{form.audio_duration_sec ? `ความยาว ${Math.floor(form.audio_duration_sec / 60)}:${String(form.audio_duration_sec % 60).padStart(2, '0')} นาที` : 'ยังอ่านความยาวไม่ได้'}</span>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, audio_url: '', audio_duration_sec: null }))} className="text-[#FF6B7F] hover:opacity-80">เอาเสียงออก (ปุ่ม Podcast จะหายจากหน้าบทความ)</button>
                      </div>
                    </div>
                  ) : <p className="text-xs text-white/30">ยังไม่มีเสียง — หน้าบทความจะไม่แสดงปุ่ม "ฟังเป็น Podcast"</p>}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] border border-dashed border-white/15 px-4 py-3 text-white/40 text-sm cursor-pointer hover:text-white hover:border-white/30 transition-colors sm:w-56">
                      <Upload className="w-4 h-4" />{uploading ? 'กำลังอัปโหลด...' : form.audio_url ? 'เปลี่ยนไฟล์เสียง' : 'อัปโหลดไฟล์เสียง (MP3/M4A/WAV, ≤50MB)'}
                      <input type="file" accept=".mp3,.m4a,.wav,audio/*" onChange={uploadAudio} disabled={uploading} className="hidden" />
                    </label>
                    <input className={`flex-1 ${input}`} placeholder="หรือวาง URL ไฟล์เสียงจากภายนอก..." value={form.audio_url || ''}
                      onChange={(e) => setForm((f) => ({ ...f, audio_url: e.target.value.trim(), audio_duration_sec: null }))} />
                  </div>
                  {form.audio_url && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                      <div>
                        <label htmlFor="podcast-title" className={label}>ชื่อพอตแคสต์ (ไม่บังคับ — ถ้าเว้นว่างจะใช้ชื่อบทความ)</label>
                        <input id="podcast-title" className={input} placeholder={form.title || 'ชื่อที่จะแสดงบนเทป'} maxLength={80} value={form.audio_title || ''} onChange={(e) => set('audio_title', e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        {form.audio_image_url && <img src={form.audio_image_url} alt="" className="w-10 h-10 object-cover border border-white/10" />}
                        <label className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-dashed border-white/15 px-3 py-2.5 text-white/40 text-xs cursor-pointer hover:text-white hover:border-white/30 transition-colors">
                          <Upload className="w-3.5 h-3.5" />{form.audio_image_url ? 'เปลี่ยนรูปสติกเกอร์' : 'รูปสติกเกอร์ (เล็ก)'}
                          <input type="file" accept="image/*" onChange={(e) => uploadImage(e, 'podcasts', 'audio_image_url')} disabled={uploading} className="hidden" />
                        </label>
                        {form.audio_image_url && <button type="button" onClick={() => set('audio_image_url', '')} className="text-[11px] text-[#FF6B7F] hover:opacity-80">เอาออก</button>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={label}>Tags (คั่นด้วย ,)</label><input className={input} placeholder="live commerce, tips" value={tagInput} onChange={(e) => setTagInput(e.target.value)} /></div>
                <div><label className={label}>ลำดับ (น้อย = ขึ้นก่อน)</label><input type="number" className={input} value={form.sort_order ?? 0} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} /></div>
                <div className="flex items-end"><PublishToggle value={form.is_active ?? true} onChange={(v) => set('is_active', v)} /></div>
              </div>
              <div><label className={label}>Meta Description (SEO)</label><textarea className={`${input} resize-none`} rows={2} placeholder="คำอธิบายสำหรับ Google (150-160 ตัวอักษร)" value={form.meta_description || ''} onChange={(e) => set('meta_description', e.target.value)} /></div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#111] border-t border-white/8 px-6 py-4 flex items-center justify-end gap-3">
          {error && <p className="mr-auto text-xs text-[#FF6B7F]" role="alert">{error}</p>}
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving || !canSave} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#D4A843] text-black disabled:opacity-40 hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" />{saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main page ─────────────────────────────────────────── */
type FilterKey = 'all' | 'video' | 'articles' | 'news';
const FILTERS: [FilterKey, string, Kind[]][] = [
  ['all', 'ทั้งหมด', KINDS], ['video', 'คลิปกิจกรรม', ['video']], ['articles', 'บทความ', ['blog', 'tool']], ['news', 'ข่าวกิจกรรม', ['news', 'update', 'community']],
];

export default function Articles() {
  const [rows, setRows] = useState<Article[]>([]);
  const [editing, setEditing] = useState<EditorForm | false>(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [plays, setPlays] = useState<Record<string, { plays: number; completed: number }>>({});

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), ok ? 3000 : 6000); };

  const load = useCallback(async () => {
    if (IS_MOCK) { setLoading(false); return; }
    const [{ data: articleData, error }, { data: playData }] = await Promise.all([
      supabase.from('i365_articles').select('*').order('sort_order'),
      supabase.from('i365_podcast_plays').select('article_id,completed'),
    ]);
    if (error) flash('โหลดไม่สำเร็จ: ' + error.message, false);
    const pl: Record<string, { plays: number; completed: number }> = {};
    for (const p of (playData as unknown as { article_id: string; completed: boolean }[]) || []) {
      const c = (pl[p.article_id] ??= { plays: 0, completed: 0 });
      c.plays++; if (p.completed) c.completed++;
    }
    setPlays(pl);
    setRows((articleData as unknown as Article[]) || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: EditorForm): Promise<string | null> => {
    if (IS_MOCK) return 'โหมดจำลอง: บันทึกไม่ได้';
    if (!form.title || !form.slug) return 'กรอกชื่อเรื่องและ Slug';
    const isClip = form.kind === 'video';
    const payload = {
      title: form.title, slug: form.slug, summary: form.summary ?? '', body: form.body || null,
      cover_image_url: form.cover_image_url || null, author: form.author || null, tags: form.tags ?? [],
      meta_description: form.meta_description || null, target_url: form.target_url || '',
      is_active: form.is_active ?? true, sort_order: form.sort_order ?? 0, kind: form.kind,
      video_url: isClip ? (form.video_url || null) : null,
      audio_url: isClip ? null : ((form.audio_url || '').trim() || null),
      audio_duration_sec: isClip || !form.audio_url ? null : (form.audio_duration_sec ?? null),
      audio_title: isClip || !form.audio_url ? null : ((form.audio_title || '').trim() || null),
      audio_image_url: isClip || !form.audio_url ? null : ((form.audio_image_url || '').trim() || null),
    };
    if (isClip && !parseYouTubeId(payload.video_url)) return 'ใส่ YouTube URL ให้ถูกต้อง';
    const { error } = form.id
      ? await supabase.from('i365_articles').update(payload).eq('id', form.id)
      : await supabase.from('i365_articles').insert([payload]);
    if (error) return error.code === '23505' ? 'Slug นี้มีอยู่แล้ว — เปลี่ยน Slug ใหม่' : 'บันทึกไม่สำเร็จ: ' + error.message;
    flash(form.id ? 'อัปเดตเนื้อหาเรียบร้อย' : 'สร้างเนื้อหาใหม่เรียบร้อย');
    setEditing(false);
    load();
    return null;
  };

  const togglePublished = async (row: Article) => {
    const { error } = await supabase.from('i365_articles').update({ is_active: !row.is_active }).eq('id', row.id);
    if (error) flash('เปลี่ยนสถานะไม่สำเร็จ: ' + error.message, false);
    load();
  };

  const handleDelete = async (row: Article) => {
    if (!confirm(`ลบ "${row.title}"? ถ้าแค่ต้องการซ่อน ให้ใช้ "ฉบับร่าง" แทน`)) return;
    const { error } = await supabase.from('i365_articles').delete().eq('id', row.id);
    if (error) flash('ลบไม่สำเร็จ: ' + error.message, false);
    load();
  };

  const kindsOf = (k: FilterKey) => FILTERS.find((f) => f[0] === k)![2];
  const visible = rows.filter((r) => kindsOf(filter).includes(r.kind));

  return (
    <>
      <AdminLayout title="COMMUNITY · บทความ" eyebrow="COMMUNITY HARBOR"
        actions={<button onClick={() => setEditing({ ...EMPTY, kind: filter === 'video' ? 'video' : filter === 'news' ? 'news' : 'blog' })}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#D4A843] text-black hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> สร้างเนื้อหาใหม่</button>}>
        <Notice msg={msg} />
        <p className="text-white/40 text-xs mb-4">เนื้อหาของหน้า <a className="underline" href="/community" target="_blank" rel="noreferrer">COMMUNITY HARBOR (/community)</a> — เก็บในตารางของ iDEAS365 เอง ไม่เกี่ยวกับบทความของ Creatr365</p>
        <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="กรองประเภทเนื้อหา">
          {FILTERS.map(([k, l, kinds]) => (
            <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
              className={`px-4 py-2 text-xs font-semibold border transition-colors ${filter === k ? 'bg-[#D4A843] text-black border-[#D4A843]' : 'border-white/10 text-white/50 hover:text-white'}`}>
              {l} <span className="opacity-60">({rows.filter((r) => kinds.includes(r.kind)).length})</span>
            </button>
          ))}
        </div>
        {loading ? <div className="text-white/30 text-sm py-12 text-center">กำลังโหลด...</div> : (
          <div className="border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111] border-b border-white/8">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-semibold tracking-widest uppercase">ชื่อ</th>
                  <th className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase hidden md:table-cell">ประเภท</th>
                  <th className="text-center px-4 py-3 text-white/30 text-xs font-semibold uppercase hidden sm:table-cell">สถานะ</th>
                  <th className="text-right px-5 py-3 text-white/30 text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((row) => (
                  <tr key={row.id} className="bg-[#0D0D0D] hover:bg-[#131313] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm line-clamp-1">{row.title}</p>
                      <p className="text-white/30 text-xs mt-0.5 font-mono">/community/{row.slug} · ลำดับ {row.sort_order}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell"><span className="px-2 py-0.5 text-[10px] font-bold bg-white/8 text-white/50 uppercase">{TYPE_LABEL[row.kind] || row.kind}</span></td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${row.is_active ? 'text-[#34A853]' : 'text-white/30'}`}>{row.is_active ? '● เผยแพร่' : '○ ฉบับร่าง'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {row.audio_url && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border border-white/10 text-white/60"
                            title={`ฟังเป็น Podcast ${plays[row.id]?.plays ?? 0} ครั้ง · ฟังจบ ${plays[row.id]?.completed ?? 0} ครั้ง`}>
                            <Headphones className="w-3.5 h-3.5" aria-hidden="true" /><span className="hidden sm:inline">ฟัง</span><span className="font-mono">{plays[row.id]?.plays ?? 0}</span>
                          </span>
                        )}
                        {row.is_active && (row.body || row.target_url.startsWith('/')) && (
                          <a href={`/community/${row.slug}`} target="_blank" rel="noopener noreferrer" aria-label="เปิดดูหน้าเว็บ" className="p-1.5 text-white/30 hover:text-white hover:bg-white/8 transition-all"><ExternalLink className="w-3.5 h-3.5" /></a>
                        )}
                        <button onClick={() => togglePublished(row)} aria-label={row.is_active ? 'เปลี่ยนเป็นฉบับร่าง' : 'เผยแพร่'} title={row.is_active ? 'เปลี่ยนเป็นฉบับร่าง' : 'เผยแพร่'}
                          className="p-1.5 text-white/30 hover:text-white hover:bg-white/8 transition-all">{row.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                        <button onClick={() => setEditing({ ...row })} aria-label="แก้ไข" className="p-1.5 text-white/30 hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(row)} aria-label="ลบ" className="p-1.5 text-white/30 hover:text-[#CC0033] hover:bg-[#CC0033]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-white/20">ยังไม่มีเนื้อหาในหมวดนี้ — กด "+ สร้างเนื้อหาใหม่" เพื่อเริ่ม</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
      {editing !== false && <ContentEditor initial={editing} onSave={handleSave} onClose={() => setEditing(false)} />}
    </>
  );
}
