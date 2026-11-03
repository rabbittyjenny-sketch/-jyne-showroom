/* iDEAS365 · content from the back office (Supabase), with the original page content as fallback.
 *
 * <script src="i365-content.js" data-page="works_clips"></script>   (in <head>, before the page's own scripts)
 *
 * For every published section of this page (i365_sections.page_slug = data-page):
 *   - it has published items -> they replace the original content of its block  [data-i365="<section slug>"]
 *                               using the same markup / classes as the original page
 *   - it has none            -> if the section was ever shown from the back office (from_backoffice):
 *                               its card stays and says "COMING SOON · เร็วๆ นี้" (deleted items never come back)
 *                               otherwise nothing changes: the page keeps its own content (or its Google Sheet)
 * A section with no block on the page gets a new card in the page's own card style (data-card="content|section").
 * Lines marked [data-i365-soon="<slug>"] (COMING SOON lists) are removed when that section gets items.
 * window.I365.ready resolves when this is done (or after 4 s / on error) — the sheet loaders wait for it.
 */
(function () {
    var SB_URL = 'https://exybvjqjdqxonhesydhk.supabase.co/rest/v1/';
    var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eWJ2anFqZHF4b25oZXN5ZGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzI1MTQsImV4cCI6MjA5NDUwODUxNH0.GPOJYTdWw_YXQnJkd_2RGErHnEWDF7YBtu_MevdmCtE';
    var me = document.currentScript;
    var page = me && me.getAttribute('data-page');
    var cardStyle = (me && me.getAttribute('data-card')) || 'content';

    var finish, finished = false;
    var I365 = window.I365 = { page: page, filled: {}, sections: [], ready: new Promise(function (r) { finish = r; }) };
    function done() { if (!finished) { finished = true; finish(I365); } }
    if (!page) { done(); return; }
    var timer = setTimeout(done, 4000);           // DB slow / blocked -> the page carries on with its own content

    var q = 'i365_sections?select=slug,name_th,name_en,description_th,display_style,sort_order,from_backoffice,' +
        'type:i365_item_types!i365_sections_item_type_id_fkey(slug),' +
        'items:i365_items!i365_items_section_id_fkey(id,title_th,title_en,summary_th,summary_en,cover_image,data,sort_order)' +
        '&page_slug=eq.' + encodeURIComponent(page) + '&is_published=eq.true&deleted_at=is.null' +
        '&items.is_published=eq.true&order=sort_order.asc&items.order=sort_order.asc';
    var data = fetch(SB_URL + q, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    var domReady = new Promise(function (r) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', r); else r();
    });

    Promise.all([data, domReady]).then(function (res) {
        if (finished) return;                     // too late: the original content is already showing
        I365.sections = res[0] || [];
        I365.sections.forEach(function (s) {
            try {
                if (s.items && s.items.length) { if (render(s)) I365.filled[s.slug] = true; }
                else if (s.from_backoffice && renderSoon(s)) I365.filled[s.slug] = true;   // sheet loaders skip it too
            } catch (e) { console.warn('[i365]', s.slug, e); }
        });
    }).catch(function (e) { console.warn('[i365] using the page content', e); })
      .then(function () { clearTimeout(timer); done(); });

    /* ── helpers ─────────────────────────────────────────────── */
    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function d(it, k) { return (it.data && it.data[k]) || ''; }
    function ytId(u) {
        var m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
        return m ? m[1] : '';
    }
    var YT_PLAY = '<div class="yt-play"><svg viewBox="0 0 68 48"><path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.8 0 34 0 34 0S12.2 0 7.4 1.6c-2.9.8-5.1 3.1-5.9 6C0 12.5 0 24 0 24s0 11.5 1.5 16.3c.8 2.9 3 5.2 5.9 6C12.2 48 34 48 34 48s21.8 0 26.6-1.6c2.9-.8 5.1-3.1 5.9-6C68 35.5 68 24 68 24S68 12.5 66.5 7.7z" fill="#f00" /><path d="M45 24 27 14v20" fill="#fff" /></svg></div>';

    /* back-office text fields written as "English | ไทย" (one entry per line) */
    function parts(line) { return String(line || '').split('|').map(function (x) { return x.trim(); }); }
    function lines(v) { return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
    function th(v) { return v ? '<span class="svc-th">' + esc(v) + '</span>' : ''; }

    function pointHtml(it, i, style) {
        var en = d(it, 'text_en'), tt = d(it, 'text_th');
        if (style === 'list') return '<li>' + esc(it.title_th) + th(en) + th(tt) + '</li>';
        var no = style === 'timeline' ? '<div class="tl-year">' + (i < 9 ? '0' : '') + (i + 1) + '</div>' : '';
        return '<div class="tl-item">' + no + '<div class="tl-role">' + esc(it.title_th) + '</div>' +
            (en ? '<div class="tl-desc">' + esc(en) + '</div>' : '') + (tt ? '<div class="tl-desc">' + esc(tt) + '</div>' : '') + '</div>';
    }
    function serviceHtml(it) {
        var pts = lines(d(it, 'points')).map(function (l) { var p = parts(l); return '<li>' + esc(p[0]) + th(p[1]) + '</li>'; }).join('');
        var dt = parts(d(it, 'detail_title')), ft = parts(d(it, 'framework_title'));
        var body = lines(d(it, 'detail_body')).map(function (l) { var p = parts(l); return '<p class="col-desc">' + esc(p[0]) + th(p[1]) + '</p>'; }).join('');
        var fw = lines(d(it, 'framework_points')).map(function (l) {
            var p = parts(l); return '<li><strong>' + esc(p[0]) + ':</strong> ' + esc(p[1] || '') + th(p[2]) + '</li>'; }).join('');
        return '<div class="content-card single"><div>' +
            (d(it, 'label') ? '<div class="tl-year">' + esc(d(it, 'label')) + '</div>' : '') +
            '<h2 class="col-title">' + esc(it.title_en || it.title_th) + (it.title_en ? '<span class="svc-th" style="font-size:1rem">' + esc(it.title_th) + '</span>' : '') + '</h2>' +
            (it.summary_en || it.summary_th ? '<p class="col-desc">' + esc(it.summary_en || '') + th(it.summary_th) + '</p>' : '') +
            (pts ? '<ul class="hl">' + pts + '</ul>' : '') +
            (dt[0] ? '<h3 class="svc-h3">' + esc(dt[0]) + th(dt[1]) + '</h3>' : '') + body +
            (ft[0] ? '<h3 class="svc-h3">' + esc(ft[0]) + th(ft[1]) + '</h3>' : '') + (fw ? '<ul class="hl">' + fw + '</ul>' : '') +
            '<a class="svc-btn" href="' + esc(d(it, 'cta_url') || 'contact_port.html') + '">' + esc(d(it, 'cta_label') || 'ติดต่อ') + '</a>' +
            '</div></div>';
    }

    var css = false;
    function addCss() {                            // only for blocks the original pages have no class for
        if (css) return; css = true;
        var st = document.createElement('style');
        st.textContent = '.i365-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-top:12px}' +
            '.i365-grid a,.i365-grid div{display:block;text-decoration:none;color:inherit}' +
            '.i365-grid img{width:100%;display:block;border-radius:0}' +
            '.i365-grid span{display:block;font-size:.85rem;margin-top:6px}' +
            '.i365-pic a{display:inline-block !important;font-size:.85rem;margin-top:6px;text-decoration:underline}' +
            '.i365-links a{display:inline-block;margin:6px 8px 0 0}' +
            ':where(.svc-th){display:block;font-size:.8rem;color:#888;font-weight:300}' +
            ':where(.svc-h3){font-size:1.2rem;margin:24px 0 6px}:where(.svc-grid){display:grid;grid-template-columns:1fr 1fr;gap:0 32px}' +
            ':where(.svc-btn){display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:0;margin-top:22px}' +
            '@media(max-width:768px){:where(.svc-grid){grid-template-columns:1fr}}' +
            '.i365-soon-msg{grid-column:1/-1;list-style:none;margin:8px 0 0;padding:28px 0;text-align:center;letter-spacing:2px;color:#888;font-size:.95rem}' +
            '.i365-noimg{aspect-ratio:16/9;background:#1A1A1A;color:#fff;display:flex !important;align-items:center;justify-content:center;font-size:.9rem;text-decoration:none}';
        document.head.appendChild(st);
    }

    /* ── item → markup (same classes as the original pages) ─────── */
    function clipHtml(it, i) {
        var url = d(it, 'video_url'), id = ytId(url);
        var pic = it.cover_image || (id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : '');
        if (!pic) addCss();
        var img = pic ? '<img src="' + esc(pic) + '" loading="lazy" alt="' + esc(it.title_th) + '">'
            : '<img alt="" style="visibility:hidden"><span class="i365-noimg" style="position:absolute;inset:0">▶ ' + esc(it.title_th || d(it, 'platform')) + '</span>';
        return '<a href="' + esc(url) + '" target="_blank" class="video-wrap">' + img + (id || pic ? YT_PLAY : '') + '</a>';
    }
    function imgHtml(it, key) {
        var src = d(it, key) || it.cover_image;
        return src ? '<img src="' + esc(src) + '" alt="' + esc(d(it, 'caption_th') || it.title_th) + '">' : '';
    }
    function toolData(it) {                        // the shape buildAICard() reads from the Google Sheet
        return {
            title: it.title_en || it.title_th, titleTh: it.title_en ? it.title_th : '',
            descriptionTh: it.summary_th || '', previewImage: it.cover_image || '', logo: d(it, 'logo'),
            link: d(it, 'url'), status: d(it, 'status') === 'live' ? '' : d(it, 'status'), category: d(it, 'category') || 'ai'
        };
    }
    function resourceData(it) {                    // the shape renderResources() reads from the Google Sheet
        return { id: it.id, name: it.title_th, catagory: d(it, 'badge') || 'Resource', url: d(it, 'file_url'), update: d(it, 'updated') };
    }
    function linkTile(it, url, btn) {
        addCss();
        var pic = it.cover_image;
        var inner = (pic ? '<img src="' + esc(pic) + '" loading="lazy" alt="">' : '<div class="i365-noimg">' + esc(it.title_th) + '</div>') +
            '<span>' + esc(it.title_th) + '</span>';
        return url ? '<a href="' + esc(url) + '" target="_blank">' + inner + '</a>' : '<div>' + inner + '</div>';
    }

    /* fills `el` with the section's items; returns false when this item type is not shown by the static pages */
    function fill(el, s) {
        var t = s.type && s.type.slug, items = s.items;
        if (t === 'clip') {
            el.innerHTML = items.map(clipHtml).join('');
        } else if (t === 'photo' || t === 'certificate') {
            el.innerHTML = items.map(function (it) { return imgHtml(it, t === 'photo' ? 'image' : 'certificate_image'); }).join('');
        } else if (t === 'tool') {
            if (typeof window.buildAICard === 'function') el.innerHTML = items.map(toolData).map(window.buildAICard).join('');
            else { el.classList.add('i365-grid'); el.innerHTML = items.map(function (it) { return linkTile(it, d(it, 'url')); }).join(''); }
        } else if (t === 'document') {
            if (el.id === 'res-grid' && typeof window.renderResources === 'function') window.renderResources(items.map(resourceData));
            else { addCss(); el.classList.add('i365-links'); el.innerHTML = items.map(function (it) {
                return '<a class="res-dl-btn" style="border-radius:0" href="' + esc(d(it, 'file_url')) + '" target="_blank">' + esc(it.title_th) + ' ↓</a>'; }).join(''); }
        } else if (t === 'design_work') {          // artwork: pictures only (click = viewer, i365-ui.js); a link shows only when one is attached
            var pics = items.filter(function (it) { return it.cover_image; });
            if (!pics.length) return renderSoon(s);
            addCss(); el.classList.add('i365-grid');
            el.innerHTML = pics.map(function (it) {
                var url = d(it, 'url') || d(it, 'file_url');
                return '<div class="i365-pic"' + (url ? ' data-link="' + esc(url) + '"' : '') + '>' +
                    '<img src="' + esc(it.cover_image) + '" loading="lazy" alt="' + esc(it.title_th) + '">' +
                    (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(it.title_th || url) + ' ↗</a>' : '') + '</div>';
            }).join('');
        } else if (t === 'point') {
            addCss();
            el.innerHTML = items.map(function (it, i) { return pointHtml(it, i, s.display_style); }).join('');
        } else if (t === 'service') {
            addCss();
            el.innerHTML = items.map(serviceHtml).join('');
            el.querySelectorAll('.content-card').forEach(reveal);
        } else if (t === 'resume') {
            var f = d(items[0], 'file_url'), img = el.querySelector('img'), a = el.querySelector('a[download]');
            if (!f) return false;
            if (img) img.src = f;
            if (a) a.href = f;
        } else {
            return false;                          // text / timeline / case study: the pages keep the text in the code
        }
        return true;
    }

    function newCard(s) {
        var t = s.type && s.type.slug;
        if (!/^(clip|photo|certificate|tool|document|design_work|point|service)$/.test(t)) return null;
        var gridCls = t === 'clip' ? 'video-grid' : (t === 'photo' || t === 'certificate')
            ? (s.display_style === 'gallery_wide' ? 'proof-grid-result' : 'proof-grid-work') : t === 'tool' ? 'ai-grid' : '';
        var title = esc(s.name_th), sub = s.description_th ? esc(s.description_th) : '';
        if (t === 'service') {                     // service items are cards themselves
            var box = document.createElement('div'); box.style.display = 'contents';
            var at = document.querySelector('[data-i365-soon-card]'), m = document.querySelector('main');
            if (at) at.parentNode.insertBefore(box, at); else if (m) m.appendChild(box); else return null;
            return box;
        }
        if (t === 'point') gridCls = s.display_style === 'cards' ? 'svc-grid' : '';
        var card = document.createElement('div');
        if (cardStyle === 'section') {
            card.className = 'section-card';
            card.innerHTML = '<div class="section-head"><div class="section-title">' + title + '</div>' +
                (sub ? '<div class="section-sub">' + sub + '</div>' : '') + '</div><div class="' + gridCls + '"></div>';
        } else {
            card.className = 'content-card single';
            card.innerHTML = '<h2 class="col-title">' + title + '</h2>' +
                (sub ? '<p class="col-desc" style="margin-bottom:16px">' + sub + '</p>' : '') +
                (t === 'point' && s.display_style === 'list' ? '<ul class="hl"></ul>' : '<div class="' + gridCls + '"></div>');
        }
        var before = document.querySelector('[data-i365-soon-card]');
        var main = document.querySelector('main');
        if (before) before.parentNode.insertBefore(card, before);
        else if (main) main.appendChild(card);
        else return null;
        reveal(card);
        return card.lastElementChild;
    }

    /* the pages fade cards in with .in-view when they scroll into view; a card added later needs the same */
    function reveal(card) {
        if (!('IntersectionObserver' in window)) { card.classList.add('in-view'); return; }
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
        }, { threshold: 0.08 });
        io.observe(card);
    }

    /* a back-office section with nothing published: keep its card, say COMING SOON (never the old code content) */
    function renderSoon(s) {
        var t = s.type && s.type.slug;             // only types the pages render (text / timeline / case study stay in the code)
        if (!/^(clip|photo|certificate|tool|document|design_work|point|service|resume)$/.test(t)) return false;
        var listed = document.querySelector('[data-i365-soon="' + s.slug + '"]');
        var el = document.querySelector('[data-i365="' + s.slug + '"]');
        if (!el && listed) return false;           // already listed in the page's COMING SOON card
        if (!el) el = newCard(s);
        if (!el) return false;
        addCss();
        if (t === 'resume') {                      // the block is the whole résumé card: keep its heading
            el.querySelectorAll('img, a[download]').forEach(function (n) { n.style.display = 'none'; });
            if (!el.querySelector('.i365-soon-msg')) el.insertAdjacentHTML('beforeend', '<p class="i365-soon-msg">COMING SOON · เร็วๆ นี้</p>');
            el.setAttribute('data-i365-filled', '1');
            return true;
        }
        var tag = el.tagName === 'UL' || el.tagName === 'OL' ? 'li' : 'p';
        el.innerHTML = '<' + tag + ' class="i365-soon-msg">COMING SOON · เร็วๆ นี้</' + tag + '>';
        el.hidden = false; if (el.style.display === 'none') el.style.display = '';
        el.setAttribute('data-i365-filled', '1'); // the Google Sheet loaders skip blocks marked filled
        return true;
    }

    function render(s) {
        var el = document.querySelector('[data-i365="' + s.slug + '"]') || newCard(s);
        if (!el || !fill(el, s)) return false;
        el.hidden = false; if (el.style.display === 'none') el.style.display = '';
        el.setAttribute('data-i365-filled', '1');
        document.querySelectorAll('[data-i365-soon="' + s.slug + '"]').forEach(function (n) { n.parentNode.removeChild(n); });
        document.querySelectorAll('[data-i365-soon-card]').forEach(function (c) {
            if (!c.querySelector('[data-i365-soon]')) c.style.display = 'none';
        });
        return true;
    }
})();
