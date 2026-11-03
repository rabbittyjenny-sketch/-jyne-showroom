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
ORIG = ROOT / 'site-source' / 'originals'          # her original hand-built pages (sources only, not served)
src = lambda f: ((ROOT / 'public' / f) if f in ('index.html', 'contact_port.html') else (ORIG / f)).read_text(encoding='utf-8')

# (no MAIN MENU button: the original pages have only the logo, top-left = main map, and BACK)

# the owner's title setting (4 Nov 2026, from her reference "MORE COMING"): letters touching, lines close.
# Font, size, colour, weight and hover stay the original page's own CSS — only spacing is set here.
TITLE_CSS = """
    <style>
        /* added: page title letters set tight (owner's reference) */
        .page-title { letter-spacing: -0.015em; line-height: 0.86; }
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


def page(pg, file, title_tag, h1, sub, blocks, back, tail_fix=None, tail=None, card='content', loader=True, colours=''):
    t = src(file)
    head_end = t.index('</head>')
    head = re.sub(r'<title>.*?</title>', f'<title>{title_tag} - iDEAS365</title>', t[:head_end], count=1, flags=re.S) + TITLE_CSS + colours
    if loader: head += LOADER.format(page=pg, card=card)
    if 'class="hero"' in t:                                    # Works Town layout: title in .hero before <main>
        pre_end = t.index('<main class="main-content">') + len('<main class="main-content">') + 1
    else:
        sub_at = t.index('page-subtitle'); pre_end = t.index('</p>', sub_at) + len('</p>') + 1
    pre = t[head_end:pre_end]
    pre = re.sub(r'(<h1 class="page-title[^"]*">).*?(</h1>)', lambda m: m.group(1) + h1 + m.group(2), pre, count=1, flags=re.S)
    if sub is not None:                                       # None = keep the original tagline (island pages)
        pre = re.sub(r'(<p class="page-subtitle[^"]*">).*?(</p>)', lambda m: m.group(1) + sub + m.group(2), pre, count=1, flags=re.S)
    pre = re.sub(r'<a href="index.html" class="(back-btn)">', rf'<a href="{back}" class="\1" onclick="return goBack(this.href)">', pre)
    tl = tail if tail is not None else t[t.index('</main>'):]
    tl = re.sub(r'<a href="index.html" class="(back-fixed|back-btn-fixed)">', rf'<a href="{back}" class="\1" onclick="return goBack(this.href)">', tl)
    if tail_fix: tl = tail_fix(tl)
    tl = tl.replace('</body>', BACK_JS + '</body>', 1)
    return head + pre + '\n'.join(blocks) + tl


NO_DB_PAGES = {'academy.html', '404.html'}


def write(name, html):
    assert ('data-page="' + name[:-5] + '"') in html or name.startswith('island_') or name in NO_DB_PAGES, name
    (OUT / name).write_text(html, encoding='utf-8')
    print('wrote', name, len(html))


# Sub-pages use the colours of their main island (owner's rule, 4 Nov 2026), values copied from her
# original pages (19 Apr 2026, commit efeb6bf). When a sub-page borrows the markup of another page,
# only colour values are changed here; fonts, sizes, markup and text stay those of the source page.
# PIC&CLIP WAREHOUSE (map position island-work = work_town.html) -> VIDEO CLIPS, PHOTO WORKS
YELLOW_SET = """
    <style>
        /* colours of the main island: work_town.html (yellow) — :root 12-17, .page-title 53, .section-card 76,
           .col-title 375, .col-desc 382, .hl 389-404, .cs-pill 412, .proof-grid img 425, .site-footer 449 */
        :root { --bg-color: #F5B800; --accent: #F5B800; --text-dark: #ffffff; }
        body, html { background-color: #F5B800; }
        .page-title { color: #1A1A1A; }
        .content-card { background: #1A1A1A; color: #fff; }
        .col-title { color: #F5B800; border-bottom-color: rgba(255,255,255,0.1); }
        .col-desc { color: rgba(255,255,255,0.72); }
        .col-desc strong { color: #fff; }
        .hl li { color: rgba(255,255,255,0.76); border-bottom-color: rgba(255,255,255,0.08); }
        .hl li::before { color: #F5B800; }
        .cs-pill, .big-btn { background: #F5B800; color: #1A1A1A; }
        .photo-slot, .proof-grid-result img, .proof-grid-work img { background: #2a2a2a; }
        .site-footer { background: #1A1A1A; }
    </style>
"""
# AI&TECH CREATION BRIDGE (map position island-library = learning_bay.html) -> AI TOOLS
BLUE_SET = """
    <style>
        /* colours of the main island: learning_bay.html (blue) — :root 10, body 11, .content-card 18, .col-title 20,
           .col-desc 21, .res-card 28, .res-name 39, .res-updated 40, .res-dl-btn 41, .hover 122-134 */
        body, html { background: #1A6BCC; }
        .page-title { color: #0000; background: linear-gradient(90deg, #4285F4 50%, #ffffff 0) var(--_p, 100%) / 200% no-repeat;
            -webkit-background-clip: text; background-clip: text; transition: .4s; cursor: pointer; }
        .page-title:hover { --_p: 0%; }
        .section-card { background: #ffffff; color: #1A1A1A; }
        .section-title { color: #1155AA; border-bottom-color: #1155AA; }
        .section-sub, .loading-msg { color: #888; }
        .ai-card, .proj-card { background: #f5f5f0; border-color: #1A1A1A; color: #1A1A1A; }
        .ai-title-en, .proj-name-en { color: #1A1A1A; }
        .ai-title-th, .proj-name-th { color: #999; }
        .ai-desc, .proj-desc { color: #444; }
        .ai-cta, .proj-cta { background: #1A1A1A; color: #ffffff; border-color: #1A1A1A; }
        .col-title { color: #1155AA; }
        .col-desc { color: #444; }
    </style>
"""


# ── ABOUT ISLAND group (about_island.html) ───────────────────────────────
# data-i365="<section slug>" = the block that shows that section's items when the back office has published items
A = src('about_island.html')
import profile_content as PC   # owner's text for PROFILE / WORK HISTORY / LIVE COMMERCE (scripts/profile_content.py)
LANG_TOGGLE = cut(A, '<!-- LANG TOGGLE', '<!-- PROFILE + PHOTO')


def set_lang(tl):
    assert tl.count(PC.SETLANG_OLD) == 1
    return tl.replace(PC.SETLANG_OLD, PC.SETLANG_NEW, 1)


def between(block, start, end, new):
    a = block.index(start); b = block.index(end, a)
    return block[:a] + new + block[b:]

A_LANG, A_EXP, A_CORE, A_CASE, A_SALES, A_RES, A_END = (
    '<!-- LANG TOGGLE', '<!-- EXPERIENCE + SKILLS -->', '<!-- CORE SKILLS + PHOTOS + BUTTONS -->',
    '<!-- CASE STUDY -->', '<!-- SALES FIGURES -->', '<!-- RESUME -->', '    </main>')

profile_block = between(cut(A, A_LANG, A_EXP), '<div id="bio-en">', '<!-- PHOTO —', PC.BIO_EN + PC.BIO_TH)
write('about_profile.html', page('about_profile', 'about_island.html', 'PROFILE', 'PROFILE', '', [
    profile_block,                  # EN/TH toggle + WHO IS JYNE (owner's text) + photo + 6-FIGURE / 20+ / 10Y+
    cut(A, A_CORE, A_CASE),         # CORE SKILLS list + photos + MORE EXPERIENCE / ANOTHER SKILL
], 'island_about.html', set_lang))

resume = cut(A, A_RES, A_END).replace(
    '            >\n        </div>',
    '            >\n            <div style="text-align:center;margin-top:20px">\n'
    '                <a class="big-btn" href="https://ik.imagekit.io/ideas365logo/JYNEResume042025.jpg?updatedAt=1772818993797" '
    'download target="_blank" style="display:inline-block;padding:14px 40px;border-radius:0">DOWNLOAD RESUME ↓</a>\n'
    '            </div>\n        </div>', 1)
resume = hook(resume, '<div class="content-card single">', 'resume')
write('about_experience.html', page('about_experience', 'about_island.html', 'WORK HISTORY', 'WORK<br>HISTORY', '', [
    LANG_TOGGLE,                    # EN/TH toggle of about_island.html
    between(cut(A, A_EXP, A_CORE), '                <div class="tl-item">',
            '            </div>\n            <div>\n                <h2 class="col-title">CORE SKILLS', PC.experience_html()),
                                    # EXPERIENCE (owner's text, EN/TH) + EDUCATION + CORE SKILLS tags + photos
    hook(cut(A, A_SALES, A_RES), '<div class="proof-grid-work">', 'previous-work'),   # PREVIOUS WORK EXPERIENCE photos
    """        <!-- CERTIFICATES (added heading — content to come) -->
        <div class="content-card single">
            <h2 class="col-title">CERTIFICATES · ใบประกาศ · ทักษะอื่น</h2>
            <p class="col-desc" style="color:#888" data-i365-soon="certificates">เร็วๆ นี้</p>
            <div class="proof-grid-work" data-i365="certificates" style="display:none"></div>
        </div>
""",
    resume,                         # RESUME (+ download)
], 'island_about.html', set_lang))

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
write('about_live.html', page('about_live', 'about_island.html', 'LIVE COMMERCE', 'LIVE<br>COMMERCE', '', [
    LANG_TOGGLE,                    # EN/TH toggle of about_island.html
    between(cut(A, A_CASE, A_SALES), '            <div>\n                <h2 class="col-title">JENNY JYNE · CASE STUDY</h2>',
            '            <div>\n                <h2 class="col-title">RESULT · 2 HRS/LIVE</h2>', PC.live_text_html()),
                                    # LIVE COMMERCE text (owner's, EN/TH) + RESULT screenshots (about_island)
    PC.RESULTS_CARD,                # SELECTED LIVE RESULTS · GMV + Gallery / Video + Contact (owner's file)
    proof_card,                     # RESULT images from Works Town
], 'island_about.html', set_lang))

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
write('works_clips.html', page('works_clips', 'work_marina.html', 'VIDEO CLIPS', 'VIDEO<br>CLIPS', '', [
    hook(cut(M, M_MEDIA, M_VOICE), '<div class="video-grid">', 'live-selling'),   # PORTFOLIO MEDIA — live selling clips
    hook(cut(M, M_VOICE, M_END), '<div class="video-grid">', 'ai-voice'),         # AI VOICE GENERATOR — AI voice & avatar clips
    soon([('ไลฟ์คอนเทนต์', 'live-content'), ('รับทำคอนเทนต์', 'content-work'), ('คลิปสร้างจาก AI', 'ai-clips'),
          ('อีเวนต์ · โปรโมท F&amp;B', 'event-promo')]),
], 'island_works.html', colours=YELLOW_SET))

results = re.findall(r'<img src="(https://ik\.imagekit\.io/ideas365logo/Screenshot%202026[^"]+)"', A)
write('works_photos.html', page('works_photos', 'work_marina.html', 'PHOTO WORKS', 'PHOTO<br>WORKS', '', [
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
], 'island_works.html', colours=YELLOW_SET))

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


write('learning_tools.html', page('learning_tools', 'work_town.html', 'AI TOOLS', 'AI<br>TOOLS', '',
    [tools_blocks], 'island_learning.html', tools_tail, card='section', colours=BLUE_SET))

L = src('learning_bay.html')


def docs_tail(tl):
    find = '    loadResources();\n'
    assert tl.count(find) == 1
    return tl.replace(find, f"    {I365_READY}.then(function () {{ if (!(window.I365 && I365.filled['free-resources'])) loadResources(); }});   /* added: back office first */\n", 1)


write('learning_docs.html', page('learning_docs', 'learning_bay.html', 'DOCUMENTS', 'DOCS &amp;<br>KNOWLEDGE', '',
    [hook(cut(L, '<!-- FREE RESOURCES', '    </main>'), '<div id="res-grid" class="res-grid">', 'free-resources')],
    'island_learning.html', docs_tail))

l_tail = '    </main>\n\n' + L[L.index('    <footer class="site-footer">'):]
write('learning_design.html', page('learning_design', 'learning_bay.html', 'DESIGN WORKS', 'DESIGN<br>WORKS', '', [
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


html = page('academy', 'system_district.html', 'ACADEMY BAY', 'ACADEMY<br>BAY', None,
            [doc_sheet('iDEAS365 · ACADEMY BAY · ข้อมูลเบื้องต้น', 'CREATR365', 'section-heading')], 'index.html', academy_tail, loader=False)
write('academy.html', html.replace('</head>', LEAVE_CSS + '</head>', 1))

# ── A SERVICE MANIA: work explanation + services, content from iDEAS365-web (site-source/service-content.json) ──
# Same card classes as the original pages (work_marina.html). Each block is a back-office topic (data-i365):
# items published there replace the block; with none published the page shows this content.
import html as _h, json as _json
SVC = _json.loads((ROOT / 'site-source' / 'service-content.json').read_text(encoding='utf-8'))
e = lambda s: _h.escape(s, quote=True)
SVC_CSS = """
    <style>
        /* added: service page (square buttons, no white frames) */
        .svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
        .svc-th { display: block; font-size: 0.8rem; color: #888; font-weight: 300; }
        .svc-h3 { font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 1.25rem; color: var(--text-dark); margin: 26px 0 6px; letter-spacing: 0.3px; }
        .svc-h3 .svc-th { font-family: 'Noto Sans Thai', sans-serif; font-size: 0.85rem; margin-top: 2px; }
        .svc-btn { display: inline-block; background: #1A1A1A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 0;
            font-family: 'Anton', 'Noto Sans Thai', sans-serif; letter-spacing: 1.5px; font-size: 0.95rem; margin-top: 22px; }
        .svc-btn:hover { background: var(--accent); }
        @media (max-width: 768px) { .svc-grid { grid-template-columns: 1fr; } }
    </style>
"""


def svc_point(no, title, en, th, kind):
    if kind == 'list':
        en_line = '<span class="svc-th">' + e(en) + '</span>' if en else ''
        return f'                <li>{e(title)}{en_line}<span class="svc-th">{e(th)}</span></li>\n'
    year = f'<div class="tl-year">{no:02d}</div>' if kind == 'timeline' else ''
    return (f'                <div class="tl-item">{year}<div class="tl-role">{e(title)}</div>'
            + (f'<div class="tl-desc">{e(en)}</div>' if en else '') + (f'<div class="tl-desc">{e(th)}</div>' if th else '') + '</div>\n')


def svc_card(s):
    li = ''.join(f'                    <li>{e(en)}<span class="svc-th">{e(th)}</span></li>\n' for en, th in s['points'])
    body = ''.join(f'                <p class="col-desc">{e(en)}<span class="svc-th">{e(th)}</span></p>\n' for en, th in s['detail_body'])
    fw = ''.join(f'                    <li><strong>{e(lab)}:</strong> {e(en)}<span class="svc-th">{e(th)}</span></li>\n'
                 for lab, en, th in s['framework_points'])
    return f"""            <div class="content-card single"><div>
                <div class="tl-year">{e(s['label'])}</div>
                <h2 class="col-title">{e(s['title_en'])}<span class="svc-th" style="font-size:1rem">{e(s['title_th'])}</span></h2>
                <p class="col-desc">{e(s['lead_en'])}<span class="svc-th">{e(s['lead_th'])}</span></p>
                <ul class="hl">
{li}                </ul>
                <h3 class="svc-h3">{e(s['detail_title'][0])}<span class="svc-th">{e(s['detail_title'][1])}</span></h3>
{body}                <h3 class="svc-h3">{e(s['framework_title'][0])}<span class="svc-th">{e(s['framework_title'][1])}</span></h3>
                <ul class="hl">
{fw}                </ul>
                <a class="svc-btn" href="contact_port.html">{e(s['cta_label'])}</a>
            </div></div>
"""


def svc_block(key, slug, kind, extra=''):
    b = SVC[key]
    items = ''.join(svc_point(i, *row, kind) for i, row in enumerate(b['items'], 1))
    sub = f'\n            <p class="col-desc" style="margin-bottom:6px">{e(b["subtitle"])}</p>' if b.get('subtitle') else ''
    inner = (f'            <ul class="hl" data-i365="{slug}">\n{items}            </ul>' if kind == 'list'
             else f'            <div class="{extra}" data-i365="{slug}">\n{items}            </div>')
    return f'            <h2 class="col-title">{e(b["title"])}</h2>{sub}\n{inner}\n'


svc_blocks = [
    '        <!-- HOW I WORK (iDEAS365-web /work) -->\n        <div class="content-card single">\n' + svc_block('how_i_work', 'how-i-work', 'timeline') + '        </div>\n',
    '        <!-- WHAT TO EXPECT (iDEAS365-web /approach) -->\n        <div class="content-card single">\n' + svc_block('what_to_expect', 'what-to-expect', 'cards', 'svc-grid') + '        </div>\n',
    '        <!-- I WORK WITH / I DON\'T WORK WITH (iDEAS365-web /work) -->\n        <div class="content-card">\n            <div>\n'
    + svc_block('work_with', 'work-with', 'list') + '            </div>\n            <div>\n' + svc_block('dont_work_with', 'dont-work-with', 'list') + '            </div>\n        </div>\n',
    f"""        <!-- SERVICES (iDEAS365-web /services + /services/strategy, /systems, /live-commerce) -->
        <div class="content-card single">
            <h2 class="col-title">{e(SVC['services']['title'])}</h2>
            <p class="col-desc">{e(SVC['services']['subtitle'])}</p>
        </div>
        <div style="display:contents" data-i365="services">
""" + ''.join(svc_card(s) for s in SVC['services']['items']) + '        </div>\n',
]
html = page('service', 'work_marina.html', 'A SERVICE MANIA', 'A SERVICE<br>MANIA', None, svc_blocks, 'index.html')
write('service.html', html.replace('</head>', SVC_CSS + '</head>', 1))

# ── island pages (ABOUT ISLAND, PIC&CLIP WAREHOUSE, AI&TECH CREATION BRIDGE) ──────────────────────────
# Each island page IS that island's original page (site-source/originals): same head CSS, header, logo, page
# title (font, size, colour, hover sweep), the original English tagline and background colour, and the
# original BACK. Only the cards are replaced by the island's illustrated map with one pin per menu.
# Island → original page (from the original index.html): ABOUT ISLAND → about_island.html (orange),
# PIC&CLIP WAREHOUSE = island-work → work_town.html (yellow), AI&TECH CREATION BRIDGE = island-library → learning_bay.html (blue).
MAP_URL = 'https://ik.imagekit.io/ideas365logo/iDEAS365%20MAP%20pic/'
SUB_CSS = """
    <style>
        /* added: the island map with floating pins, under the page title (square boxes, no white frames) */
        .sub-wrap { width: 100%; max-width: 1000px; margin: 0 auto; }
        .sub-stage { position: relative; width: 100%; aspect-ratio: var(--ar); }
        .sub-map { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; box-shadow: 0 15px 35px rgba(0,0,0,0.2); }

        /* pins: polaroid picture on a stem; the tip touches the building */
        .pin { position: absolute; width: 8.5%; min-width: 46px; transform: translate(-50%, -100%); text-decoration: none; z-index: 5; }
        .pin-float { display: block; animation: pinFloat 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
        .pin:nth-of-type(2) .pin-float { animation-delay: -1.1s; }
        .pin:nth-of-type(3) .pin-float { animation-delay: -2.2s; }
        @keyframes pinFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .pin-img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 8px rgba(0,0,0,0.35)); transition: transform 0.25s; }
        .pin-stem { display: block; width: 3px; height: 18px; margin: 0 auto; background: #1A1A1A; }
        .pin-dot { display: block; width: 12px; height: 12px; margin: -2px auto 0; background: #CC0033; border: 2px solid #1A1A1A; border-radius: 50%; }
        .pin:hover .pin-float, .pin:focus-visible .pin-float { animation-play-state: paused; }
        .pin:hover .pin-img, .pin:focus-visible .pin-img { transform: scale(1.1); }
        /* pin name: small square black label, name only, pops up with the main map tooltip's bounce */
        .pin-pop { position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%) scale(0.3); transform-origin: bottom center;
            background: rgba(0,0,0,0.85); color: #fff; padding: 6px 10px; border-radius: 0; white-space: nowrap;
            font-family: 'Anton', 'Noto Sans Thai', sans-serif; font-size: 13px; font-weight: 400; letter-spacing: 0.5px; line-height: 1.3;
            opacity: 0; visibility: hidden; pointer-events: none; z-index: 10;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .pin:hover .pin-pop, .pin:focus-visible .pin-pop { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-10px) scale(1); }
        .sub-list { display: none; }

        /* arrival: cotton clouds over the map part left and right, the map comes into focus, then the pins pop in.
           Full version once per visit (sessionStorage); coming back to the page only fades in. */
        .sub-intro { position: absolute; inset: 0; overflow: hidden; z-index: 20; pointer-events: none; }
        .sub-haze { position: absolute; inset: 0; background: linear-gradient(180deg, #cfe9f8 0%, #eef8fe 100%); transition: opacity 1.1s ease 0.35s; }
        .cloud-pack { position: absolute; top: 0; bottom: 0; width: 60%; transition: transform 2s cubic-bezier(0.65, 0, 0.35, 1) 0.15s, opacity 0.9s ease 1.3s; }
        .cloud-pack.left { left: 0; } .cloud-pack.right { right: 0; }
        .cloud { position: absolute; display: block; height: auto; filter: drop-shadow(0 10px 14px rgba(70, 120, 170, 0.22)); animation: cloudBob 6s ease-in-out infinite; }
        .cloud:nth-child(2) { animation-delay: -2s; } .cloud:nth-child(3) { animation-delay: -4s; }
        @keyframes cloudBob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
        .sub-loading { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; gap: 8px; opacity: 0; transition: opacity 0.3s; }
        .sub-loading i { width: 11px; height: 11px; border-radius: 50%; animation: dotHop 0.9s ease-in-out infinite; }
        .sub-loading i:nth-child(1) { background: #4285F4; } .sub-loading i:nth-child(2) { background: #EA4335; animation-delay: 0.12s; }
        .sub-loading i:nth-child(3) { background: #F5B800; animation-delay: 0.24s; } .sub-loading i:nth-child(4) { background: #34A853; animation-delay: 0.36s; }
        @keyframes dotHop { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-9px); } }
        .sub-stage.is-loading .sub-loading { opacity: 1; }
        .sub-stage .sub-map { opacity: 0; filter: blur(14px) saturate(0.7); transform: scale(1.05);
            transition: opacity 1.3s ease 0.45s, filter 1.7s ease 0.45s, transform 2.2s cubic-bezier(0.2, 0.7, 0.2, 1) 0.3s; }
        .sub-stage .pin { opacity: 0; transform: translate(-50%, -100%) scale(0.6);
            transition: opacity 0.4s ease 1.6s, transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1.6s; }
        .sub-stage .pin:nth-of-type(2) { transition-delay: 1.75s; } .sub-stage .pin:nth-of-type(3) { transition-delay: 1.9s; }
        .sub-stage.is-ready .sub-map { opacity: 1; filter: none; transform: none; }
        .sub-stage.is-ready .pin { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        .sub-stage.is-ready .sub-haze { opacity: 0; }
        .sub-stage.is-ready .cloud-pack.left { transform: translateX(-118%); opacity: 0; }
        .sub-stage.is-ready .cloud-pack.right { transform: translateX(118%); opacity: 0; }
        .sub-stage.is-ready .sub-loading { opacity: 0; }
        .sub-stage.quick .sub-intro { display: none; }
        .sub-stage.quick .sub-map { filter: none; transform: none; transition: opacity 0.45s ease; }
        .sub-stage.quick .pin { transition: opacity 0.35s ease 0.2s, transform 0.45s ease 0.2s; }
        @media (prefers-reduced-motion: reduce) {
            .sub-intro { display: none; }
            .sub-stage .sub-map { filter: none; transform: none; transition: opacity 0.3s ease; }
            .sub-stage .pin, .sub-stage.is-ready .pin { transform: translate(-50%, -100%); transition: opacity 0.3s ease; }
            .pin-float, .cloud { animation: none; }
        }
        @media (max-width: 768px) {
            .pin-stem { height: 8px; } .pin-dot { width: 8px; height: 8px; }
            .pin-pop { display: none; }
            /* phones: a plain menu under the map (names only, like the pins) */
            .sub-list { display: block; margin: 18px 0 0; }
            .sub-list a { display: block; background: #1A1A1A; color: #fff; text-decoration: none; padding: 14px 16px; margin-bottom: 10px;
                font-family: 'Noto Sans Thai', sans-serif; font-size: 1rem; font-weight: 600; }
        }
    </style>
"""
# one puffy cotton cloud (own drawing: overlapping round puffs, each shaded white → pale blue at its edge)
CLOUD_SVG = ('<svg class="cloud" viewBox="0 0 240 150" style="{pos}" aria-hidden="true">'
             '<use href="#i365-cloud"/></svg>')
CLOUD_DEFS = """    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <defs>
            <radialGradient id="i365-puff" cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#ffffff"/>
                <stop offset="0.82" stop-color="#e3eefa"/><stop offset="1" stop-color="#b9d2ee"/>
            </radialGradient>
            <g id="i365-cloud" fill="url(#i365-puff)">
                <circle cx="70" cy="88" r="44"/><circle cx="118" cy="62" r="54"/><circle cx="168" cy="86" r="44"/>
                <circle cx="42" cy="108" r="30"/><circle cx="200" cy="108" r="30"/><circle cx="96" cy="112" r="34"/>
                <circle cx="144" cy="114" r="34"/><circle cx="120" cy="100" r="40"/>
            </g>
        </defs>
    </svg>
"""
# where the clouds sit inside each half (% of that half) — together they cover the whole picture
CLOUDS_LEFT = ['left:-18%;top:-14%;width:112%', 'left:4%;top:24%;width:118%', 'left:-22%;top:56%;width:120%']
CLOUDS_RIGHT = ['right:-16%;top:-10%;width:116%', 'right:6%;top:28%;width:114%', 'right:-20%;top:58%;width:118%']

SUB_JS = """
<script>
    /* added: arrival — clouds part once the map picture is ready (full version once per visit) */
    (function () {
        var st = document.querySelector('.sub-stage'), img = st && st.querySelector('.sub-map');
        if (!st || !img) return;
        var key = 'i365-intro:' + location.pathname, seen = false;
        try { seen = sessionStorage.getItem(key) === '1'; sessionStorage.setItem(key, '1'); } catch (e) {}
        if (seen) st.classList.add('quick');
        var started = false;
        function go() {
            if (started) return; started = true;
            st.classList.remove('is-loading');
            requestAnimationFrame(function () { requestAnimationFrame(function () { st.classList.add('is-ready'); }); });
            setTimeout(function () { var i = st.querySelector('.sub-intro'); if (i) i.remove(); }, 2800);
        }
        var slow = setTimeout(function () { if (!started) st.classList.add('is-loading'); }, 350);   // waiting dots only if the picture is slow
        if (img.complete && img.naturalWidth) go();
        else { img.addEventListener('load', go); img.addEventListener('error', go); setTimeout(go, 8000); }
        window.addEventListener('pageshow', function (e) { if (e.persisted) { st.classList.add('quick', 'is-ready'); clearTimeout(slow); } });
    })();
</script>
"""




def island(name, file, title_tag, h1, map_file, ratio, pins):
    pin_html, list_html = [], []
    for href, label, pin_img, (x, y) in pins:
        pin_html.append(f"""                <a href="{href}" class="pin" style="left:{x}%;top:{y}%" aria-label="{label}">
                    <span class="pin-pop">{label}</span>
                    <span class="pin-float"><img class="pin-img" src="islands/{pin_img}" alt=""><span class="pin-stem"></span><span class="pin-dot"></span></span>
                </a>""")
        list_html.append(f'                <a href="{href}">{label}</a>')
    clouds_l = ''.join(CLOUD_SVG.format(pos=p) for p in CLOUDS_LEFT)
    clouds_r = ''.join(CLOUD_SVG.format(pos=p) for p in CLOUDS_RIGHT)
    block = f"""        <!-- added: the island map (one pin per menu) -->
{CLOUD_DEFS}        <div class="sub-wrap">
            <div class="sub-stage" style="--ar:{ratio}">
                <img class="sub-map" src="{MAP_URL}{map_file}" alt="{title_tag}">
{chr(10).join(pin_html)}
                <div class="sub-intro" aria-hidden="true">
                    <div class="sub-haze"></div>
                    <div class="cloud-pack left">{clouds_l}</div>
                    <div class="cloud-pack right">{clouds_r}</div>
                    <div class="sub-loading"><i></i><i></i><i></i><i></i></div>
                </div>
            </div>
            <nav class="sub-list" aria-label="{title_tag}">
{chr(10).join(list_html)}
            </nav>
        </div>
"""
    t = src(file)
    tail = re.sub(r'\s*<script\b.*?</script>', '', t[t.index('</main>'):], flags=re.S)   # the page's own scripts (sheet loaders …) are not needed here
    html = page(None, file, title_tag, h1, None, [block], 'index.html', tail=tail, loader=False)   # sub=None: the original tagline
    html = html.replace('</head>', SUB_CSS + '</head>', 1).replace('</body>', SUB_JS + '</body>', 1)
    write(name, html)


#      page                  original page (colours, title, tagline)  title on the page                map picture          ratio
island('island_about.html', 'about_island.html', 'ABOUT ISLAND', 'ABOUT<br>ISLAND', 'sub-about-me.jpg', '2048 / 1152', [
    ('about_profile.html', 'โปรไฟล์', 'A1.jpg', (58, 54)),                        # church cluster
    ('about_experience.html', 'ประวัติการทำงาน', 'A2.jpg', (92, 30)),             # planetarium
    ('about_live.html', 'e-commerce Live Streaming', 'A3.jpg', (28, 26)),          # round parking tower
])
island('island_works.html', 'work_town.html', 'PIC&CLIP WAREHOUSE', 'PIC&amp;CLIP<br>WAREHOUSE', 'sub-pic-clip.jpg', '2048 / 1152', [
    ('works_clips.html', 'คลิปวิดีโอ', 'P1.jpg', (65, 50)),                        # Film Studio Warehouse
    ('works_photos.html', 'รูปผลงาน', 'P2.jpg', (50, 50)),                         # Dragon Theatre
])
island('island_learning.html', 'learning_bay.html', 'AI&TECH CREATION BRIDGE', 'AI&amp;TECH<br>CREATION BRIDGE', 'sub-ai.webp', '1920 / 1280', [
    ('learning_tools.html', 'รวมเครื่องมือ / ระบบ AI', 'ai1.jpg', (43, 36)),       # LAB 01
    ('learning_docs.html', 'เอกสาร · ความรู้', 'ai2.jpg', (27, 17)),               # observatory
    ('learning_design.html', 'งานออกแบบ', 'ai3.jpg', (75, 37)),                     # Data & Signal
])

IDX = src('index.html')
idx_css = IDX[IDX.index('<style>'):IDX.index('</style>') + len('</style>')]

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
