"""Builds the regrouped island pages into public/ from the ORIGINAL page files (copied block by block,
markup / CSS / scripts unchanged). Nothing in the original files is modified.

Grouping (from the owner's diagram):
  SOLO-PROJECT WAREHOUSE -> island_works.html   : คลิปวิดีโอ, รูปผลงาน
  ABOUT ISLAND           -> island_about.html   : โปรไฟล์, ประวัติการทำงาน, e-commerce Live Streaming
  LEARNING BRIDGE        -> island_learning.html: รวมเครื่องมือ/ระบบ AI, เอกสาร·ความรู้, งานออกแบบ
Run from the repo root:  python3 scripts/build-island-pages.py
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public'
src = lambda f: (ROOT / f).read_text(encoding='utf-8')

MENU_CSS = """
    <style>
        /* added: link back to the main island map (square, no frame) */
        .main-menu-link { font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 0.85rem; letter-spacing: 2px;
            text-decoration: none; color: inherit; background: rgba(0,0,0,0.22); padding: 9px 16px; border-radius: 0; }
        .main-menu-link:hover { background: rgba(0,0,0,0.38); }
    </style>
"""
BACK_JS = """
<script>
    /* added: BACK = previous page (or this island's map when opened directly) */
    function goBack(fallback) {
        try { if (document.referrer && new URL(document.referrer).origin === location.origin) { history.back(); return false; } } catch (e) {}
        location.href = fallback; return false;
    }
</script>
"""
MENU_LINK = '<a href="index.html" class="main-menu-link">MAIN MENU</a>'


def cut(text, start, end):
    """text from the line holding `start` up to (not incl.) the line holding `end`"""
    a = text.index(start); a = text.rfind('\n', 0, a) + 1
    b = text.index(end, a + len(start)); b = text.rfind('\n', 0, b) + 1
    return text[a:b]


def page(file, title_tag, h1, sub, blocks, back, tail_fix=None, tail=None):
    t = src(file)
    head_end = t.index('</head>')
    head = re.sub(r'<title>.*?</title>', f'<title>{title_tag} - iDEAS365</title>', t[:head_end], count=1, flags=re.S) + MENU_CSS
    if 'class="hero"' in t:                                    # Works Town layout: title in .hero before <main>
        pre_end = t.index('<main class="main-content">') + len('<main class="main-content">') + 1
    else:
        sub_at = t.index('page-subtitle'); pre_end = t.index('</p>', sub_at) + len('</p>') + 1
    pre = t[head_end:pre_end]
    pre = re.sub(r'(<h1 class="page-title[^"]*">).*?(</h1>)', lambda m: m.group(1) + h1 + m.group(2), pre, count=1, flags=re.S)
    pre = re.sub(r'(<p class="page-subtitle[^"]*">).*?(</p>)', lambda m: m.group(1) + sub + m.group(2), pre, count=1, flags=re.S)
    if '<span></span>' in pre:                                 # Works Town header: logo | span | back
        pre = pre.replace('<span></span>', f'<span style="justify-self:end;margin-right:16px">{MENU_LINK}</span>', 1)
    else:
        pre = pre.replace('</header>', f'    {MENU_LINK}\n    </header>', 1)
    pre = re.sub(r'<a href="index.html" class="(back-btn)">', rf'<a href="{back}" class="\1" onclick="return goBack(this.href)">', pre)
    tl = tail if tail is not None else t[t.index('</main>'):]
    tl = re.sub(r'<a href="index.html" class="(back-fixed|back-btn-fixed)">', rf'<a href="{back}" class="\1" onclick="return goBack(this.href)">', tl)
    if tail_fix: tl = tail_fix(tl)
    tl = tl.replace('</body>', BACK_JS + '</body>', 1)
    return head + pre + '\n'.join(blocks) + tl


def write(name, html):
    (OUT / name).write_text(html, encoding='utf-8')
    print('wrote', name, len(html))


# ── ABOUT ISLAND group (about_island.html) ───────────────────────────────
A = src('about_island.html')
A_LANG, A_EXP, A_CORE, A_CASE, A_SALES, A_RES, A_END = (
    '<!-- LANG TOGGLE', '<!-- EXPERIENCE + SKILLS -->', '<!-- CORE SKILLS + PHOTOS + BUTTONS -->',
    '<!-- CASE STUDY -->', '<!-- SALES FIGURES -->', '<!-- RESUME -->', '    </main>')
guard_lang = lambda tl: tl.replace("setLang('en');", "if (document.getElementById('bio-en')) setLang('en');")

write('about_profile.html', page('about_island.html', 'PROFILE', 'PROFILE', 'โปรไฟล์ · ตัวฉัน · จุดแข็ง', [
    cut(A, A_LANG, A_EXP),          # EN/TH toggle + WHO IS JYNE + photo + 6-FIGURE / 20+ / 10Y+
    cut(A, A_CORE, A_CASE),         # CORE SKILLS list + photos + MORE EXPERIENCE / ANOTHER SKILL
], 'island_about.html'))

resume = cut(A, A_RES, A_END).replace(
    '            >\n        </div>',
    '            >\n            <div style="text-align:center;margin-top:20px">\n'
    '                <a class="big-btn" href="https://ik.imagekit.io/ideas365logo/JYNEResume042025.jpg?updatedAt=1772818993797" '
    'download target="_blank" style="display:inline-block;padding:14px 40px;border-radius:0">DOWNLOAD RESUME ↓</a>\n'
    '            </div>\n        </div>', 1)
write('about_experience.html', page('about_island.html', 'WORK HISTORY', 'WORK<br>HISTORY', 'ประวัติการทำงาน · ไทม์ไลน์ · ใบประกาศ · เรซูเม่', [
    cut(A, A_EXP, A_CORE),          # EXPERIENCE timeline + CORE SKILLS tags + photos
    cut(A, A_SALES, A_RES),         # PREVIOUS WORK EXPERIENCE photos
    """        <!-- CERTIFICATES (added heading — content to come) -->
        <div class="content-card single">
            <h2 class="col-title">CERTIFICATES · ใบประกาศ · ทักษะอื่น</h2>
            <p class="col-desc" style="color:#888">เร็วๆ นี้</p>
        </div>
""",
    resume,                         # RESUME (+ download)
], 'island_about.html', guard_lang))

WT = src('work_town.html')
wt_case = cut(WT, 'class="case-grid"', '</main>')
proofs = re.findall(r'<img src="(https://ik\.imagekit\.io/ideas365logo/proof\d\.jpg)" alt="([^"]*)"', WT)
proof_card = """        <!-- RESULT · 2 HRS/LIVE (images from work_town.html) -->
        <div class="content-card single">
            <h2 class="col-title">RESULT · 2 HRS/LIVE</h2>
            <div class="proof-grid-result">
""" + ''.join(f'                <img src="{u}" alt="{a}">\n' for u, a in proofs) + """            </div>
            <p class="col-desc" style="margin-top:10px;color:#888;font-size:0.78rem">TikTok LIVE · Facebook · Shopee · BBL · Big C Thailand</p>
        </div>
"""
write('about_live.html', page('about_island.html', 'LIVE COMMERCE', 'LIVE<br>COMMERCE', 'e-commerce Live Streaming', [
    cut(A, A_CASE, A_SALES),        # JENNY JYNE · CASE STUDY + RESULT (about_island)
    proof_card,                     # RESULT images from Works Town
], 'island_about.html', guard_lang))

# ── SOLO-PROJECT WAREHOUSE group (work_marina.html) ──────────────────────
M = src('work_marina.html')
M_MEDIA, M_VOICE, M_END = '<!-- 4. PORTFOLIO MEDIA -->', '<!-- 5. AI VOICE GENERATOR -->', '    </main>'
soon = lambda items: """        <!-- COMING SOON (added headings — content to come) -->
        <div class="content-card single">
            <h2 class="col-title">COMING SOON · เร็วๆ นี้</h2>
            <ul class="hl">
""" + ''.join(f'                <li>{i}</li>\n' for i in items) + """            </ul>
        </div>
"""
write('works_clips.html', page('work_marina.html', 'VIDEO CLIPS', 'VIDEO<br>CLIPS', 'คลิปวิดีโอ', [
    cut(M, M_MEDIA, M_VOICE),       # PORTFOLIO MEDIA — live selling clips
    cut(M, M_VOICE, M_END),         # AI VOICE GENERATOR — AI voice & avatar clips
    soon(['ไลฟ์คอนเทนต์', 'รับทำคอนเทนต์', 'คลิปสร้างจาก AI', 'อีเวนต์ · โปรโมท F&amp;B']),
], 'island_works.html'))

results = re.findall(r'<img src="(https://ik\.imagekit\.io/ideas365logo/Screenshot%202026[^"]+)"', A)
write('works_photos.html', page('work_marina.html', 'PHOTO WORKS', 'PHOTO<br>WORKS', 'รูปผลงาน', [
    """        <!-- MAKEUP & HAIR (image from the PREVIOUS WORK grid) -->
        <div class="content-card single">
            <h2 class="col-title">MAKEUP &amp; HAIR · แต่งหน้า · ทำผม</h2>
            <div class="proof-grid-work">
                <img src="https://ik.imagekit.io/ideas365logo/makeup1.jpg">
            </div>
        </div>
""",
    """        <!-- LIVE RESULTS (screenshots from the RESULT grid) -->
        <div class="content-card single">
            <h2 class="col-title">LIVE RESULTS · ผลไลฟ์ 6 หลัก</h2>
            <div class="proof-grid-result">
""" + ''.join(f'                <img src="{u}">\n' for u in results) + """            </div>
        </div>
""",
    soon(['อาหาร', 'ออกบูธ · อีเวนต์']),
], 'island_works.html'))

# ── LEARNING BRIDGE group ────────────────────────────────────────────────
sec = [m.start() for m in re.finditer(r'    <!-- ═{10,}', WT)]
tools_blocks = WT[sec[0]:sec[3]]    # AI TOOLS & ASTROLOGY / COMMERCE & BUSINESS / CREATIVE TOOLS (from the sheet)
write('learning_tools.html', page('work_town.html', 'AI TOOLS', 'AI<br>TOOLS', 'รวมเครื่องมือ / ระบบ ที่ทำงานร่วมกับ AI ด้วยสร้างเองทั้งระบบ',
    [tools_blocks], 'island_learning.html'))

L = src('learning_bay.html')
write('learning_docs.html', page('learning_bay.html', 'DOCUMENTS', 'DOCS &amp;<br>KNOWLEDGE', 'เอกสาร · ความรู้ · เอกสารฟรี · หนังสือ · เทมเพลต · ตารางช่วยงาน',
    [cut(L, '<!-- FREE RESOURCES', '    </main>')], 'island_learning.html'))

l_tail = '    </main>\n\n' + L[L.index('    <footer class="site-footer">'):]
write('learning_design.html', page('learning_bay.html', 'DESIGN WORKS', 'DESIGN<br>WORKS', 'งานออกแบบ', [
    """        <!-- WEB DESIGN (link to the Wix site already used on About Island) -->
        <div class="content-card">
            <h2 class="col-title">WEB DESIGN · หน้าเว็บ (Wix)</h2>
            <p class="col-desc">เว็บไซต์ที่ออกแบบและทำเองบน Wix</p>
            <a class="res-dl-btn" style="border-radius:0" href="https://adminccl.wixsite.com/a-little-bit-idea-2/home" target="_blank">เปิดเว็บไซต์ ↗</a>
        </div>
""",
    """        <!-- COMING SOON (added headings — content to come) -->
        <div class="content-card">
            <h2 class="col-title">COMING SOON</h2>
            <p class="col-desc">Creative · กราฟิก<br>แผนคอนเทนต์การตลาด</p>
        </div>
""",
], 'island_learning.html', tail=l_tail))

# ── island sub-maps (same look as the main map: index.html CSS) ─────────
IDX = src('index.html')
idx_css = IDX[IDX.index('<style>'):IDX.index('</style>') + len('</style>')]
SUB_CSS = """
    <style>
        /* sub-map: same .island / .island-badge as the main map */
        .submap-title { position: fixed; top: 28px; left: 50%; transform: translateX(-50%); z-index: 101;
            font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 1.3rem; letter-spacing: 2px; color: #000;
            background: rgba(255,255,255,0.95); padding: 6px 18px; border-radius: 0; white-space: nowrap; }
        .main-menu-link { position: fixed; top: 28px; right: 40px; z-index: 101; font-family: 'Anton', 'Noto Sans Thai', sans-serif;
            font-size: 0.85rem; letter-spacing: 2px; text-decoration: none; color: #fff; background: rgba(0,0,0,0.55); padding: 9px 16px; }
        .sub-island { animation: individualFloat 8s ease-in-out infinite; }
        .sub-island:nth-of-type(2) { animation-duration: 9s; animation-delay: -0.6s; }
        .sub-island:nth-of-type(3) { animation-duration: 7.5s; animation-delay: -1.2s; }
        /* until the button picture exists: a box like the owner's diagram */
        .sub-box { display: none; background: #1A1A1A; color: #fff; padding: 16px 18px; width: 100%; box-sizing: border-box; text-align: left; }
        .sub-box b { display: block; font-size: 1.05rem; margin-bottom: 6px; }
        .sub-box span { display: block; font-size: 0.8rem; line-height: 1.6; opacity: 0.85; }
        .back-fixed { position: fixed; bottom: 28px; right: 28px; z-index: 999; display: block; }
        .back-fixed img { height: 68px; display: block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25)); transition: transform 0.2s; }
        .back-fixed:hover img { transform: scale(1.08); }
        @media (max-width: 768px) {
            .map-wrapper { height: calc(var(--n) * 320px + 120px) !important; }
            .sub-island { width: 72% !important; left: 14% !important; right: auto !important; animation: none !important; }
            .main-menu-link { top: 12px; right: 16px; }
            .submap-title { top: 60px; font-size: 1rem; }
        }
    </style>
"""
BACK_IMG = 'https://ik.imagekit.io/ideas365logo/BACK%20(1)%20(1).png?updatedAt=1773177420277'


def submap(name, title, group, buttons):
    isl = []
    for i, (href, label, slug, pos, items) in enumerate(buttons):
        l, t, w = pos
        isl.append(f"""            <a href="{href}" class="island sub-island" data-tooltip="{label}" style="left:{l}%;top:{t}%;width:{w}%;--m-top:{120 + i * 320}px">
                <div class="island-badge">{label}</div>
                <img src="islands/{group}/btn-{slug}.png" alt="{label}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                <div class="sub-box"><b>{label}</b>{''.join(f'<span>{x}</span>' for x in items)}</div>
            </a>""")
    html = f"""<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>{title.replace('&amp;', '&')} - iDEAS365</title>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Noto+Sans+Thai:wght@300;400;600&display=swap"
        rel="stylesheet">
    {idx_css}
{SUB_CSS}
    <style>@media (max-width: 768px) {{ .sub-island {{ top: var(--m-top) !important; }} }}</style>
</head>

<body>
    <header class="nav-header">
        <a href="index.html"><img src="https://ik.imagekit.io/ideas365logo/LOGO_iDEAS365Black.png?updatedAt=1772818424343" alt="iDEAS365"
            class="logo-img"></a>
    </header>
    <div class="submap-title">{title}</div>
    {MENU_LINK}

    <div id="view-map">
        <div class="map-wrapper" style="--n:{len(buttons)}">
{chr(10).join(isl)}
        </div>
    </div>

    <a href="index.html" class="back-fixed"><img src="{BACK_IMG}" alt="Back"></a>
</body>

</html>
"""
    write(name, html)


submap('island_about.html', 'ABOUT ISLAND', 'about', [
    ('about_profile.html', 'โปรไฟล์', 'profile', (58, 14, 24), ['ตัวฉัน · สรุปสั้น', 'จุดแข็ง', 'เลือกเส้นทางตามงาน']),
    ('about_experience.html', 'ประวัติการทำงาน', 'experience', (58, 54, 24), ['ไทม์ไลน์งานที่ผ่านมา', 'ใบประกาศ · ทักษะอื่น', 'เรซูเม่ (ดาวน์โหลด)']),
    ('about_live.html', 'e-commerce Live Streaming', 'live', (14, 36, 24), ['Case study', 'ผลไลฟ์ 2 ชั่วโมง']),
])
submap('island_works.html', 'PIC&amp;CLIP WAREHOUSE', 'works', [
    ('works_clips.html', 'คลิปวิดีโอ', 'clips', (14, 36, 26), ['ไลฟ์ขายของ', 'ไลฟ์คอนเทนต์', 'รับทำคอนเทนต์', 'สร้างจาก AI', 'อีเวนต์ · โปรโมท F&amp;B', 'AI Voice · Avatar']),
    ('works_photos.html', 'รูปผลงาน', 'photos', (58, 22, 26), ['แต่งหน้า · ทำผม', 'อาหาร', 'ออกบูธ · อีเวนต์', 'ผลไลฟ์ 6 หลัก']),
])
submap('island_learning.html', 'AI&amp;TECH CREATION BRIDGE', 'learning', [
    ('learning_tools.html', 'รวมเครื่องมือ / ระบบ AI', 'tools', (12, 30, 24), ['เครื่องมือและระบบที่ทำงานร่วมกับ AI', 'สร้างเองทั้งระบบ']),
    ('learning_docs.html', 'เอกสาร · ความรู้', 'docs', (58, 14, 26), ['เอกสารฟรี · หนังสือ', 'เทมเพลต · ตารางช่วยงาน']),
    ('learning_design.html', 'งานออกแบบ', 'design', (56, 54, 26), ['หน้าเว็บ (Wix)', 'Creative · กราฟิก', 'แผนคอนเทนต์การตลาด']),
])
