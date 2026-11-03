/* iDEAS365 · page tools for the menu pages (owner's request, 4 Nov 2026)
 *   1. Pages of items: a grid shows a fixed number of pictures / clips / cards; the rest go to page 2, 3 …
 *   2. Picture viewer: clicking a picture opens it in a window; clicking another picture shows that one
 *   3. Section menu on the left, outside the cards: jump straight to a section (wide screens)
 * Colours come from the page itself (--accent of the page, the page title colour), so every island keeps its own set.
 * Works on the page's own content and on what i365-content.js / the Google Sheet loaders put in later.
 */
(function () {
    var PER_PAGE = [                                   // grid → items per page (two rows of the original columns)
        ['.proof-grid-work', 8], ['.proof-grid-result', 6], ['.proof-grid', 8], ['.video-grid', 6],
        ['.ai-grid', 6], ['.proj-grid', 6], ['.res-grid', 6], ['.i365-grid', 8]
    ];
    var VIEW = '.proof-grid-work img, .proof-grid-result img, .proof-grid img, .i365-grid .i365-pic img';

    function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
    function accent() {
        var a = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1A1A1A';
        var m = a.match(/^#?([0-9a-f]{6})$/i), on = '#ffffff';
        if (m) { var n = parseInt(m[1], 16), l = (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; if (l > 0.6) on = '#1A1A1A'; }
        return { a: a, on: on };
    }

    function css() {
        var c = accent(), title = document.querySelector('.page-title');
        var navColor = title ? getComputedStyle(title).color : '#fff';
        if (/rgba\(0, 0, 0, 0\)/.test(navColor)) navColor = getComputedStyle(document.body).color;   // titles drawn with a text sweep
        var st = document.createElement('style');
        st.textContent =
            '.i365-pager{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:18px;grid-column:1/-1}' +
            '.i365-pager button{min-width:34px;height:34px;padding:0 9px;border:1.5px solid currentColor;border-radius:0;background:transparent;' +
            'color:inherit;font:700 .8rem "Noto Sans Thai",sans-serif;cursor:pointer;opacity:.75}' +
            '.i365-pager button.on{background:' + c.a + ';border-color:' + c.a + ';color:' + c.on + ';opacity:1;cursor:default}' +
            '.i365-pager button:disabled{opacity:.25;cursor:default}' +
            '.i365-paged>[data-i365-off]{display:none !important}' +
            VIEW + '{cursor:zoom-in}' +
            '.i365-viewer{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:4vh 4vw}' +
            '.i365-viewer[hidden]{display:none}' +
            '.i365-viewer img{max-width:92vw;max-height:88vh;width:auto;height:auto;object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,.5);cursor:default}' +
            '.i365-viewer button{position:absolute;top:16px;right:20px;width:44px;height:44px;border:none;background:transparent;color:#fff;font-size:2rem;line-height:1;cursor:pointer}' +
            '.i365-viewer a{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;font:700 .85rem "Noto Sans Thai",sans-serif;text-decoration:underline}' +
            '.i365-secnav{position:fixed;left:24px;top:50%;transform:translateY(-50%);z-index:150;display:none;flex-direction:column;gap:12px;' +
            'width:calc((100vw - 1100px) / 2 - 40px);max-width:200px;color:' + navColor + '}' +
            '.i365-secnav a{font-family:"Anton","Noto Sans Thai",sans-serif;font-size:.85rem;letter-spacing:.5px;line-height:1.25;text-transform:uppercase;' +
            'color:inherit;text-decoration:none;opacity:.55;padding-left:10px;border-left:2px solid transparent}' +
            '.i365-secnav a.on{opacity:1;border-left-color:currentColor}' +
            '@media(min-width:1330px){.i365-secnav.has{display:flex}}';
        document.head.appendChild(st);
    }

    /* ── 1. pages of items ───────────────────────────────────── */
    function items(grid) {
        return Array.prototype.filter.call(grid.children, function (el) {
            return !el.classList.contains('i365-soon-msg') && !el.classList.contains('loading-msg') &&
                !el.classList.contains('res-loading') && !el.classList.contains('i365-pager');
        });
    }
    function paginate(grid, size) {
        var list = items(grid), pages = Math.ceil(list.length / size);
        var pager = grid.nextElementSibling && grid.nextElementSibling.classList.contains('i365-pager') ? grid.nextElementSibling : null;
        if (pages <= 1) {
            list.forEach(function (el) { el.removeAttribute('data-i365-off'); });
            grid.classList.remove('i365-paged'); if (pager) pager.remove(); return;
        }
        var at = Math.min(+(grid.getAttribute('data-i365-page') || 1), pages);
        grid.classList.add('i365-paged');
        list.forEach(function (el, i) {
            if (Math.floor(i / size) + 1 === at) el.removeAttribute('data-i365-off'); else el.setAttribute('data-i365-off', '');
        });
        if (!pager) { pager = document.createElement('div'); pager.className = 'i365-pager'; grid.parentNode.insertBefore(pager, grid.nextSibling); }
        var h = '<button type="button" data-go="' + (at - 1) + '"' + (at === 1 ? ' disabled' : '') + ' aria-label="ก่อนหน้า">‹</button>';
        for (var p = 1; p <= pages; p++) h += '<button type="button" data-go="' + p + '"' + (p === at ? ' class="on" aria-current="page"' : '') + '>' + p + '</button>';
        h += '<button type="button" data-go="' + (at + 1) + '"' + (at === pages ? ' disabled' : '') + ' aria-label="ถัดไป">›</button>';
        pager.innerHTML = h;
        pager.onclick = function (e) {
            var b = e.target.closest('button'); if (!b || b.disabled || b.classList.contains('on')) return;
            grid.setAttribute('data-i365-page', b.getAttribute('data-go'));
            paginate(grid, size);
            var card = grid.closest('.content-card, .section-card') || grid;
            if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    }
    function watch(grid, size) {
        if (grid.__i365) return; grid.__i365 = true;
        paginate(grid, size);
        var busy = false;
        new MutationObserver(function () {
            if (busy) return; busy = true;
            requestAnimationFrame(function () { grid.setAttribute('data-i365-page', '1'); paginate(grid, size); busy = false; });
        }).observe(grid, { childList: true });
    }
    function allGrids() {
        PER_PAGE.forEach(function (g) {
            document.querySelectorAll('main ' + g[0] + ', .main-content ' + g[0]).forEach(function (el) { watch(el, g[1]); });
        });
    }

    /* ── 2. picture viewer ───────────────────────────────────── */
    var viewer;
    function open(src, alt, link) {
        if (!viewer) {
            viewer = document.createElement('div'); viewer.className = 'i365-viewer'; viewer.hidden = true;
            viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true');
            viewer.innerHTML = '<button type="button" aria-label="ปิด">×</button><img alt=""><a target="_blank" rel="noopener" hidden></a>';
            viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.tagName === 'BUTTON') close(); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
            document.body.appendChild(viewer);
        }
        var img = viewer.querySelector('img'), a = viewer.querySelector('a');
        img.src = src; img.alt = alt || '';
        if (link) { a.href = link; a.textContent = (alt || link) + ' ↗'; a.hidden = false; } else a.hidden = true;   // the item's own name
        viewer.hidden = false; document.body.style.overflow = 'hidden';
    }
    function close() { if (viewer && !viewer.hidden) { viewer.hidden = true; document.body.style.overflow = ''; } }
    document.addEventListener('click', function (e) {
        var img = e.target.closest && e.target.closest(VIEW);
        if (!img || (viewer && viewer.contains(img))) return;
        e.preventDefault();
        var tile = img.closest('[data-link]');
        open(img.currentSrc || img.src, img.alt, tile && tile.getAttribute('data-link'));
    });

    /* ── 3. section menu on the left ─────────────────────────── */
    function sectionNav() {
        var cards = Array.prototype.filter.call(document.querySelectorAll('main .content-card, main .section-card, .main-content .section-card'),
            function (c) { return getComputedStyle(c).display !== 'none' && c.querySelector('.col-title, .section-title'); });
        var nav = document.querySelector('.i365-secnav');
        if (!nav) { nav = document.createElement('nav'); nav.className = 'i365-secnav'; nav.setAttribute('aria-label', 'หัวข้อในหน้านี้'); document.body.appendChild(nav); }
        nav.classList.toggle('has', cards.length > 1);
        nav.innerHTML = '';
        cards.forEach(function (c, i) {
            var t = c.querySelector('.col-title, .section-title');
            var shown = Array.prototype.filter.call(t.querySelectorAll('[data-lang]'), function (x) { return getComputedStyle(x).display !== 'none'; });
            var label = (shown[0] || t).textContent.replace(/\s+/g, ' ').trim();
            if (!c.id) c.id = 'sec-' + (i + 1);
            var a = document.createElement('a'); a.href = '#' + c.id; a.textContent = label;
            a.onclick = function (e) { e.preventDefault(); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
            nav.appendChild(a);
            c.__navLink = a;
        });
        if (!('IntersectionObserver' in window)) return;
        if (nav.__io) nav.__io.disconnect();
        nav.__io = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (e.isIntersecting && e.target.__navLink) {
                    nav.querySelectorAll('a').forEach(function (x) { x.classList.toggle('on', x === e.target.__navLink); });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        cards.forEach(function (c) { nav.__io.observe(c); });
    }

    ready(function () {
        css(); allGrids(); sectionNav();
        var after = window.I365 && window.I365.ready ? window.I365.ready : Promise.resolve();
        after.then(function () { allGrids(); sectionNav(); setTimeout(function () { allGrids(); sectionNav(); }, 1500); });
        document.addEventListener('click', function (e) {          // EN / TH buttons change the section names
            if (e.target.closest && e.target.closest('#btn-en, #btn-th')) setTimeout(sectionNav, 0);
        });
    });
})();
