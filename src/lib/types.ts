// Shapes of the i365_ tables (see supabase/migrations/20261030120000_i365_schema.sql).

export type FieldType =
  | 'text' | 'textarea' | 'url' | 'video' | 'image' | 'file' | 'month' | 'number' | 'select' | 'boolean';

export interface FieldDef {
  key: string;
  label_th: string;
  label_en?: string;
  type: FieldType;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface Features {
  has_filters?: boolean;
  has_tags?: boolean;
  has_route_tags?: boolean;
  has_contact_cta?: boolean;
  has_download?: boolean;
  is_redirect?: boolean;
  has_contact_form?: boolean;
}

export const FEATURE_LABELS: Record<keyof Features, string> = {
  has_filters: 'ตัวกรองตามหมวด',
  has_tags: 'แสดงแท็ก',
  has_route_tags: 'ใช้ในเส้นทางสมัครงานได้',
  has_contact_cta: 'ปุ่ม "ติดต่อ" ท้ายหน้า',
  has_download: 'ปุ่มดาวน์โหลด',
  is_redirect: 'พาไปเว็บอื่น (หน้าแนะนำสั้น + โหลดไปต่อ)',
  has_contact_form: 'ฟอร์มติดต่อ',
};

export interface IslandTemplate {
  id: string; slug: string; name_th: string; name_en: string | null; icon: string | null;
  description_th: string | null; default_features: Features; is_active: boolean; sort_order: number;
}

export interface Island {
  id: string; slug: string; template_id: string | null;
  name_th: string; name_en: string | null; tooltip_th: string | null;
  intro_th: string | null; intro_en: string | null;
  features: Features;
  button_image: string | null; land_image: string | null; land_aspect: string; mobile_focus_x: number;
  pos_left: number | null; pos_top: number | null; pos_width: number | null;
  redirect_url: string | null; redirect_delay_ms: number;
  is_published: boolean; sort_order: number; deleted_at: string | null;
}

export type SourceType = 'items' | 'c365_articles' | 'c365_toolbox' | 'external_link' | 'contact_form';
export type DisplayStyle = 'cards' | 'video_grid' | 'gallery' | 'timeline' | 'list' | 'text' | 'feed';

export const SOURCE_LABELS: Record<SourceType, string> = {
  items: 'ผลงานในระบบ',
  c365_articles: 'บทความจาก Creatr365',
  c365_toolbox: 'เทมเพลตจาก Creatr365 Toolbox',
  external_link: 'ลิงก์ไปเว็บอื่น',
  contact_form: 'ฟอร์มติดต่อ',
};

export const DISPLAY_LABELS: Record<DisplayStyle, string> = {
  cards: 'การ์ด',
  video_grid: 'ตารางคลิป',
  gallery: 'แกลเลอรีรูป',
  timeline: 'ไทม์ไลน์',
  list: 'รายการดาวน์โหลด',
  text: 'บทความ / ข้อความ',
  feed: 'ดึงจากแหล่งอื่น',
};

export interface Section {
  id: string; island_id: string; slug: string;
  name_th: string; name_en: string | null; description_th: string | null;
  item_type_id: string | null; source_type: SourceType; source_config: Record<string, unknown>;
  external_url: string | null; display_style: DisplayStyle; filter_mode: 'categories' | 'tags' | 'none';
  button_image: string | null; cover_image: string | null;
  pos_left: number | null; pos_top: number | null; pos_width: number | null;
  is_published: boolean; sort_order: number; deleted_at: string | null;
}

export interface ItemType {
  id: string; slug: string; name_th: string; name_en: string | null; icon: string | null;
  fields: FieldDef[]; features: { has_cover?: boolean; bulk_field?: string | null };
  default_display: DisplayStyle; is_active: boolean; sort_order: number;
}

export interface Category {
  id: string; section_id: string; parent_id: string | null; slug: string;
  name_th: string; name_en: string | null; sort_order: number; is_active: boolean;
}

export interface TagGroup { id: string; slug: string; name_th: string; name_en: string | null; allow_multiple: boolean; sort_order: number }
export interface Tag { id: string; group_id: string; slug: string; name_th: string; name_en: string | null; sort_order: number }

export interface Item {
  id: string; section_id: string; item_type_id: string; category_id: string | null;
  title_th: string; title_en: string | null; summary_th: string | null; summary_en: string | null;
  cover_image: string | null; data: Record<string, unknown>;
  is_featured: boolean; is_published: boolean; sort_order: number; batch_id: string | null;
  created_at?: string;
}

export interface Route {
  id: string; slug: string; title_th: string; title_en: string | null;
  headline_th: string | null; headline_en: string | null; summary_th: string | null; summary_en: string | null;
  resume_url: string | null; cover_image: string | null; is_published: boolean; sort_order: number;
}
export interface RouteVariant { id: string; route_id: string; slug: string; title_th: string; title_en: string | null; headline_th: string | null }
export interface RouteItem { route_id: string; item_id: string; sort_order: number; note_th: string | null }

export interface SiteSettings {
  main_map_image?: string; main_map_aspect?: string; logo?: string; contact_email?: string;
  socials?: { label: string; handle: string; url: string }[];
}

export interface FeedEntry { id: string; title: string; summary: string | null; image: string | null; href: string }
