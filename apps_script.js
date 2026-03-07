/**
 * iDEAS365 Showroom — Unified Apps Script
 * ═══════════════════════════════════════════════════════════════
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ของคุณ → Extensions → Apps Script
 * 2. ลบโค้ดเดิมทั้งหมด แล้ว paste โค้ดนี้แทน
 * 3. บันทึก (Ctrl+S)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. คัดลอก URL ที่ได้ → ใส่ใน APPS_SCRIPT_URL ในทุกหน้า HTML
 *
 * Sheet tabs ที่ต้องมีใน Spreadsheet:
 *   blog, learning, learning_subscript,
 *   work_ai, work_commerce, work__creative,
 *   school_service1, school_service2
 *
 * ── GET  ?sheet=NAME  →  คืนข้อมูลทุก row จาก tab ชื่อ NAME ──
 * ── POST (JSON body)  →  บันทึก subscription ลง learning_subscript ──
 * ═══════════════════════════════════════════════════════════════
 */

// ── Allowed sheet names (whitelist เพื่อความปลอดภัย) ──────────
// หมายเหตุ: Sheet1 = learning resources, Sheet2 = subscription log
var ALLOWED_SHEETS = [
  'Sheet1',          // learning resources: id | catagory | name | url | update
  'blog',            // blog posts: id | slug | title | category | excerpt_thai | excerpt_eng | time | date | image_url | course_url
  'work_ai',         // AI projects: id | title | titleTh | description | descriptionTh | category | status | link | logo | previewImage | section | tags
  'work_commerce',   // Commerce projects: (same columns as work_ai)
  'work__creative',  // Creative projects: (same columns as work_ai)
  'school_service1', // School cards: (blog-style)
  'school_service2'  // Service cards: id | title | titleTh | description | descriptionTh | type | price | url_picture
];

// ─────────────────────────────────────────────────────────────
//  doGet — อ่านข้อมูลจาก tab ที่ระบุ
//  URL: <SCRIPT_URL>?sheet=blog
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  var sheetName = (e.parameter.sheet || '').trim();

  if (!sheetName) {
    return jsonOut({ success: false, error: 'Missing ?sheet= parameter. Allowed: ' + ALLOWED_SHEETS.join(', ') });
  }
  if (ALLOWED_SHEETS.indexOf(sheetName) === -1) {
    return jsonOut({ success: false, error: 'Sheet "' + sheetName + '" not allowed.' });
  }

  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonOut({ success: false, error: 'Sheet "' + sheetName + '" not found in this Spreadsheet.' });
    }

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return jsonOut({ success: true, count: 0, data: [] });
    }

    var headers = rows[0].map(function(h) { return String(h).trim(); });
    var data = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      // ข้ามแถวที่ว่างทั้งหมด
      if (row.every(function(c) { return c === '' || c === null || c === undefined; })) continue;
      var obj = {};
      headers.forEach(function(h, j) {
        obj[h] = String(row[j] === null || row[j] === undefined ? '' : row[j]).trim();
      });
      data.push(obj);
    }

    return jsonOut({ success: true, count: data.length, data: data });

  } catch (err) {
    return jsonOut({ success: false, error: 'doGet error: ' + err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
//  doPost — บันทึก subscription ลง tab learning_subscript
//  Body (JSON): { userName, businessType, email, id, name, category, url }
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ success: false, error: 'No data received.' });
    }

    var data = JSON.parse(e.postData.contents);

    // ── Validate required fields ──
    if (!data.userName || !data.email || !data.id || !data.name) {
      return jsonOut({ success: false, error: 'Missing required fields: userName, email, id, name.' });
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return jsonOut({ success: false, error: 'Invalid email format.' });
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('learning_subscript');
    if (!sheet) {
      return jsonOut({ success: false, error: 'Sheet "learning_subscript" not found.' });
    }

    var now     = new Date();
    var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MM/dd/yyyy HH:mm');

    // Sheet2 column order: date | user_name | business_type | email | name | id | catagory | url download
    sheet.appendRow([
      dateStr,
      data.userName     || '',
      data.businessType || '',
      data.email,
      data.name         || '',   // name ก่อน id (ตาม Sheet2 column E)
      data.id           || '',   // id อยู่ column F
      data.category     || '',
      data.url          || ''
    ]);

    Logger.log('Subscription saved: ' + data.email + ' — ' + data.name);

    return jsonOut({
      success: true,
      message: 'Subscription saved successfully.',
      data: {
        userName:     data.userName,
        businessType: data.businessType,
        email:        data.email,
        resourceId:   data.id,
        resourceName: data.name,
        timestamp:    dateStr
      }
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return jsonOut({ success: false, error: 'doPost error: ' + err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
//  Helper — สร้าง JSON response
// ─────────────────────────────────────────────────────────────
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
//  ทดสอบใน Apps Script Editor (Run → testGet)
// ─────────────────────────────────────────────────────────────
function testGet() {
  var mock = { parameter: { sheet: 'blog' } };
  var result = JSON.parse(doGet(mock).getContent());
  Logger.log(JSON.stringify(result, null, 2));
}

function testPost() {
  var mock = {
    postData: {
      contents: JSON.stringify({
        userName: 'Test User', businessType: 'E-commerce', email: 'test@example.com',
        id: '1', name: 'Test Resource', category: 'Template', url: 'https://example.com'
      })
    }
  };
  var result = JSON.parse(doPost(mock).getContent());
  Logger.log(JSON.stringify(result, null, 2));
}
