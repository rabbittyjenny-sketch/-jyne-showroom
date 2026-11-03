# -*- coding: utf-8 -*-
"""Owner's text for PROFILE, WORK HISTORY and LIVE COMMERCE (her file "— PROFILE / ABOUT", 4 Nov 2026).
Text is hers word for word; only these spelling slips were corrected:
  TH  กฌตั้งแต่→ก็ตั้งแต่, ที่้ต้อง→ที่ต้อง, มาจรฐาน→มาตรฐาน, ปฎิเสธ→ปฏิเสธ, พอๆกับกับ→พอๆ กับ, สังเกตุ→สังเกต,
      คววามเข้าใจสิ่งต่างๆไรอบตัว→ความเข้าใจสิ่งต่างๆ รอบตัว, สินค้ที่→สินค้าที่
  EN  written in the first person (I / my) throughout with grammar fixed — the owner never calls herself "she" (4 Nov 2026)
  MUN Forward (was Mon Forward) in both languages, owner's correction
Markup = the original about_island.html elements (col-desc, quote box, tl-*, stats-row, big-btn-row)."""

P = '                    <p class="col-desc">{}</p>\n'
paras = lambda items: ''.join(P.format(t) for t in items)
LINK = '<a href="{}" style="color:var(--accent);font-weight:700">{}</a>'
BRANDS_URL = ''   # ← ลิงก์หน้ารายชื่อแบรนด์ (ใส่ทีหลัง) — used by "See all brands" / "แบรนด์ที่ร่วมงานด้วย"
brands_link = lambda text: LINK.format(BRANDS_URL or '#', text)

# ── PROFILE ──────────────────────────────────────────────────────────────
BIO_EN = '''<div id="bio-en" data-lang="en">
                    <p class="col-desc"><strong style="font-size:1.05rem;">JYNE (JENJIRA JAISIN)</strong><br>
                    <span style="font-size:0.82rem;color:#888;letter-spacing:1px;">FREELANCE LIVE COMMERCE HOST · SYSTEMS &amp; CURRICULUM BUILDER<br>SELF-STARTER · STANDARDS-DRIVEN · QUIETLY CONFIDENT</span></p>

''' + paras([
    "I did not set out with a fixed career plan. I have always followed a more practical instinct: understand how something works, see what it could become, and build what is needed to make it work.",
    "My foundation began with technology. I started learning in junior high, in the floppy-disk era, and continued through a degree in Industrial Computer Technology. At a time before ready-made tools, drag-and-drop builders and AI, I learned programming and hands-on hardware: wiring, circuit-board etching, computer assembly and repair. In high school, I represented my school in a provincial search-engine competition and placed second. Those early experiences shaped the way I approach work today: understand the structure, test it, and make it function.",
    "My professional path then moved through sales, hospitality, media and business operations. Across different environments, I have learned to read people, earn trust and manage relationships — from front-line teams to senior executives and international VIP/VVIP guests. The setting changed; the importance of preparation, communication and follow-through did not.",
    "For close to a decade, I worked in high-standard fine-dining and hospitality operations, supporting the work of Chef Chumpol Jangprai at R-HAAN and Chef Andy Yang at Table 38 Bangkok. My responsibilities reached beyond service: executive coordination, guest experience, supplier relationships, event operations and the operational details that keep a demanding business running. Working in environments shaped by Michelin-level standards taught me what consistency looks like when every detail matters.",
    "In 2022, I moved into freelance Live Commerce. What began as an opportunity became a field I chose to build for myself. Working across TikTok LIVE, Facebook Live and Shopee Live, I have developed my own approach to product research, product curation, scripting, hooks, run-downs, technical setup and post-live review. I have worked with more than 20 brands and delivered six-figure GMV in regular two-hour live sessions.",
    "The experience also led me to create CREATR365, a Live Commerce Host training curriculum built from practical work. I designed its learning structure, assessments and evaluation criteria to turn on-the-job lessons into a framework that other aspiring hosts can learn and apply.",
    "I value outcomes over noise. I believe that a well-prepared live session should feel natural to the audience — not because the work is effortless, but because the thinking and preparation behind it have been done properly.",
]) + '''
                    <p class="col-desc" style="background:#f9f0ec;border-left:3px solid #B03A00;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;">“Anyone can use AI. But using it and knowing how to use it produce very different results.”</p>

                    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
                        <p class="col-desc" style="color:#888;font-size:0.82rem;font-style:italic;margin:0">“Don’t try to make it perfect. Make it work.”</p>
                        <p class="col-desc" style="font-size:0.82rem;margin:8px 0 0"><strong>SMART LAZY · OPERATIONAL INTELLIGENCE · QUIETLY CONFIDENT</strong></p>
                    </div>
                </div>

                '''

BIO_TH = '''<div id="bio-th" data-lang="th" style="display:none;">
                    <p class="col-desc"><strong>ยินดีที่ได้รู้จัก :)</strong></p>
                    <p class="col-desc"><strong style="font-size:1.05rem;">เจนจิรา จัยสิน (เจน)</strong><br>
                    <span style="font-size:0.82rem;color:#888;letter-spacing:1px;"><em><strong>การทำงานให้สำเร็จ</strong> ง่ายกว่าการอธิบายว่าทำไมคุณถึงทำมันไม่ได้</em> – <em>มาร์ติน แวน บิวเรน</em></span></p>

''' + paras([
    "เจนไม่ได้เริ่มต้นจากการวางแผนเส้นทางอาชีพไว้อย่างตายตัว แต่มักจะใช้จังหวะ การสังเกต และการตั้งคำถามกับสิ่งต่างๆรอบตัว พร้อมที่จะเรียนรู้ในทุกๆวัน พร้อมที่จะทำในสิ่งที่ยังไม่เคยทำ แต่สิ่งที่จะใช้ในการทำงาน ก็คือ ทำความเข้าใจว่าสิ่งต่าง ๆ ทำงานอย่างไร มองเห็นโอกาส แล้วลงมือสร้างสิ่งที่จำเป็นเพื่อให้มันเกิดขึ้นจริง",
    "เจนเริ่มต้นจากความอยากรู้ในเทคโนโลยี จึงเลือกเรียน(วิชาเลือกเสรี)ในรายวิชาด้านคอมพิวเตอร์ตั้งแต่ระดับมัธยมต้น ก็ตั้งแต่ยุคแผ่นฟล็อปปี้ดิสก์หลากหลายสี ต่อเนื่องมาจนถึงระดับมัธยมปลาย ในช่วงนั้นโลกเพิ่งรู้จัก Internet Explorer ก็มีโอกาสได้เป็นตัวแทนโรงเรียนเข้าแข่งขันด้าน Search Engine ในระดับจังหวัดและได้รับรางวัลรองชนะเลิศกลับมา   เมื่อเข้าสู่การเป็นนักศึกษาในมหาวิทยาลัย  ในยุคที่ยังไม่มีโปรแกรมสำเร็จรูป ไม่มีเครื่องมือลากวาง หรือ AI  ตอนนั้นคิดแค่ว่าอยากรู้จักคอมพิวเตอร์ให้มากขึ้น จึงเลือกใส่เสื้อช็อป เข้าเรียนในคณะเทคโนโลยีอุตสาหกรรม สาขา คอมพิวเตอร์อุตสาหกรรม ก็ตั้งแต่การถอด และ การประกอบคอมพ์พีซี การเรียนไฟฟ้าวงจร กัดลายแผ่นวงจร เลขฐานสอง  ไปจนถึงการเรียนเขียนโค้ดที่ทั้งสนุกทั้งโหด กับการเรียน MYSQL , C+และอื่นๆ  ก็เขียนโปรแกรมเหมือนเรียนพิมพ์ดีดที่ต้องจำโค้ดให้ได้ ยังไม่รวมการแก้บั๊ก และต้องเอาไปใช้ควบคุมฮาร์ดแวร์ที่เราก็ต้องเป็นคนสร้างเองด้วยเช่นกัน - การคิดแบบมีลอจิก คิดแบบเป็นโฟลวชาร์ต อาจจะเริ่มจากตรงนี้  " + LINK.format('learning_tools.html', 'ทางไปโชว์รูม'),
    "เส้นทางการทำงานต่อจากนั้นครอบคลุมทั้งงานขาย ธุรกิจบริการ สื่อ และการบริหารจัดการองค์กร ในแต่ละสภาพแวดล้อมภายใต้แรงกดดันจากสถานการณ์ที่ต่างกัน  ซึ่งจากที่ผ่านมาทำให้ได้เรียนรู้และมีประสบการณ์ต่างๆมากมาย ผิดบ้างถูกบ้างแต่มันทำให้ได้เข้าใจอะไรมากขึ้นเช่นกัน เพราะแต่ละบทบาทหน้าที่ ก็จะมีส่วนผสมของ การเรียนรู้ ความเข้าใจ,เชื่อใจ การดูแลความสัมพันธ์ และการจัดการต่างๆ ตั้งแต่ระดับผู้บริหาร ทีมปฏิบัติการ และส่วนที่เกี่ยวข้อง ตลอดจนการบริการ/ดูแลลูกค้า VIP,VVIP จนถึงชาวต่างชาติ ก็เป็นหน้าที่ ที่ไม่เคยปฏิเสธที่จะทำก่อนที่จะบอกว่าทำไม่ได้ สถานที่ทำงานอาจเปลี่ยนไป แต่ความสำคัญของการเตรียมตัว การสื่อสาร และการติดตามงานยังคงเป็นมาตรฐานหลักส่วนตัวที่ยังคงทำเหมือนเดิม",
    "เจนมีประสบการณ์เกือบสิบปีในงาน Fine Dining และธุรกิจบริการที่มีมาตรฐานสูง โดยทำงานสนับสนุนและดูแลการดำเนินงานร่วมกับ Chef Chumpol Jangprai และ Chef Andy Yang   และได้ร่วมงานกับผู้บริหารต่างชาติในธุรกิจโรงแรม ระดับ4-5ดาว   ซึ่งขอบเขตงานไม่ได้จำกัดอยู่แค่การบริการ แต่รวมถึงการประสานงานผู้บริหาร การดูแลแขก การจัดการคู่ค้า งานอีเวนต์ และรายละเอียดการปฏิบัติงานที่ทำให้ธุรกิจหรืองานนั้นๆเดินหน้าได้  และไม่เป็นไรเลยที่บางครั้ง เราก็ต้องทำหน้าที่เป็นพนักงานรับรถได้ด้วยเช่นเดียวกัน เพราะการทำงาน คือ ทีม และทีม คือส่วนที่ทำให้มันสำเร็จ  ภายใต้มาตรฐานที่เราจะต้องทำให้งานนั้นๆสำเร็จลุล่วงไปได้ด้วยดีและสมบูรณ์ที่สุด  การที่ได้มีโอกาสเรียนรู้งานต่างๆจากผู้ที่มีวิสัยทัศน์ มีแนวคิด มันคือประสบการณ์ที่ดีและมีค่า มันสอนให้เข้าใจว่าทุกๆรายละเอียด ทุกๆการกระทำ มันสำคัญพอๆ กับ การบริหารจัดการบนความคาดหวังของคน  ที่ต้องสังเกต และ ซัพพอร์ต และพร้อมแก้ปัญหาในเรื่องที่เราก็อาจจะไม่รู้ล่วงหน้า  การสื่อสารให้ถึง ซึ่งมันก็คือ การที่ต้องใส่ใจในทุกรายละเอียดอย่างรอบคอบจริงๆ",
    "ในปี 2022 เจนเริ่มทำงาน  Live Host (MC) ในแพลตฟอร์ม Shopping Online ( Freelance) จากที่เห็นโอกาสและกล้าที่จะเปลี่ยน ก็ตัดสินใจลองทำมันเต็มที่ บวกกับความอยากรู้  จนกลายเป็นสายงานที่เจนสร้างแนวทางการทำงานขึ้นมาด้วยตัวเอง และเพราะความไม่รู้ มันเลยทำให้เรายิ่งต้องรู้ ทำการบ้านกับสินค้าต่างๆที่แบรนด์เค้าเลือกเรา การวางแผนวิธีการไลฟ์ การจดจำ สังเกต หลักๆก็คือ การเรียนรู้ ทำการบ้านอย่างหนักด้วยความที่เป็นคนจริงใจและรักษาคำที่ตัวเองพูด ดังนั้นการที่จะพูดอะไรออกไป มันต้องแน่ใจ100% ว่ามันคือข้อมูลที่ถูกต้องและมีแหล่งอ้างอิงได้เท่านั้น เรียนรู้การจัดระบบเทคนิคต่างๆ รวมถึงการทบทวนผลหลังไลฟ์ ปัจจุบันมีประสบการณ์ร่วมงานกับแบรนด์มากกว่า 20 แบรนด์ และสามารถสร้างยอด GMV ระดับ 6 หลักในไลฟ์รูปแบบปกติ 2 ชั่วโมง",
    "ประสบการณ์จากการทำงานจริงยังต่อยอดไปสู่การสร้าง <strong>CREATR365 (ครีเอท365)</strong>  A Creative House for the Future of Live Commerce. เพราะอยากให้อาชีพนี้มีมาตรฐาน มีจรรยาบรรณ และความซื่อสัตย์  รวมไปถึงการให้คุณค่าตัวเองในอาชีพนี้ จึงได้ออกแบบโครงสร้างการเรียน แบบประเมิน และเกณฑ์การวัดผลจากประสบการณ์ของตัวเอง ผสมกับการใช้แนวคิดจากแพลตฟอร์มในระดับโกลบอล,จากอาชีพที่นำมาประยุกต์ใช้กับการทำอาชีพนี้ได้  เพื่อให้ผู้ที่สนใจอาชีพ ไลฟ์ โฮสต์ สามารถเรียนรู้และนำเอาไปใช้ได้จริงๆ",
    "ส่วนตัวแล้วให้ความสำคัญกับผลลัพธ์หรือประโยชน์มากกว่าการสร้างภาพที่สวยหรู ดังนั้น",
]) + '''
                    <p class="col-desc" style="background:#f9f0ec;border-left:3px solid #B03A00;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;">“ ไลฟ์ได้ กับ ไลฟ์เป็น”  หรือ “ใช้AI ได้”  กับการ “ใช้ AI เป็น”   มันคงไม่ใช่แค่การ กดปุ่ม แค่ปุ่มเดียว<br>แต่มันต้องใช้ความอดทนในการพัฒนาตัวเองในทุกๆวัน</p>

                    <p class="col-desc" style="font-style:italic;color:#555;">เพราะยังมีคนที่เก่งกว่าเราอยู่อีกมาก  ….. แต่เค้า อาจแค่ขาดโอกาสที่จะมายืนอยู่ตรงนี้</p>

                    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
                        <p class="col-desc" style="font-size:0.82rem;margin:0"><strong>เพราะผลลัพธ์ที่ดี มันต้องมีความขยัน  เรียนรู้  เข้าใจ และ ให้เกียรติ</strong></p>
                    </div>
                </div>
            </div>

            '''

# ── WORK HISTORY ─────────────────────────────────────────────────────────
JOBS = [  # (role, place, year EN, year TH, desc EN, desc TH, extra EN, extra TH)
    ("Assistant to Founder", "TCAITHAI Cuisine Academy", None, None,
     "Supported the founder’s executive image management and strategic social media marketing. Analyzed market trends to develop content strategies and executed targeted campaigns.",
     "สนับสนุนการจัดการภาพลักษณ์ของผู้ก่อตั้งและการตลาดโซเชียลมีเดียเชิงกลยุทธ์ วิเคราะห์แนวโน้มตลาดเพื่อนำมาพัฒนากลยุทธ์คอนเทนต์ และดำเนินแคมเปญให้ตรงกับกลุ่มเป้าหมาย", None, None),
    ("Live Streamer – Freelance", None, "2022–Present", "2022–ปัจจุบัน",
     "Works independently across TikTok LIVE, Facebook Live and Shopee Live. Applies structured preparation to each project, including brand and product research, product curation, scripting, technical setup, live execution and post-session review. Has worked with 20+ brands and delivered six-figure GMV in regular two-hour sessions.",
     "ทำงานอิสระบน TikTok LIVE, Facebook Live และ Shopee Live โดยใช้กระบวนการเตรียมงานอย่างเป็นระบบในแต่ละโปรเจกต์ ตั้งแต่การศึกษาข้อมูลแบรนด์และสินค้า การคัดเลือกสินค้า การเขียนสคริปต์ การจัดระบบเทคนิค การดำเนินไลฟ์ ไปจนถึงการทบทวนผลหลังจบงาน มีประสบการณ์ร่วมงานกับแบรนด์มากกว่า 20 แบรนด์ และสร้างยอด GMV ระดับ 6 หลักในไลฟ์รูปแบบปกติ 2 ชั่วโมง", None, None),
    ("Assistant Restaurant Manager", "MUU Bangkok Hotel", None, None,
     "Supported daily operations across five restaurants, including purchasing, F&amp;B coordination and service standards. Designed team training programs and managed night shifts.",
     "สนับสนุนการดำเนินงานประจำวันของร้านอาหาร 5 ร้าน ครอบคลุมการจัดซื้อ การประสานงานด้าน F&amp;B และการรักษามาตรฐานการบริการ ออกแบบโปรแกรมฝึกอบรมทีมงานและดูแลการทำงานกะกลางคืน", None, None),
    ("Director of Operations", "Chef Andy Yang – Table 38 Bangkok", None, None,
     "Managed restaurant operations and team performance under Michelin-level standards. Handled VIP/VVIP customers and worked to improve team efficiency. Oversaw off-site catering and food-booth operations for large events across Bangkok, including advance procurement, supplier relationships, logistics, staffing, booth setup and raw-material quality control.",
     "บริหารการดำเนินงานของร้านอาหารและทีมงานภายใต้มาตรฐานระดับ Michelin ดูแลลูกค้า VIP/VVIP และปรับปรุงประสิทธิภาพการทำงานของทีม รับผิดชอบงานจัดเลี้ยงนอกสถานที่และบูธอาหารในอีเวนต์ขนาดใหญ่ทั่วกรุงเทพฯ ตั้งแต่การจัดซื้อและประสานงานซัพพลายเออร์ การวางแผนโลจิสติกส์ การจัดทีมงาน การติดตั้งบูธ ไปจนถึงการควบคุมคุณภาพวัตถุดิบ",
     "Additional context: Chef Andy Yang’s former New York restaurant, Rhong Tiam, received a Michelin star in 2010; Table 38 Bangkok was also recognized by the MICHELIN Guide.",
     "ข้อมูลประกอบ: Rhong Tiam ร้านอาหารเดิมของ Chef Andy Yang ในนิวยอร์กได้รับ Michelin Star ในปี 2010 และ Table 38 Bangkok ก็เคยได้รับการแนะนำใน MICHELIN Guide เช่นกัน"),
    ("Sales Manager", "Cafe &amp; Kantary Hotels", None, None,
     "Held a sales management position within the hotel and hospitality sector.",
     "รับผิดชอบงานด้านการบริหารฝ่ายขายในธุรกิจโรงแรมและการบริการ", None, None),
    ("Executive Secretary to MD", "Chef Chumpol Jangprai – R-HAAN", "2018–2023", "2018–2023",
     "Provided administrative and operational support to the Managing Director. Coordinated schedules, high-level logistics, team communication and international VIP/VVIP guest experiences from reservation through on-site arrangements and follow-up. Coordinated with local farming communities nationwide to match ingredients with menu concepts, with an interest in supporting sustainable income for producers. Also supported the MD’s work connected with his roles as UN Sustainable Food Ambassador and Thai Food Ambassador. R-HAAN received two MICHELIN Stars; Chef Chumpol is also known as Iron Chef Thailand.",
     "ให้การสนับสนุนด้านธุรการและการปฏิบัติงานแก่กรรมการผู้จัดการ ดูแลการประสานงานตารางงาน ภารกิจสำคัญ การสื่อสารระหว่างทีม และประสบการณ์ของลูกค้า VIP/VVIP ชาวต่างชาติ ตั้งแต่การจอง การต้อนรับหน้างาน ไปจนถึงการติดตามผล ประสานงานกับเครือข่ายเกษตรกรท้องถิ่นทั่วประเทศเพื่อคัดเลือกวัตถุดิบให้สอดคล้องกับแนวคิดของเมนู โดยให้ความสำคัญกับการสร้างรายได้ที่ยั่งยืนแก่ผู้ผลิตในชุมชน รวมถึงสนับสนุนภารกิจของ MD ที่เกี่ยวข้องกับบทบาท UN Sustainable Food Ambassador และ Thai Food Ambassador ร้าน R-HAAN ได้รับ 2 Michelin Stars และ Chef Chumpol เป็นที่รู้จักในฐานะ Iron Chef Thailand", None, None),
    ("Account Executive", "MUN Forward Radio Program at CNX", None, None,
     "Worked across on-air hosting and client management, combining communication skills with commercial coordination.",
     "ทำงานด้านการจัดรายการและดำเนินรายการออกอากาศ ควบคู่กับการดูแลลูกค้าและประสานงานเชิงพาณิชย์", None, None),
    ("Make Up Artist &amp; Hair Stylist", "Freelance", None, None,
     "Provided freelance make-up and hairstyling services.",
     "ให้บริการแต่งหน้าและทำผมในรูปแบบฟรีแลนซ์", None, None),
    ("General Manager and Sales", "Asia Diamond (Family Business)", None, None,
     "Worked in general management and sales within the family business.",
     "ปฏิบัติงานด้านการบริหารทั่วไปและการขายภายในธุรกิจครอบครัว", None, None),
]
EDU = {  # (role, place)
    'en': [("Bachelor of Science, Major in Industrial Computer Technology", "Ubon Ratchathani Rajabhat University | GPA 3.05"),
           ("Thai Cookery Certificate", "MSC Thai Culinary School")],
    'th': [("ปริญญาตรี วิทยาศาสตรบัณฑิต สาขาคอมพิวเตอร์อุตสาหกรรม", "มหาวิทยาลัยราชภัฏอุบลราชธานี | GPA 3.05"),
           ("ประกาศนียบัตรการทำอาหารไทย", "MSC Thai Culinary School")],
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


GMV = ['฿114,762', '฿109,857', '฿83,224', '฿59,936']
RESULTS_CARD = ('''        <!-- SELECTED LIVE RESULTS (owner's file) — stats-row / stat-box / big-btn-row of about_island.html -->
        <div class="content-card single">
            <h2 class="col-title"><span data-lang="en">SELECTED LIVE RESULTS · 2-HOUR SESSIONS</span><span data-lang="th" style="display:none;">ผลลัพธ์บางส่วนจากไลฟ์ · 2 ชั่วโมง</span></h2>
            <div class="stats-row">
''' + ''.join(f'                <div class="stat-box"><div class="stat-num">{g}</div><div class="stat-label">GMV</div></div>\n' for g in GMV) + '''            </div>
            <div class="big-btn-row">
                <a class="big-btn" href="works_photos.html">Gallery งานไลฟ์</a>
                <a class="big-btn" href="works_clips.html">Video งานไลฟ์</a>
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;">
                <p class="col-desc" style="margin:0 0 6px"><strong>Contact</strong></p>
                <p class="col-desc" style="margin:0">Line ID: i_am_jenny · Email: jyne@ideas365.online / hellojyne@gmail.com · Phone: 083-436-6937 · Website: ideas365.space</p>
            </div>
        </div>
''')

# setLang of about_island.html, made to switch every [data-lang] block of the page (same buttons, same colours)
SETLANG_OLD = ("            document.getElementById('bio-en').style.display = lang === 'en' ? 'block' : 'none';\n"
               "            document.getElementById('bio-th').style.display = lang === 'th' ? 'block' : 'none';\n")
SETLANG_NEW = ("            document.querySelectorAll('[data-lang]').forEach(function (el) { el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none'; });   /* added: every EN/TH block of the page */\n")
