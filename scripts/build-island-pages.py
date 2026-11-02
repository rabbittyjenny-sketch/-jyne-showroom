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
# added: content from the back office (Supabase) first, original content when the DB has nothing for a topic
LOADER = '    <script src="i365-content.js" data-page="{page}" data-card="{card}"></script>\n'
I365_READY = '(window.I365 ? I365.ready : Promise.resolve())'


def hook(block, find, slug, count=1):
    """marks the element opened by `find` as the place for section `slug` (data-i365) — markup otherwise unchanged"""
    assert block.count(find) == count, (find, block.count(find))
    return block.replace(find, find[:-1] + f' data-i365="{slug}">', 1)


def cut(text, start, end):
    """text from the line holding `start` up to (not incl.) the line holding `end`"""
    a = text.index(start); a = text.rfind('\n', 0, a) + 1
    b = text.index(end, a + len(start)); b = text.rfind('\n', 0, b) + 1
    return text[a:b]


def page(pg, file, title_tag, h1, sub, blocks, back, tail_fix=None, tail=None, card='content', loader=True):
    t = src(file)
    head_end = t.index('</head>')
    head = re.sub(r'<title>.*?</title>', f'<title>{title_tag} - iDEAS365</title>', t[:head_end], count=1, flags=re.S) + MENU_CSS
    if loader: head += LOADER.format(page=pg, card=card)
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


NO_DB_PAGES = {'academy.html', 'service.html', '404.html'}


def write(name, html):
    assert ('data-page="' + name[:-5] + '"') in html or name.startswith('island_') or name in NO_DB_PAGES, name
    (OUT / name).write_text(html, encoding='utf-8')
    print('wrote', name, len(html))


# ── ABOUT ISLAND group (about_island.html) ───────────────────────────────
# data-i365="<section slug>" = the block that shows that section's items when the back office has published items
A = src('about_island.html')
A_LANG, A_EXP, A_CORE, A_CASE, A_SALES, A_RES, A_END = (
    '<!-- LANG TOGGLE', '<!-- EXPERIENCE + SKILLS -->', '<!-- CORE SKILLS + PHOTOS + BUTTONS -->',
    '<!-- CASE STUDY -->', '<!-- SALES FIGURES -->', '<!-- RESUME -->', '    </main>')
guard_lang = lambda tl: tl.replace("setLang('en');", "if (document.getElementById('bio-en')) setLang('en');")

write('about_profile.html', page('about_profile', 'about_island.html', 'PROFILE', 'PROFILE', 'โปรไฟล์ · ตัวฉัน · จุดแข็ง', [
    cut(A, A_LANG, A_EXP),          # EN/TH toggle + WHO IS JYNE + photo + 6-FIGURE / 20+ / 10Y+
    cut(A, A_CORE, A_CASE),         # CORE SKILLS list + photos + MORE EXPERIENCE / ANOTHER SKILL
], 'island_about.html'))

resume = cut(A, A_RES, A_END).replace(
    '            >\n        </div>',
    '            >\n            <div style="text-align:center;margin-top:20px">\n'
    '                <a class="big-btn" href="https://ik.imagekit.io/ideas365logo/JYNEResume042025.jpg?updatedAt=1772818993797" '
    'download target="_blank" style="display:inline-block;padding:14px 40px;border-radius:0">DOWNLOAD RESUME ↓</a>\n'
    '            </div>\n        </div>', 1)
resume = hook(resume, '<div class="content-card single">', 'resume')
write('about_experience.html', page('about_experience', 'about_island.html', 'WORK HISTORY', 'WORK<br>HISTORY', 'ประวัติการทำงาน · ไทม์ไลน์ · ใบประกาศ · เรซูเม่', [
    cut(A, A_EXP, A_CORE),          # EXPERIENCE timeline + CORE SKILLS tags + photos
    hook(cut(A, A_SALES, A_RES), '<div class="proof-grid-work">', 'previous-work'),   # PREVIOUS WORK EXPERIENCE photos
    """        <!-- CERTIFICATES (added heading — content to come) -->
        <div class="content-card single">
            <h2 class="col-title">CERTIFICATES · ใบประกาศ · ทักษะอื่น</h2>
            <p class="col-desc" style="color:#888" data-i365-soon="certificates">เร็วๆ นี้</p>
            <div class="proof-grid-work" data-i365="certificates" style="display:none"></div>
        </div>
""",
    resume,                         # RESUME (+ download)
], 'island_about.html', guard_lang))

WT = src('work_town.html')
proofs = re.findall(r'<img src="(https://ik\.imagekit\.io/ideas365logo/proof\d\.jpg)" alt="([^"]*)"', WT)
proof_card = """        <!-- RESULT · 2 HRS/LIVE (images from work_town.html) -->
        <div class="content-card single">
            <h2 class="col-title">RESULT · 2 HRS/LIVE</h2>
            <div class="proof-grid-result" data-i365="live-proof">
""" + ''.join(f'                <img src="{u}" alt="{a}">\n' for u, a in proofs) + """            </div>
            <p class="col-desc" style="margin-top:10px;color:#888;font-size:0.78rem">TikTok LIVE · Facebook · Shopee · BBL · Big C Thailand</p>
        </div>
"""
write('about_live.html', page('about_live', 'about_island.html', 'LIVE COMMERCE', 'LIVE<br>COMMERCE', 'e-commerce Live Streaming', [
    cut(A, A_CASE, A_SALES),        # JENNY JYNE · CASE STUDY + RESULT (about_island)
    proof_card,                     # RESULT images from Works Town
], 'island_about.html', guard_lang))

# ── PIC&CLIP WAREHOUSE group (work_marina.html) ──────────────────────────
M = src('work_marina.html')
M_MEDIA, M_VOICE, M_END = '<!-- 4. PORTFOLIO MEDIA -->', '<!-- 5. AI VOICE GENERATOR -->', '    </main>'
soon = lambda items: """        <!-- COMING SOON (added headings — content to come) -->
        <div class="content-card single" data-i365-soon-card>
            <h2 class="col-title">COMING SOON · เร็วๆ นี้</h2>
            <ul class="hl">
""" + ''.join(f'                <li data-i365-soon="{s}">{i}</li>\n' for i, s in items) + """            </ul>
        </div>
"""
write('works_clips.html', page('works_clips', 'work_marina.html', 'VIDEO CLIPS', 'VIDEO<br>CLIPS', 'คลิปวิดีโอ', [
    hook(cut(M, M_MEDIA, M_VOICE), '<div class="video-grid">', 'live-selling'),   # PORTFOLIO MEDIA — live selling clips
    hook(cut(M, M_VOICE, M_END), '<div class="video-grid">', 'ai-voice'),         # AI VOICE GENERATOR — AI voice & avatar clips
    soon([('ไลฟ์คอนเทนต์', 'live-content'), ('รับทำคอนเทนต์', 'content-work'), ('คลิปสร้างจาก AI', 'ai-clips'),
          ('อีเวนต์ · โปรโมท F&amp;B', 'event-promo')]),
], 'island_works.html'))

results = re.findall(r'<img src="(https://ik\.imagekit\.io/ideas365logo/Screenshot%202026[^"]+)"', A)
write('works_photos.html', page('works_photos', 'work_marina.html', 'PHOTO WORKS', 'PHOTO<br>WORKS', 'รูปผลงาน', [
    """        <!-- MAKEUP & HAIR (image from the PREVIOUS WORK grid) -->
        <div class="content-card single">
            <h2 class="col-title">MAKEUP &amp; HAIR · แต่งหน้า · ทำผม</h2>
            <div class="proof-grid-work" data-i365="makeup-hair">
                <img src="https://ik.imagekit.io/ideas365logo/makeup1.jpg">
            </div>
        </div>
""",
    """        <!-- LIVE RESULTS (screenshots from the RESULT grid) -->
        <div class="content-card single">
            <h2 class="col-title">LIVE RESULTS · ผลไลฟ์ 6 หลัก</h2>
            <div class="proof-grid-result" data-i365="live-results">
""" + ''.join(f'                <img src="{u}">\n' for u in results) + """            </div>
        </div>
""",
    soon([('อาหาร', 'food'), ('ออกบูธ · อีเวนต์', 'booth-event')]),
], 'island_works.html'))

# ── AI&TECH CREATION BRIDGE group ────────────────────────────────────────
sec = [m.start() for m in re.finditer(r'    <!-- ═{10,}', WT)]
tools_blocks = WT[sec[0]:sec[3]]    # AI TOOLS & ASTROLOGY / COMMERCE & BUSINESS / CREATIVE TOOLS (from the sheet)
for gid, slug in (('grid-astrology', 'tools-ai'), ('grid-commerce', 'tools-commerce'), ('grid-creative', 'tools-creative')):
    tools_blocks = hook(tools_blocks, f'<div class="ai-grid" id="{gid}">', slug)


def tools_tail(tl):
    # a grid the back office already filled is not overwritten by the sheet; the sheet loads after the DB answered
    find = "        const el = document.getElementById(elementId);\n"
    assert tl.count(find) == 1
    tl = tl.replace(find, find + "        if (el.hasAttribute('data-i365-filled')) return;   /* added: shown from the back office */\n", 1)
    assert tl.count('\nloadWorks();\n') == 1
    return tl.replace('\nloadWorks();\n', f'\n{I365_READY}.then(loadWorks);   /* added: after the back office data */\n', 1)


write('learning_tools.html', page('learning_tools', 'work_town.html', 'AI TOOLS', 'AI<br>TOOLS', 'รวมเครื่องมือ / ระบบ ที่ทำงานร่วมกับ AI ด้วยสร้างเองทั้งระบบ',
    [tools_blocks], 'island_learning.html', tools_tail, card='section'))

L = src('learning_bay.html')


def docs_tail(tl):
    find = '    loadResources();\n'
    assert tl.count(find) == 1
    return tl.replace(find, f"    {I365_READY}.then(function () {{ if (!(window.I365 && I365.filled['free-resources'])) loadResources(); }});   /* added: back office first */\n", 1)


write('learning_docs.html', page('learning_docs', 'learning_bay.html', 'DOCUMENTS', 'DOCS &amp;<br>KNOWLEDGE', 'เอกสาร · ความรู้ · เอกสารฟรี · หนังสือ · เทมเพลต · ตารางช่วยงาน',
    [hook(cut(L, '<!-- FREE RESOURCES', '    </main>'), '<div id="res-grid" class="res-grid">', 'free-resources')],
    'island_learning.html', docs_tail))

l_tail = '    </main>\n\n' + L[L.index('    <footer class="site-footer">'):]
write('learning_design.html', page('learning_design', 'learning_bay.html', 'DESIGN WORKS', 'DESIGN<br>WORKS', 'งานออกแบบ', [
    """        <!-- WEB DESIGN (link to the Wix site already used on About Island) -->
        <div class="content-card">
            <h2 class="col-title">WEB DESIGN · หน้าเว็บ (Wix)</h2>
            <div data-i365="web-design">
            <p class="col-desc">เว็บไซต์ที่ออกแบบและทำเองบน Wix</p>
            <a class="res-dl-btn" style="border-radius:0" href="https://adminccl.wixsite.com/a-little-bit-idea-2/home" target="_blank">เปิดเว็บไซต์ ↗</a>
            </div>
        </div>
""",
    """        <!-- COMING SOON (added headings — content to come) -->
        <div class="content-card" data-i365-soon-card>
            <h2 class="col-title">COMING SOON</h2>
            <p class="col-desc"><span data-i365-soon="creative" style="display:block">Creative · กราฟิก</span><span data-i365-soon="marketing-plans" style="display:block">แผนคอนเทนต์การตลาด</span></p>
        </div>
""",
], 'island_learning.html', tail=l_tail))

# ── ACADEMY BAY / A SERVICE MANIA: info page (like a plain PDF sheet) + button to the other site ──────
# The button asks first (pop-up) — the visitor accepts, then goes. Content of the sheet comes later.
LEAVE_CSS = """
    <style>
        /* added: info sheet + leave-site pop-up (square, no white frame) */
        .nav-header .main-menu-link { margin-left: auto; }
        .doc-sheet { display: block !important; max-width: 820px; min-height: 60vh; padding: 56px 64px; border-radius: 0; }
        @media (max-width: 640px) { .doc-sheet { padding: 36px 24px; } }
        .doc-meta { font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 28px; }
        .doc-empty { color: #aaa; font-size: 0.95rem; margin-top: 24px; }
        .leave-wrap { width: 100%; display: flex; justify-content: center; padding: 40px 20px 50px; }
        .leave-btn { display: inline-block; background: #1A1A1A; color: #fff; font-family: 'Anton', 'Noto Sans Thai', sans-serif;
            font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; padding: 16px 40px; border-radius: 0; text-decoration: none; }
        .leave-btn::after { content: ' →'; }
        .leave-btn:hover { background: #000; }
        .academy-btn { border-radius: 0 !important; }
        .leave-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6); display: none;
            align-items: center; justify-content: center; padding: 20px; }
        .leave-overlay.open { display: flex; }
        .leave-box { background: #1A1A1A; color: #fff; max-width: 440px; width: 100%; padding: 32px 30px 26px; border-radius: 0;
            font-family: 'Noto Sans Thai', sans-serif; }
        .leave-box h3 { font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-weight: 400; font-size: 1.5rem; letter-spacing: 1px; margin: 0 0 12px; }
        .leave-box p { font-size: 0.95rem; line-height: 1.7; margin: 0 0 8px; opacity: 0.9; }
        .leave-box .leave-host { font-size: 0.8rem; opacity: 0.6; word-break: break-all; }
        .leave-actions { display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap; }
        .leave-actions button { flex: 1; min-width: 140px; border: 0; border-radius: 0; padding: 13px 16px; cursor: pointer;
            font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 0.95rem; letter-spacing: 1px; }
        .leave-ok { background: var(--accent); color: #fff; }
        .leave-ok:hover { filter: brightness(0.9); }
        .leave-cancel { background: rgba(255,255,255,0.12); color: #fff; }
        .leave-cancel:hover { background: rgba(255,255,255,0.2); }
    </style>
"""
LEAVE_HTML = """
<!-- added: pop-up before going to another website -->
<div class="leave-overlay" id="leave-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-title">
    <div class="leave-box">
        <h3 id="leave-title">ออกจาก iDEAS365</h3>
        <p>ปุ่มนี้จะพาไปที่ <b id="leave-name"></b> ซึ่งเป็นเว็บไซต์แยกจากหน้านี้</p>
        <p class="leave-host" id="leave-host"></p>
        <p>ต้องการไปต่อหรือไม่?</p>
        <div class="leave-actions">
            <button type="button" class="leave-ok" id="leave-ok">ยอมรับ ไปต่อ</button>
            <button type="button" class="leave-cancel" id="leave-cancel">ยกเลิก</button>
        </div>
    </div>
</div>
<script>
    /* added: links with data-leave ask before leaving the site */
    (function () {
        var ov = document.getElementById('leave-overlay'), target = null;
        function close() { ov.classList.remove('open'); target = null; }
        document.querySelectorAll('a[data-leave]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault(); target = a.href;
                document.getElementById('leave-name').textContent = a.getAttribute('data-leave');
                document.getElementById('leave-host').textContent = new URL(a.href).host;
                ov.classList.add('open'); document.getElementById('leave-ok').focus();
            });
        });
        document.getElementById('leave-ok').addEventListener('click', function () { if (target) location.href = target; });
        document.getElementById('leave-cancel').addEventListener('click', close);
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    })();
</script>
"""


def doc_sheet(meta, heading, heading_cls):
    return f"""        <!-- INFO SHEET (content to come) -->
        <div class="content-card doc-sheet in-view">
            <div class="doc-meta">{meta}</div>
            <h2 class="{heading_cls}">{heading}</h2>
            <p class="doc-empty">เนื้อหาจะเพิ่มภายหลัง</p>
        </div>
"""


def with_leave(tl):
    return tl.replace('</body>', LEAVE_HTML + '</body>', 1)


def academy_tail(tl):
    find = '<a href="#" class="academy-btn">Go to Academy</a>'
    assert tl.count(find) == 1
    tl = tl.replace(find, '<a href="https://c365.ideas365.space/" class="academy-btn" data-leave="Creatr365">Go to Academy</a>', 1)
    return with_leave(tl)


html = page('academy', 'system_district.html', 'ACADEMY BAY', 'ACADEMY<br>BAY', 'Creatr365 · ความสำเร็จอยู่ในหลักสูตร',
            [doc_sheet('iDEAS365 · ACADEMY BAY · ข้อมูลเบื้องต้น', 'CREATR365', 'section-heading')], 'index.html', academy_tail, loader=False)
write('academy.html', html.replace('</head>', LEAVE_CSS + '</head>', 1))

leave_btn = """        <div class="leave-wrap">
            <a href="https://i-deas-365-web.vercel.app/services" class="leave-btn" data-leave="iDEAS365-web">ดูบริการทั้งหมด</a>
        </div>
"""
html = page('service', 'work_marina.html', 'A SERVICE MANIA', 'A SERVICE<br>MANIA', 'มีบริการอะไรบ้าง',
            [doc_sheet('iDEAS365 · A SERVICE MANIA · ข้อมูลเบื้องต้น', 'SERVICES · บริการ', 'col-title'), leave_btn], 'index.html', with_leave, loader=False)
write('service.html', html.replace('</head>', LEAVE_CSS + '</head>', 1))

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

# ── 404 (COMMUNITY HARBOR for now, and any address that does not exist) ─────────────────────────
# Vercel serves 404.html for unknown addresses; the map's COMMUNITY HARBOR links to community.html,
# which does not exist yet -> this page. When the community page is built, add community.html.
write('404.html', f"""<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - iDEAS365</title>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Noto+Sans+Thai:wght@300;400;600&display=swap"
        rel="stylesheet">
    {idx_css}
    <style>
        /* 404: same background / header as the map, square black box (no frame) */
        .nf-wrap {{ position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }}
        .nf-box {{ background: #1A1A1A; color: #fff; padding: 44px 48px 36px; max-width: 520px; width: 100%; text-align: center; border-radius: 0; }}
        .nf-code {{ font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: clamp(5rem, 18vw, 8rem); line-height: 0.9; letter-spacing: 2px; margin: 0; }}
        .nf-title {{ font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 1.2rem; letter-spacing: 2px; margin: 14px 0 6px; }}
        .nf-text {{ font-family: 'Noto Sans Thai', sans-serif; font-size: 0.95rem; opacity: 0.8; margin: 0 0 26px; }}
        .nf-btn {{ display: inline-block; background: #fff; color: #1A1A1A; text-decoration: none; padding: 13px 30px; border-radius: 0;
            font-family: 'Anton', 'Noto Sans Thai', sans-serif; letter-spacing: 2px; font-size: 0.95rem; }}
        .nf-btn:hover {{ background: #F5B800; }}
    </style>
</head>

<body>
    <header class="nav-header">
        <a href="/index.html"><img src="https://ik.imagekit.io/ideas365logo/LOGO_iDEAS365Black.png?updatedAt=1772818424343" alt="iDEAS365"
            class="logo-img"></a>
    </header>
    <div class="nf-wrap">
        <div class="nf-box">
            <p class="nf-code">404</p>
            <p class="nf-title">PAGE NOT FOUND</p>
            <p class="nf-text">หน้านี้ยังไม่เปิด หรือไม่มีอยู่</p>
            <a href="/index.html" class="nf-btn">MAIN MENU</a>
        </div>
    </div>
</body>

</html>
""")
