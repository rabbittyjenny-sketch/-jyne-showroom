/**
 * iDEAS365 Showroom — Google Apps Script (Unified)
 * ═══════════════════════════════════════════════════════════════
 *
 * วิธีติดตั้ง:
 * ──────────────────────────────────────────────────────────────
 * 1. เปิด Google Sheet ของคุณ
 * 2. Extensions → Apps Script
 * 3. ลบโค้ดเดิมทั้งหมด แล้ว Paste โค้ดนี้แทน
 * 4. กด Save (Ctrl+S)
 * 5. Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. กด Deploy → คัดลอก URL ที่ได้
 * 7. นำ URL ไปวางใน APPS_SCRIPT_URL ในทุกไฟล์ HTML
 *
 * Sheet tabs ที่ต้องมีใน Google Spreadsheet:
 * ──────────────────────────────────────────────────────────────
 *   Sheet1          resource list     id | catagory | name | url | update
 *   Sheet2          subscription log  date | user_name | business_type | email | name | id | catagory | url download
 *   blog            blog posts        id | slug | title | category | excerpt_thai | excerpt_eng | time | date | image_url | course_url
 *   school_service1 school cards      id | slug | title | category | excerpt_thai | excerpt_eng | time | date | image_url | course_url
 *   school_service2 service cards     id | title | titleTh | description | descriptionTh | type | price | url_picture
 *   work_ai         AI projects       id | title | titleTh | description | descriptionTh | category | status | link | logo | previewImage | section | tags
 *   work_commerce   commerce projects (same columns as work_ai)
 *   work__creative  creative projects (same columns as work_ai)
 *
 * API Endpoints:
 * ──────────────────────────────────────────────────────────────
 *   GET  ?sheet=Sheet1          → คืนรายการ resource ทั้งหมด
 *   GET  ?sheet=blog            → คืนรายการ blog ทั้งหมด
 *   POST { ...subscribeData }   → บันทึก subscription ลง Sheet2
 *                                 แล้วคืน download URL กลับ
 * ═══════════════════════════════════════════════════════════════
 */

// ── Whitelist ชื่อ sheet ที่อ่านได้ผ่าน GET ───────────────────
var ALLOWED_SHEETS = [
  'Sheet1',          // resource list (free downloads)
  'blog',            // blog posts
  'school_service1', // school/course cards
  'school_service2', // service cards
  'work_ai',         // portfolio: AI
  'work_commerce',   // portfolio: Commerce
  'work__creative'   // portfolio: Creative
  // หมายเหตุ: Sheet2 (subscription log) ไม่อยู่ใน whitelist
  //           เพราะไม่ควรอ่านออกสู่ภายนอก (ข้อมูลส่วนตัวผู้ใช้)
];

// ─────────────────────────────────────────────────────────────
//  doGet  —  อ่านข้อมูลจาก sheet
//  Usage:  <SCRIPT_URL>?sheet=Sheet1
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  var sheetName = (e.parameter.sheet || '').trim();

  if (!sheetName) {
    return jsonOut({
      success: false,
      error: 'กรุณาระบุ ?sheet= เช่น ?sheet=Sheet1 | allowed: ' + ALLOWED_SHEETS.join(', ')
    });
  }

  if (ALLOWED_SHEETS.indexOf(sheetName) === -1) {
    return jsonOut({
      success: false,
      error: 'Sheet "' + sheetName + '" ไม่ได้รับอนุญาต'
    });
  }

  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonOut({
        success: false,
        error: 'ไม่พบ sheet "' + sheetName + '" ใน Spreadsheet นี้ กรุณาตรวจสอบชื่อ tab'
      });
    }

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return jsonOut({ success: true, count: 0, data: [] });
    }

    // แถวแรก = header
    var headers = rows[0].map(function(h) { return String(h).trim(); });
    var data    = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];

      // ข้ามแถวว่างทั้งหมด
      var isEmpty = row.every(function(cell) {
        return cell === '' || cell === null || cell === undefined;
      });
      if (isEmpty) continue;

      var obj = {};
      headers.forEach(function(h, j) {
        var val = row[j];
        // แปลง Date object เป็น string
        if (val instanceof Date) {
          obj[h] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'M/d/yyyy');
        } else {
          obj[h] = String(val === null || val === undefined ? '' : val).trim();
        }
      });
      data.push(obj);
    }

    return jsonOut({ success: true, count: data.length, data: data });

  } catch (err) {
    Logger.log('doGet error: ' + err.toString());
    return jsonOut({ success: false, error: 'doGet error: ' + err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
//  doPost  —  รับ subscription แล้วบันทึกลง Sheet2
//
//  Body (JSON) ที่ต้องส่งมา:
//  {
//    "userName":     "ชื่อ-นามสกุล",         ← required
//    "businessType": "E-commerce",             ← required
//    "email":        "your@email.com",         ← required
//    "id":           "1",                      ← id ของ resource
//    "name":         "70 Content iDEAS365",    ← ชื่อ resource
//    "category":     "template",               ← หมวดหมู่
//    "url":          "https://drive.google..." ← download URL
//  }
//
//  Response (JSON):
//  {
//    "success": true,
//    "downloadUrl": "https://drive.google...",  ← เปิด URL นี้ทันที
//    "message": "..."
//  }
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ success: false, error: 'ไม่ได้รับข้อมูล กรุณาส่ง JSON body' });
    }

    var data = JSON.parse(e.postData.contents);

    // ── Validate required fields ──────────────────────────────
    var missing = [];
    if (!data.userName || !String(data.userName).trim())         missing.push('userName');
    if (!data.businessType || !String(data.businessType).trim()) missing.push('businessType');
    if (!data.email || !String(data.email).trim())               missing.push('email');
    if (!data.id || !String(data.id).trim())                     missing.push('id');
    if (!data.name || !String(data.name).trim())                 missing.push('name');
    if (!data.url || !String(data.url).trim())                   missing.push('url');

    if (missing.length > 0) {
      return jsonOut({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบ: ' + missing.join(', ')
      });
    }

    // ── Validate email format ─────────────────────────────────
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email).trim())) {
      return jsonOut({ success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    // ── เปิด Sheet2 (subscription log) ───────────────────────
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet2');

    if (!sheet) {
      return jsonOut({
        success: false,
        error: 'ไม่พบ tab "Sheet2" กรุณาสร้าง sheet ชื่อ Sheet2 ที่มี header row:\n' +
               'date | user_name | business_type | email | name | id | catagory | url download'
      });
    }

    // ── บันทึก row ใหม่ ───────────────────────────────────────
    // Column order ตาม Sheet2:
    // A: date | B: user_name | C: business_type | D: email |
    // E: name | F: id | G: catagory | H: url download
    var now     = new Date();
    var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'M/d/yyyy HH:mm');

    sheet.appendRow([
      dateStr,                              // A: date
      String(data.userName).trim(),         // B: user_name
      String(data.businessType).trim(),     // C: business_type
      String(data.email).trim().toLowerCase(), // D: email
      String(data.name).trim(),             // E: name (ชื่อ resource)
      String(data.id).trim(),               // F: id
      String(data.category || '').trim(),   // G: catagory
      String(data.url).trim()               // H: url download
    ]);

    Logger.log('[Subscribe] ' + data.email + ' → ' + data.name + ' (id:' + data.id + ')');

    // ── ส่ง download URL กลับให้ frontend ────────────────────
    return jsonOut({
      success:     true,
      downloadUrl: String(data.url).trim(),
      message:     'บันทึกข้อมูลสำเร็จ กำลังเปิดไฟล์...',
      data: {
        userName:     String(data.userName).trim(),
        email:        String(data.email).trim().toLowerCase(),
        resourceId:   String(data.id).trim(),
        resourceName: String(data.name).trim(),
        timestamp:    dateStr
      }
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return jsonOut({ success: false, error: 'doPost error: ' + err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
//  Helper — JSON response with CORS headers
// ─────────────────────────────────────────────────────────────
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
//  ทดสอบ doGet  (Run → testGet ใน Editor)
// ─────────────────────────────────────────────────────────────
function testGet() {
  var mock   = { parameter: { sheet: 'Sheet1' } };
  var result = JSON.parse(doGet(mock).getContent());
  Logger.log('count: ' + result.count);
  Logger.log(JSON.stringify(result.data, null, 2));
}

// ─────────────────────────────────────────────────────────────
//  ทดสอบ doPost  (Run → testPost ใน Editor)
// ─────────────────────────────────────────────────────────────
function testPost() {
  var mock = {
    postData: {
      contents: JSON.stringify({
        userName:     'สมชาย ใจดี',
        businessType: 'E-commerce',
        email:        'test@example.com',
        id:           '1',
        name:         '70 Content iDEAS365',
        category:     'template',
        url:          'https://drive.google.com/file/d/EXAMPLE'
      })
    }
  };
  var result = JSON.parse(doPost(mock).getContent());
  Logger.log('success: ' + result.success);
  Logger.log('downloadUrl: ' + result.downloadUrl);
  Logger.log(JSON.stringify(result, null, 2));
}

// ─────────────────────────────────────────────────────────────
//  สร้าง header row ใน Sheet2 อัตโนมัติ (ถ้ายังไม่มี)
//  Run → setupSheet2 เพื่อสร้าง header row ครั้งแรก
// ─────────────────────────────────────────────────────────────
function setupSheet2() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sheet2');

  if (!sheet) {
    sheet = ss.insertSheet('Sheet2');
    Logger.log('สร้าง Sheet2 ใหม่แล้ว');
  }

  var firstRow = sheet.getRange(1, 1, 1, 8).getValues()[0];
  var hasHeader = firstRow.some(function(c) { return String(c).trim() !== ''; });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, 8).setValues([[
      'date', 'user_name', 'business_type', 'email', 'name', 'id', 'catagory', 'url download'
    ]]);
    // ทำให้ header row เป็นตัวหนา
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    Logger.log('เพิ่ม header row ใน Sheet2 แล้ว');
  } else {
    Logger.log('Sheet2 มี header อยู่แล้ว: ' + JSON.stringify(firstRow));
  }
}
