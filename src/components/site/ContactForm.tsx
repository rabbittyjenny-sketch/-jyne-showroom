import { useState } from 'react';
import { sendInquiry } from '@/lib/data';
import type { SiteSettings } from '@/lib/types';
import { SafeImg } from './SafeImg';

const INTERESTS = [
  'F&B · ผู้ช่วยผู้บริหาร',
  'Live Streamer · ไลฟ์ขายของ',
  'Beauty · Content',
  'งานออกแบบ / หน้าเว็บ',
  'เครื่องมือ / ระบบ',
  'เอกสาร / เทมเพลต',
  'อื่นๆ',
];

export function ContactForm({ settings, sourceIsland, sourceRoute }: { settings: SiteSettings | null; sourceIsland?: string; sourceRoute?: string }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', interest: '', message: '', consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const set = (k: keyof typeof f, v: string | boolean) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = 'กรอกชื่อ';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) errs.email = 'กรอกอีเมลให้ถูกต้อง';
    if (!f.interest) errs.interest = 'เลือกเรื่องที่สนใจ';
    if (!f.consent) errs.consent = 'กรุณากดยินยอมก่อนส่ง';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus('sending');
    try {
      await sendInquiry({ ...f, source_island: sourceIsland, source_route: sourceRoute });
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent') {
    return <div className="i365-sent"><h3>ได้รับข้อความแล้วค่ะ</h3><p>จะติดต่อกลับทางอีเมลที่ให้ไว้</p></div>;
  }

  return (
    <div className="i365-contact">
      <form className="i365-form" onSubmit={submit} noValidate>
        <label>ชื่อ *<input value={f.name} onChange={(e) => set('name', e.target.value)} />{errors.name && <span className="i365-error">{errors.name}</span>}</label>
        <label>อีเมล *<input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />{errors.email && <span className="i365-error">{errors.email}</span>}</label>
        <label>เบอร์โทร<input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></label>
        <label>บริษัท / ธุรกิจ<input value={f.company} onChange={(e) => set('company', e.target.value)} /></label>
        <label>สนใจเรื่อง *
          <select value={f.interest} onChange={(e) => set('interest', e.target.value)}>
            <option value="">— เลือก —</option>
            {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          {errors.interest && <span className="i365-error">{errors.interest}</span>}
        </label>
        <label className="i365-span2">ข้อความ<textarea rows={5} value={f.message} onChange={(e) => set('message', e.target.value)} /></label>
        <label className="i365-check i365-span2"><input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} /> ยินยอมให้เก็บข้อมูลนี้เพื่อติดต่อกลับ</label>
        {errors.consent && <span className="i365-error i365-span2">{errors.consent}</span>}
        {status === 'failed' && <p className="i365-error i365-span2">ส่งไม่สำเร็จ ลองใหม่อีกครั้ง หรืออีเมลมาที่ {settings?.contact_email}</p>}
        <button className="i365-pill i365-pill-solid i365-span2" disabled={status === 'sending'}>{status === 'sending' ? 'กำลังส่ง…' : 'ส่งข้อความ →'}</button>
      </form>
      <aside className="i365-contact-side">
        {settings?.contact_email && <a href={`mailto:${settings.contact_email}`} className="i365-pill">✉ {settings.contact_email}</a>}
        {settings?.socials?.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="i365-pill">{s.label} {s.handle}</a>)}
        {settings?.line_qr && (
          <figure className="i365-line-qr">
            <SafeImg src={settings.line_qr} alt="LINE QR" />
            {settings.line_qr_caption && <figcaption>{settings.line_qr_caption}</figcaption>}
          </figure>
        )}
        {settings?.contact_promise_th && (
          <ul className="i365-promise">
            {settings.contact_promise_th.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => <li key={l}>{l}</li>)}
          </ul>
        )}
      </aside>
    </div>
  );
}
