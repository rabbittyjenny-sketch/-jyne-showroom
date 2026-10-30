// Island colour themes, taken from the CSS of the original island pages (jyne-showroom).
// Each island stores { preset, ...overrides } in i365_islands.theme, so a new island or a
// colour change never needs code: pick a preset in the back office and adjust any colour.
import type { CSSProperties } from 'react';

export interface ThemeColors {
  bg: string;          // page background
  onBg: string;        // big title / text on the page background
  pageSweep: string;   // colour the page title sweeps to on hover
  card: string;        // content card
  cardText: string;    // body text inside cards
  muted: string;       // secondary text inside cards
  accent: string;      // card titles, lines, buttons
  accentText: string;  // text on accent buttons
  titleSweep: string;  // colour card titles sweep to on hover
  inner: string;       // boxes inside a card (stat boxes, tool cards)
  line: string;        // dividers inside cards
  inputBg: string;     // form fields inside cards
}

export type ThemePresetKey = 'about' | 'marina' | 'works' | 'learning' | 'district' | 'blog' | 'contact';

export const THEME_PRESETS: Record<ThemePresetKey, { label: string; from: string } & ThemeColors> = {
  about: {
    label: 'ส้มอิฐ', from: 'About Island เดิม',
    bg: '#B03A00', onBg: '#FFFFFF', pageSweep: '#1A1A1A',
    card: '#FFFFFF', cardText: '#3A3A3A', muted: '#888888', accent: '#B03A00', accentText: '#FFFFFF', titleSweep: '#3A3A3A',
    inner: '#F5F5F5', line: '#EEEEEE', inputBg: '#FFFFFF',
  },
  marina: {
    label: 'น้ำเงิน', from: 'Work Marina เดิม',
    bg: '#1565C0', onBg: '#FFFFFF', pageSweep: '#1A1A1A',
    card: '#FFFFFF', cardText: '#1A1A1A', muted: '#888888', accent: '#1E88E5', accentText: '#FFFFFF', titleSweep: '#1A1A1A',
    inner: '#E3F2FD', line: '#EEEEEE', inputBg: '#FFFFFF',
  },
  works: {
    label: 'เหลือง-ดำ', from: 'Works Town เดิม',
    bg: '#F5B800', onBg: '#1A1A1A', pageSweep: '#FFFFFF',
    card: '#1A1A1A', cardText: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', accent: '#F5B800', accentText: '#1A1A1A', titleSweep: '#FFFFFF',
    inner: '#2C2C2C', line: 'rgba(255,255,255,0.1)', inputBg: '#2C2C2C',
  },
  learning: {
    label: 'ฟ้า', from: 'Learning Bay เดิม',
    bg: '#1A6BCC', onBg: '#FFFFFF', pageSweep: '#1A1A1A',
    card: '#FFFFFF', cardText: '#1A1A1A', muted: '#888888', accent: '#1155AA', accentText: '#FFFFFF', titleSweep: '#1A1A1A',
    inner: '#F5F5F0', line: '#EEEEEE', inputBg: '#FFFFFF',
  },
  district: {
    label: 'เขียว', from: 'Academy Bay เดิม',
    bg: '#1E7A3E', onBg: '#FFFFFF', pageSweep: '#1A1A1A',
    card: '#FFFFFF', cardText: '#1A1A1A', muted: '#888888', accent: '#1E7A3E', accentText: '#FFFFFF', titleSweep: '#1A1A1A',
    inner: '#F4FAF7', line: '#EEEEEE', inputBg: '#FFFFFF',
  },
  blog: {
    label: 'ขาว 4 สี', from: 'Blog Harbor เดิม',
    bg: '#FFFFFF', onBg: '#1A1A1A', pageSweep: '#4285F4',
    card: '#FFFFFF', cardText: '#1A1A1A', muted: '#888888', accent: '#4285F4', accentText: '#FFFFFF', titleSweep: '#1A1A1A',
    inner: '#F7F7F7', line: '#EEEEEE', inputBg: '#FFFFFF',
  },
  contact: {
    label: 'ดำ-แดง', from: 'Contact Port เดิม',
    bg: '#1A1A1A', onBg: '#FFFFFF', pageSweep: '#EA4335',
    card: '#EA4335', cardText: '#1A1A1A', muted: 'rgba(0,0,0,0.65)', accent: '#1A1A1A', accentText: '#FFFFFF', titleSweep: '#FFFFFF',
    inner: 'rgba(0,0,0,0.1)', line: 'rgba(0,0,0,0.15)', inputBg: 'rgba(0,0,0,0.08)',
  },
};

export const THEME_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'bg', label: 'สีพื้นหน้า' },
  { key: 'onBg', label: 'ตัวหนังสือบนพื้น' },
  { key: 'card', label: 'สีการ์ด' },
  { key: 'cardText', label: 'ตัวหนังสือในการ์ด' },
  { key: 'accent', label: 'สีหัวข้อ / ปุ่ม' },
  { key: 'accentText', label: 'ตัวหนังสือบนปุ่ม' },
  { key: 'pageSweep', label: 'สีกวาดเมื่อชี้ชื่อเกาะ' },
  { key: 'titleSweep', label: 'สีกวาดเมื่อชี้หัวข้อ' },
];

export type IslandTheme = Partial<ThemeColors> & { preset?: ThemePresetKey };

export const DEFAULT_PRESET: ThemePresetKey = 'blog';

export function resolveTheme(theme?: IslandTheme | null): ThemeColors & { preset: ThemePresetKey } {
  const preset = theme?.preset && theme.preset in THEME_PRESETS ? theme.preset : DEFAULT_PRESET;
  const { label: _l, from: _f, ...base } = THEME_PRESETS[preset];
  const overrides = Object.fromEntries(Object.entries(theme ?? {}).filter(([k, v]) => k !== 'preset' && typeof v === 'string' && v));
  return { ...base, ...overrides, preset };
}

/** CSS variables for a page; every themed rule in site.css reads these. */
export function themeVars(theme?: IslandTheme | null): CSSProperties {
  const t = resolveTheme(theme);
  return {
    '--t-bg': t.bg, '--t-onbg': t.onBg, '--t-page-sweep': t.pageSweep,
    '--t-card': t.card, '--t-text': t.cardText, '--t-muted': t.muted,
    '--t-accent': t.accent, '--t-accent-text': t.accentText, '--t-title-sweep': t.titleSweep,
    '--t-inner': t.inner, '--t-line': t.line, '--t-input': t.inputBg,
  } as CSSProperties;
}
