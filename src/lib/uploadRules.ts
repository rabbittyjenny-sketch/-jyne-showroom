// Which files each upload box accepts, in one place.
// A field in an item type can name its rule with "upload" (e.g. {"type":"file","upload":"pdf"});
// without it, image fields use 'image' and file fields use 'document'.
// The i365-media bucket enforces the same types and a 50MB ceiling on the server
// (migration 20261103120000_i365_upload_rules.sql), so a direct upload cannot bypass these rules.
// Video is never uploaded: clips and video work are entered as links (YouTube / TikTok / Facebook).
import type { FieldDef } from './types';

export type UploadKind = 'image' | 'pdf' | 'document' | 'design' | 'audio';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
};

export const UPLOAD_RULES: Record<UploadKind, { exts: string[]; maxMB: number; hint: string; label: string }> = {
  image:    { exts: ['jpg', 'jpeg', 'png', 'webp'], maxMB: 5, label: 'รูปภาพ', hint: 'รูป JPG / PNG / WEBP ไม่เกิน 5MB · หรือวางลิงก์รูป' },
  pdf:      { exts: ['pdf'], maxMB: 20, label: 'PDF', hint: 'PDF ไม่เกิน 20MB · หรือวางลิงก์' },
  document: { exts: ['pdf', 'docx', 'xlsx', 'pptx', 'zip'], maxMB: 20, label: 'เอกสาร', hint: 'PDF / DOCX / XLSX / PPTX / ZIP ไม่เกิน 20MB · หรือวางลิงก์' },
  design:   { exts: ['pdf', 'jpg', 'jpeg', 'png', 'webp'], maxMB: 20, label: 'PDF หรือรูป', hint: 'PDF หรือรูป JPG / PNG / WEBP ไม่เกิน 20MB · วิดีโอให้ใส่เป็นลิงก์' },
  audio:    { exts: ['mp3', 'm4a', 'wav'], maxMB: 50, label: 'ไฟล์เสียง', hint: 'MP3 / M4A / WAV ไม่เกิน 50MB · หรือวางลิงก์' },
};

export const UPLOAD_KINDS = Object.keys(UPLOAD_RULES) as UploadKind[];

export const ruleForField = (f: Pick<FieldDef, 'type' | 'upload'>): UploadKind =>
  f.upload && f.upload in UPLOAD_RULES ? f.upload : f.type === 'image' ? 'image' : 'document';

export const acceptFor = (kind: UploadKind) => UPLOAD_RULES[kind].exts.map((e) => '.' + e).join(',');

const extOf = (name: string) => (name.split('.').pop() || '').toLowerCase();

/** null = OK, otherwise the Thai reason the file is refused. */
export function checkFile(file: File, kind: UploadKind): string | null {
  const r = UPLOAD_RULES[kind];
  if (!r.exts.includes(extOf(file.name))) return `ไฟล์ "${file.name}" ใช้ไม่ได้ในช่องนี้ — รับ ${r.exts.map((e) => e.toUpperCase()).join(' / ')}`;
  if (file.size > r.maxMB * 1024 * 1024) return `ไฟล์ "${file.name}" ใหญ่ ${(file.size / 1048576).toFixed(1)}MB — ช่องนี้รับไม่เกิน ${r.maxMB}MB`;
  return null;
}

/** Content type from the extension (browsers leave file.type empty for some files, e.g. .m4a on Windows). */
export const contentTypeOf = (file: File) => MIME[extOf(file.name)] || file.type || 'application/octet-stream';
