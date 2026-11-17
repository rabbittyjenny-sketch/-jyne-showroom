# -*- coding: utf-8 -*-
"""Owner's text for PROFILE and WORK HISTORY, replaced 16 Nov 2026 with her updated resume
("Eng&THResume_TH.docx", TH+EN) and portfolio file ("portfolio.md", TH+EN) — both supplied by the
owner for this update. Wording is theirs; only light connective labels (Role / Working process /
Scope / Guest experience) were added to merge the resume's job list with the portfolio's fuller
per-job write-up, as the owner asked ("ประสบการณ์ทำงาน...ใช้จากไฟล์ portfolio เช่นกัน").
Text written in the first person (I / my) throughout — the owner never calls herself "she".
LIVE COMMERCE (below) was not part of this update and is unchanged.
Markup = the original about_island.html elements (col-desc, quote box, tl-*, stats-row, big-btn-row)."""

P = '                    <p class="col-desc">{}</p>\n'
paras = lambda items: ''.join(P.format(t) for t in items)
LINK = '<a href="{}" style="color:var(--accent);font-weight:700">{}</a>'
# Brand logo board (owner's image on ImageKit, 18 Nov 2026) — "See all brands" / "แบรนด์ที่ร่วมงานด้วย" open it in the
# site's picture viewer (public/i365-ui.js, a[data-i365-view]). New board = upload over the same ImageKit file, or change this one line.
BRANDS_IMG = 'https://ik.imagekit.io/ideas365logo/Brand%20logo/Red%20Minimalist%20Modern%20Freelancer%20Resume%20(1).png'
brands_link = lambda text: ('<a href="{0}" data-i365-view="{0}" target="_blank" rel="noopener" '
                            'style="color:var(--accent);font-weight:700">{1}</a>').format(BRANDS_IMG, text)

# ── PROFILE ──────────────────────────────────────────────────────────────
BIO_EN = '''<div id="bio-en" data-lang="en">
                    <p class="col-desc"><strong style="font-size:1.05rem;">JYNE (JENJIRA JAISIN)</strong><br>
                    <span style="font-size:0.82rem;color:#888;letter-spacing:1px;">LIVE COMMERCE HOST / CONTENT &amp; OPERATIONS</span></p>

''' + paras([
    "Live commerce host with experience in <strong>live preparation, sales scripting, audience communication and post-session review</strong>. Background in restaurant operations, executive support, social media content coordination and VVIP guest experience.",
    "My work has moved between <strong>front-of-camera communication and behind-the-scenes coordination</strong>. Live hosting requires preparation, clear communication and adjustment in real time. Operations and executive support require observation, follow-through, discretion and attention to the details that help other people do their work.",
    "I use AI and digital tools as support for structure, research and production when I understand the subject well enough to direct and review the result. When I am learning something new, I use reliable sources first and <strong>treat AI as a tool for research rather than a replacement for understanding</strong>.",
    "<strong>I work best when the overall goal and the connection between tasks are clear.</strong> I usually map the context, confirm the immediate outcome, work through the task in sequence and review feedback afterward. When I see a possible improvement, I note it first and raise it after confirming the current priority.",
]) + '''
                    <p class="col-desc" style="background:#f9f0ec;border-left:3px solid #B03A00;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;">“I learn from what happens around me and use feedback from the work itself to improve the next step.”</p>
                </div>

                '''

BIO_TH = '''<div id="bio-th" data-lang="th" style="display:none;">
                    <p class="col-desc"><strong style="font-size:1.05rem;">เจนจิรา จัยสิน (เจน)</strong><br>
                    <span style="font-size:0.82rem;color:#888;letter-spacing:1px;">LIVE COMMERCE HOST / CONTENT &amp; OPERATIONS</span></p>

''' + paras([
    "ผู้ดำเนินรายการ Live Commerce ที่มีประสบการณ์ด้าน<strong>การเตรียมข้อมูล การเขียนสคริปต์ การสื่อสารกับผู้ชม และการติดตามผลหลังไลฟ์</strong> มีพื้นฐานจากงานบริหารร้านอาหาร งานผู้ช่วยผู้บริหาร การประสานงานคอนเทนต์โซเชียล และการดูแลประสบการณ์แขก VVIP",
    "ประสบการณ์ที่ผ่านมาอยู่ระหว่าง<strong>งานหน้ากล้องกับงานเบื้องหลัง</strong> การทำ Live ต้องเตรียมข้อมูล สื่อสารให้ชัด และปรับตัวตามสถานการณ์แบบเรียลไทม์ ส่วนงาน Operations และงานผู้ช่วยผู้บริหารต้องอาศัยการสังเกต การติดตามงาน ความรอบคอบ และการดูแลรายละเอียดที่ช่วยให้คนอื่นทำงานได้ต่อเนื่อง",
    "การใช้ AI จะใช้เป็นเครื่องมือช่วยเรื่องโครงสร้าง การค้นคว้า และการทำงานในส่วนที่มีความรู้มากพอจะกำหนดทิศทางและตรวจสอบผลลัพธ์ได้ หากเป็นเรื่องใหม่ จะเริ่มจากการค้นคว้าจากแหล่งข้อมูลที่น่าเชื่อถือ และ<strong>ใช้ AI เป็นเครื่องมือช่วยเรียนรู้ ไม่ใช่แทนความเข้าใจ</strong>",
    "<strong>ทำงานได้ดีที่สุดเมื่อเห็นเป้าหมายโดยรวมและเข้าใจว่างานแต่ละส่วนเชื่อมโยงกันอย่างไร</strong> โดยจะดูบริบทก่อน ยืนยันผลลัพธ์ที่ต้องทำในขั้นนั้น ทำงานตามลำดับ และทบทวนจาก Feedback หลังจบงาน หากเห็นแนวทางที่น่าจะช่วยให้งานดีขึ้น จะจดไว้ก่อนและนำเสนอหลังจากยืนยันลำดับความสำคัญของงานปัจจุบันแล้ว",
]) + '''
                    <p class="col-desc" style="background:#f9f0ec;border-left:3px solid #B03A00;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;">“ในทุก ๆ วัน การได้เรียนรู้สิ่งต่าง ๆ จากรอบตัว และให้ความสำคัญกับ Feedback จากหน้างานและคนรอบข้าง เพราะมองว่าเป็นทางลัดที่ช่วยให้พัฒนาตัวเองได้เร็วขึ้น”</p>
                </div>
            </div>

            '''

# ── WORK HISTORY ─────────────────────────────────────────────────────────
JOBS = [  # (role, place, year EN, year TH, desc EN, desc TH, extra EN, extra TH)
    ("Freelance Live Stream Host", "TikTok LIVE · Facebook Live · Shopee Live", "2022–Present", "2022–ปัจจุบัน",
     "Role: Prepared product and brand information, developed scripts and identified selling points for each live session. Working process: Researched the product, prepared the flow and adjusted content during the live according to the situation and audience response, then reviewed each session afterward to improve speaking and presentation.",
     "บทบาท: เตรียมข้อมูลสินค้าและแบรนด์ เขียนสคริปต์ และวางแนวทางหาจุดขายสำหรับแต่ละไลฟ์ วิธีทำงาน: ค้นคว้าข้อมูล เตรียมลำดับการนำเสนอ และปรับเนื้อหาระหว่างไลฟ์ตามสถานการณ์และการตอบสนองของผู้ชม หลังไลฟ์จะติดตามผลเพื่อปรับการพูดและการนำเสนอในครั้งถัดไป",
     "Scope: <strong>More than 20 brands</strong> across beauty, lifestyle, fashion, food, household products, and mother-and-baby products — <strong>six-figure sales</strong> achieved in a two-hour live session.",
     "ขอบเขตงาน: ร่วมงานกับแบรนด์<strong>มากกว่า 20 แบรนด์</strong> ในกลุ่มความงาม ไลฟ์สไตล์ แฟชั่น ของกิน ของใช้ และแม่และเด็ก โดยทำยอดขายได้<strong>6 หลัก</strong>ในการไลฟ์ระยะเวลา 2 ชั่วโมง"),
    ("Executive Assistant", "Thai Cuisine Academy · founded by Chef Chumpol Jangprai, <strong>Iron Chef Thailand Champion</strong> 2012–2018, and Sustainable Food Ambassador by FeedUp@UN", None, None,
     "Role: Supported executive image management, content direction, trend analysis and social media campaign planning. Working process: Looked at the organization's context and audience, helped shape content directions, presented tools and supported execution, plus additional assistant support as assigned.",
     "บทบาท: สนับสนุนการดูแลภาพลักษณ์ผู้บริหาร วางแนวทางคอนเทนต์ วิเคราะห์แนวโน้ม และช่วยวางแผนแคมเปญโซเชียลมีเดีย วิธีทำงาน: พิจารณาบริบทและกลุ่มผู้ชมขององค์กร ช่วยกำหนดแนวทางคอนเทนต์ นำเสนอเครื่องมือ และสนับสนุนการดำเนินงาน รวมถึงงานผู้ช่วยตามที่ได้รับมอบหมาย", None, None),
    ("Assistant Restaurant Manager", "MUU Bangkok Hotel", None, None,
     "Role: Acted on behalf of the Restaurant Manager when the position was vacant. Scope: <strong>Five dining operations</strong> — café, breakfast restaurant, Italian restaurant, outdoor bar area and room service. Working process: Coordinated F&amp;B staff, sales summaries, inventory, training, service quality, purchasing, suppliers, promotions and cross-functional work.",
     "บทบาท: ผู้ช่วยผู้จัดการร้านอาหาร และทำหน้าที่แทนผู้จัดการในช่วงที่ไม่มีผู้จัดการ ขอบเขตงาน: ดูแล<strong>5 ห้องอาหาร</strong> ได้แก่ คาเฟ่ ห้องอาหารเช้า ห้องอาหารอิตาเลียน โซนบาร์เอาท์ดอร์ และรูมเซอร์วิส วิธีทำงาน: ประสานงานทีม F&amp;B สรุปยอดขาย ตรวจสอบสต็อก ออกแบบการฝึกอบรม ประเมินคุณภาพบริการ จัดซื้อ ติดต่อซัพพลายเออร์ วางแผนโปรโมชั่น และทำงานร่วมกับทีมอื่น ๆ", None, None),
    ("Director of Operations for Chef Andy Yang", "Pad Thai Fai Ta Lu · <strong>Michelin Bib Gourmand</strong>", None, None,
     "Role: Supported the overall restaurant system, SOP development, coordination and matters related to the chef. Working process: Managed event operations, purchasing, supplier coordination and the control and inspection of ingredient quality for off-site events.",
     "บทบาท: ดูแลภาพรวมระบบของร้าน การวาง SOP การประสานงาน และงานที่เกี่ยวข้องกับเชฟ วิธีทำงาน: บริหารการจัด Event งานจัดซื้อ การประสานงานซัพพลายเออร์ รวมถึงการควบคุมและตรวจสอบคุณภาพวัตถุดิบสำหรับงานนอกสถานที่", None, None),
    ("Executive Assistant", "R-HAAN · <strong>Two Michelin Stars for six consecutive years</strong> · co-founded by Chef Chumpol Jangprai", "2018–2023", "2018–2023",
     "Role: Worked at a management level with reporting, summaries, issue communication and coordination. Working process: Coordinated with local farmers throughout Thailand to source region-specific Thai ingredients, supported daily operations and coordinated with internal and external parties.",
     "บทบาท: ปฏิบัติงานในระดับบริหาร โดยมีหน้าที่รายงานและสรุปผล รวมถึงแจ้งปัญหาและแนวทางแก้ไข วิธีทำงาน: ประสานงานกับเกษตรกรท้องถิ่นทั่วประเทศไทยเพื่อจัดหาวัตถุดิบเฉพาะของไทยจากแต่ละภูมิภาค ดูแลภาพรวมการดำเนินงานในแต่ละวัน และประสานงานกับทั้งภายในและภายนอกองค์กร",
     "Guest experience: Managed <strong>international VVIP guest experience</strong> from reservations through follow-up.",
     "ประสบการณ์แขก: ดูแลประสบการณ์ของ<strong>แขก VVIP ระดับนานาชาติ</strong> ตั้งแต่การจองจนถึงการติดตามผล"),
    ("Sales Manager", "Cape &amp; Kantary Hotels", None, None, None, None, None, None),
    ("Account Executive", "MUN Forward Radio CNX", None, None, None, None, None, None),
    ("Freelance Makeup Artist &amp; Hair Stylist", None, None, None, None, None, None, None),
    ("General Manager &amp; Sales", "Asia Diamond (family business)", None, None, None, None, None, None),
]
EDU = {  # (role, place)
    'en': [("Bachelor of Science, Major in Industrial Computer Technology", "Ubon Ratchathani Rajabhat University | GPA 3.05"),
           ("Thai Cookery Certificate", "MSC Thai Culinary School"),
           ("International Copyright Protection Course", "Korean Copyright Commission")],
    'th': [("ปริญญาตรี วิทยาศาสตรบัณฑิต สาขาคอมพิวเตอร์อุตสาหกรรม", "มหาวิทยาลัยราชภัฏอุบลราชธานี | GPA 3.05"),
           ("ประกาศนียบัตรการทำอาหารไทย", "MSC Thai Culinary School"),
           ("หลักสูตรผู้คุ้มครองลิขสิทธิ์ในต่างประเทศ", "สำนักงานคุ้มครองลิขสิทธิ์แห่งเกาหลี")],
}


def _item(role, place, year, desc, extra):
    s = '                <div class="tl-item">\n'
    if year: s += f'                    <div class="tl-year">{year}</div>\n'
    s += f'                    <div class="tl-role">{role}</div>\n'
    if place: s += f'                    <div class="tl-place">{place}</div>\n'
    if desc: s += f'                    <div class="tl-desc">{desc}</div>\n'
    if extra: s += f'                    <div class="tl-desc" style="margin-top:6px">{extra}</div>\n'
    return s + '                </div>\n'


def experience_html():
    out = ''
    for lang, hide in (('en', ''), ('th', ' style="display:none;"')):
        i = 0 if lang == 'en' else 1
        out += f'                <div data-lang="{lang}"{hide}>\n'
        for r, p, ye, yt, de, dt, xe, xt in JOBS:
            out += _item(r, p, (ye, yt)[i], (de, dt)[i], (xe, xt)[i])
        out += '                <h2 class="col-title" style="margin-top:28px">EDUCATION / การศึกษา</h2>\n'
        for r, p in EDU[lang]:
            out += _item(r, p, None, None, None)
        out += '                </div>\n'
    return out


# ── LIVE COMMERCE ────────────────────────────────────────────────────────
LIVE_EN = [
    "Anyone can go live. Turning a live session into a clear, engaging and measurable brand experience takes preparation well before the camera turns on. It takes an understanding of the product, a reason for the audience to stay, a structure that supports the story, and the ability to adjust in real time.",
    "Since 2022, I have worked as an independent Live Commerce Host across TikTok LIVE, Facebook Live and Shopee Live. I have collaborated with more than 20 brands and built my working system through direct experience: researching each brand and product using credible sources, identifying meaningful product benefits, developing hooks and scripts, planning the run-down, preparing the technical setup, hosting the session and reviewing results afterwards.",
    "I do not assume I already know a product category. When my personal experience is limited, I research more deeply, check information against credible sources and translate product knowledge into clear, useful points for viewers. This preparation supports a more confident presentation and helps keep product communication relevant to the audience.",
    "The approach combines operational discipline with audience awareness. The objective is not simply to keep talking for two hours. It is to guide attention, communicate value, respond to viewers and give each product its proper context — while keeping the session natural and commercially focused.",
    "Across 20+ brands, I have delivered six-figure GMV in regular two-hour live sessions. Selected GMV examples are shown below. These are individual result snapshots, not a published average across all sessions.  " + brands_link('See all brands'),
]
LIVE_TH = [
    "ใคร ๆ ก็เปิดไลฟ์ได้ แต่การทำให้ไลฟ์เป็นประสบการณ์ของแบรนด์ที่น่าสนใจ สื่อสารได้ชัดเจน และวัดผลทางธุรกิจได้ ต้องเริ่มเตรียมงานตั้งแต่ก่อนเปิดกล้อง ทั้งความเข้าใจในสินค้า เหตุผลที่ทำให้ผู้ชมอยากอยู่ต่อ โครงสร้างการนำเสนอ และความสามารถในการปรับเนื้อหาให้เข้ากับสถานการณ์จริง",
    "ตั้งแต่ปี 2022 เจนทำงาน Freelance Live Commerce Host บน TikTok LIVE, Facebook Live และ Shopee Live ร่วมงานกับแบรนด์มากกว่า 20 แบรนด์ และพัฒนาระบบการทำงานจากประสบการณ์ตรงด้วยตัวเอง ตั้งแต่ศึกษาข้อมูลแบรนด์และสินค้าจากแหล่งที่น่าเชื่อถือ วิเคราะห์จุดเด่นที่มีคุณค่าต่อผู้บริโภคไปจนถึงทบทวนผลหลังจบไลฟ์ " + brands_link('แบรนด์ที่ร่วมงานด้วย'),
    "เจนไม่มองว่าตัวเองรู้จักสินค้าทุกประเภทอยู่แล้ว มันเพราะความไม่รู้ เลยจำเป็นต้องรู้ และต้องเข้าใจ ให้ได้มากที่สุด ค้นคว้าหาข้อมูลและรายละเอียดต่างๆ ที่ต้องมีแหล่งที่มาของข้อมูลที่เชื่อถือได้และอ้างอิงได้ วางแผนและเรียบเรียง  และจับประเด็นในแต่ละคำที่จะพูดในไลฟ์นั้น  ให้ผู้ชมเข้าใจและนำไปใช้ประกอบการตัดสินใจได้ การเตรียมข้อมูลจึงเป็นส่วนสำคัญของเจน",
    "ด้วยประสบการณ์การทำงานก่อนหน้า ความเข้าใจสิ่งต่างๆ รอบตัว การค้นคว้าหาข้อมูลอย่างหนัก เพื่อสื่อสารคุณค่าของสินค้า ตอบสนองต่อผู้ชม และอธิบายสินค้าที่เหมาะสม ด้วยความเป็นธรรมชาติภายใต้ภาพลักษณ์ของแบรนด์นั้นๆ",
    "จากวันแรก จนถึงตอนนี้ มีโอกาสได้ไลฟ์ ให้แบรนด์มากกว่า 20 แบรนด์ และก็หลายครั้งที่ทำยอดขายใน2 ชั่วโมง ได้ถึง 6 หลัก",
]


def live_text_html():
    return ('            <div>\n'
            '                <div data-lang="en">\n'
            '                <h2 class="col-title">LIVE COMMERCE</h2>\n'
            '                <p class="col-desc"><strong>A STRONG LIVE SESSION STARTS LONG BEFORE THE CAMERA TURNS ON.</strong></p>\n'
            + ''.join(f'                <p class="col-desc">{t}</p>\n' for t in LIVE_EN) +
            '                </div>\n'
            '                <div data-lang="th" style="display:none;">\n'
            '                <h2 class="col-title">งานไลฟ์สตรีม</h2>\n'
            '                <p class="col-desc"><strong>ไลฟ์ที่ดีไม่ได้เริ่มตอนเปิดกล้อง แต่เริ่มตั้งแต่ก่อนหน้านั้น</strong></p>\n'
            + ''.join(f'                <p class="col-desc">{t}</p>\n' for t in LIVE_TH) +
            '                </div>\n'
            '            </div>\n')


# SELECTED LIVE RESULTS — owner's file "Untitled document (13)" (18 Nov 2026), every figure checked against the
# back-office screenshot it comes from (Drive folder 1YeGUzrt…; screenshots already on the page in RESULT · 2 HRS/LIVE):
#   ฿114,762 Hi-Q 2 Aug 2024 · ฿109,857 BabyLove 4 Jul 2024 · ฿91,664 BabyLove 15 Aug 2024 · ฿83,224 18 Jul 2024
#   (TikTok LIVE Console, "สินค้าที่ขายได้" = items sold) · ฿64,851 Bata 21 Nov 2023 (Shopee Live, best Shopee session)
#   51.51% CTR BabyLove 22 Aug 2024 (TikTok, proof1.jpg) · 97% = "LIVE longer than 97% of creators with similar
#   follower counts" (TikTok post-LIVE summary 13 Nov 2024, one 2h12m session — it measures LIVE length, not retention)
# (number, EN label, TH label) — the label line under each number
STATS = [
    ('฿114,762', 'GMV · TikTok LIVE<br>184 items sold', 'GMV · TikTok LIVE<br>ขายได้ 184 ชิ้น'),
    ('฿109,857', 'GMV · TikTok LIVE<br>200 items sold', 'GMV · TikTok LIVE<br>ขายได้ 200 ชิ้น'),
    ('฿91,664', 'GMV · TikTok LIVE<br>141 items sold', 'GMV · TikTok LIVE<br>ขายได้ 141 ชิ้น'),
    ('฿83,224', 'GMV · TikTok LIVE<br>149 items sold', 'GMV · TikTok LIVE<br>ขายได้ 149 ชิ้น'),
    ('฿64,851', 'GMV · Shopee Live<br>223 orders', 'GMV · Shopee Live<br>223 คำสั่งซื้อ'),
    ('51.51%', 'Product CTR<br>TikTok LIVE', 'อัตราคลิกสินค้า (CTR)<br>TikTok LIVE'),
    ('97%', 'LIVE longer than 97% of<br>similar-size creators · TikTok', 'ไลฟ์ยาวกว่าครีเอเตอร์ 97%<br>ที่ผู้ติดตามใกล้เคียงกัน · TikTok'),
    ('20+', 'Brands', 'แบรนด์ที่ร่วมงาน'),
]
CONTACT_URL = 'contact_port.html'   # CONTACT island page
RESULTS_CARD = ('''        <!-- SELECTED LIVE RESULTS (owner's file) — stats-row / stat-box / big-btn-row of about_island.html -->
        <div class="content-card single" style="grid-template-columns:1fr !important">   <!-- one column on phones too (the page's mobile rule turns every card into 2 columns) -->
            <h2 class="col-title"><span data-lang="en">SELECTED LIVE RESULTS · 2-HOUR SESSIONS</span><span data-lang="th" style="display:none;">ผลลัพธ์บางส่วนจากไลฟ์ · 2 ชั่วโมง</span></h2>
            <div>
            <div class="stats-row">
''' + ''.join(f'                <div class="stat-box"><div class="stat-num">{n}</div><div class="stat-label"><span data-lang="en">{en}</span><span data-lang="th" style="display:none;">{th}</span></div></div>\n'
              for n, en, th in STATS) + '''            </div>
            <p class="col-desc" style="margin:14px 0 0;color:#888;font-size:0.78rem"><span data-lang="en">Individual session figures from the TikTok LIVE Console and Shopee Live back office (2023–2024), not an average across all sessions.</span><span data-lang="th" style="display:none;">ตัวเลขรายรอบจากหน้าจอหลังบ้าน TikTok LIVE Console และ Shopee Live (2023–2024) ไม่ใช่ค่าเฉลี่ยของทุกรอบ</span></p>
            </div>
            <div>
            <div class="big-btn-row" style="margin-top:0">
                <a class="big-btn" href="works_photos.html">Gallery งานไลฟ์</a>
                <a class="big-btn" href="works_clips.html">Video งานไลฟ์</a>
            </div>
            <div class="big-btn-row" style="grid-template-columns:1fr">
                <a class="big-btn" href="''' + CONTACT_URL + '''">Get in touch</a>
            </div>
            </div>
        </div>
''')

# setLang of about_island.html, made to switch every [data-lang] block of the page (same buttons, same colours)
SETLANG_OLD = ("            document.getElementById('bio-en').style.display = lang === 'en' ? 'block' : 'none';\n"
               "            document.getElementById('bio-th').style.display = lang === 'th' ? 'block' : 'none';\n")
SETLANG_NEW = ("            document.querySelectorAll('[data-lang]').forEach(function (el) { el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none'; });   /* added: every EN/TH block of the page */\n")
