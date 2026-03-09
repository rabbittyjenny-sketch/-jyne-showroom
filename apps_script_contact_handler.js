/**
 * ══════════════════════════════════════════════════════════════
 * iDEAS365 — Google Apps Script: Contact Form Handler
 * ══════════════════════════════════════════════════════════════
 *
 * วิธีใช้:
 * 1. เปิด Google Apps Script ที่ deploy ไว้อยู่แล้ว
 * 2. Copy โค้ดส่วน doGet() ด้านล่างนี้ไปเพิ่มในไฟล์ที่มีอยู่
 *    (หรือเพิ่มใน doGet() ที่มีอยู่แล้ว โดยต่อ if-block ลงไป)
 * 3. Deploy ใหม่ → "New deployment" → Web app → Anyone can access
 * 4. คัดลอก URL ใหม่มาใส่ใน contact_port.html (ตัวแปร APPS_URL)
 *
 * Sheet ที่ต้องสร้าง: ชีทชื่อ "contacts"
 * Header Row 1: no. | name | email | business_name | business_type | datail | timestamp
 * ══════════════════════════════════════════════════════════════
 */

// ─── เพิ่มใน doGet() ที่มีอยู่แล้ว (ต่อจาก if-else block อื่นๆ) ─────────────

function doGet(e) {
  const sheet = e.parameter.sheet || '';
  const action = e.parameter.action || '';

  // ── Contact form submission ──────────────────────────────────
  if (action === 'contact' && sheet === 'contacts') {
    try {
      const ss        = SpreadsheetApp.getActiveSpreadsheet();
      let   wsContact = ss.getSheetByName('contacts');

      // สร้าง sheet ถ้ายังไม่มี
      if (!wsContact) {
        wsContact = ss.insertSheet('contacts');
        wsContact.appendRow(['no.', 'name', 'email', 'business_name', 'business_type', 'datail', 'timestamp']);
      }

      const lastRow = wsContact.getLastRow();
      const no      = lastRow; // row 1 = header → no. เริ่มที่ 1

      wsContact.appendRow([
        no,
        e.parameter.name          || '',
        e.parameter.email         || '',
        e.parameter.business_name || '',
        e.parameter.business_type || '',
        e.parameter.datail        || '',
        e.parameter.timestamp     || new Date().toISOString()
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ── (ส่วนอื่นๆ ของ doGet ที่มีอยู่เดิม ให้คงไว้ด้านล่าง) ──
  // ... existing sheet fetch logic ...
}
