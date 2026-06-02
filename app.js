// app.js — BYRO marketplace UI. Vanilla JS, no React.
// Builds the page by appending DOM nodes from factory functions.

(function () {
  const { categories, robots, stats, trustPoints, fmtMoney, fmtMonthly, findRobot, findCategory, relatedRobots, reviewsFor } = window.BYRO_DATA;

  // ============================================================
  //                      CART STORE
  //   Persisted to localStorage. Dispatches 'byro:cart' on change.
  // ============================================================
  const CART_KEY = 'byro.cart.v1';

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('byro:cart'));
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    const items = loadCart();
    const existing = items.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else items.push({ id: id, qty: qty });
    saveCart(items);
  }
  function setQty(id, qty) {
    const items = loadCart().map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i);
    saveCart(items);
  }
  function removeFromCart(id) {
    saveCart(loadCart().filter(i => i.id !== id));
  }
  function clearCart() { saveCart([]); }
  function cartCount() { return loadCart().reduce((n, i) => n + i.qty, 0); }
  function cartLines() {
    return loadCart()
      .map(i => ({ ...i, robot: findRobot(i.id) }))
      .filter(x => x.robot && x.robot.price != null);
  }
  function cartSubtotal() {
    return cartLines().reduce((s, i) => s + (i.robot.price || 0) * i.qty, 0);
  }

  // Tiny toast notification on cart add
  function showCartToast(robot) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '';
    const dot = document.createElement('span');
    dot.className = 'cart-toast-dot';
    const msg = document.createElement('span');
    msg.textContent = 'Added ' + robot.brand + ' ' + robot.name + ' to cart';
    const cta = document.createElement('a');
    cta.href = '#/cart';
    cta.textContent = 'View cart →';
    cta.className = 'cart-toast-cta';
    toast.appendChild(dot);
    toast.appendChild(msg);
    toast.appendChild(cta);
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // -------------------- tiny DOM helper --------------------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === 'dataset') {
          for (const d in v) el.dataset[d] = v[d];
        } else if (k === 'style' && typeof v === 'object') {
          Object.assign(el.style, v);
        } else {
          el.setAttribute(k, v);
        }
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return el;
  }

  function svg(inner, attrs) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (attrs) for (const k in attrs) s.setAttribute(k, attrs[k]);
    s.innerHTML = inner;
    return s;
  }

  const arrowSvg = () => svg(
    '<path d="M5 11 L11 5 M6 5 L11 5 L11 10"/>',
    { class: 'arrow', viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6' }
  );

  // -------------------- Wordmark --------------------
  // Brand-supplied PNG logo. Size controls rendered height; width scales from
  // the image's intrinsic 1680x900 aspect ratio.
  function Wordmark(size = 20) {
    const img = document.createElement('img');
    img.className = 'wm-img';
    img.src = 'assets/byro-logo.png';
    img.alt = 'BYRO';
    img.style.height = size + 'px';
    return img;
  }

  // -------------------- Header --------------------
  function cartIconSvg() {
    return svg(
      '<path d="M3 5 L5 5 L7 14 L17 14 L19 7 L7 7" /><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>',
      { viewBox: '0 0 22 22', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'cart-icon' }
    );
  }

  function Header() {
    const browseBtn = h('a', {
      class: 'btn btn-ink btn-arrow',
      href: '#/browse'
    }, 'Browse robots', arrowSvg());

    const cartBadge = h('span', { class: 'cart-badge' }, '0');
    const cartLink = h('a', {
      class: 'cart-btn',
      href: '#/cart',
      'aria-label': 'Cart'
    }, cartIconSvg(), cartBadge);

    function updateCartBadge() {
      const count = cartCount();
      cartBadge.textContent = String(count);
      cartLink.classList.toggle('has-items', count > 0);
    }
    updateCartBadge();
    window.addEventListener('byro:cart', updateCartBadge);

    const header = h('header', { class: 'bnav' },
      h('div', { class: 'wrap bnav-inner' },
        h('div', { class: 'bnav-left' },
          h('a', { href: '#/', 'aria-label': 'BYRO home' }, Wordmark(20)),
          h('nav', null,
            h('a', { href: '#/browse' }, 'Browse'),
            h('a', { href: '#/featured' }, 'Featured'),
            h('a', { href: '#/how-it-works', class: 'hide-md' }, 'How it works'),
            h('a', { href: '#/sell', class: 'hide-md' }, 'Sell on BYRO')
          )
        ),
        h('div', { class: 'bnav-right' },
          h('a', { class: 'btn sign-in', href: '#/account' }, 'Sign in'),
          cartLink,
          browseBtn
        )
      )
    );

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return header;
  }


  function categoryMark(catId) {
    // Categories represent a whole shelf, not one brand — use the neutral tile.
    return imagePlaceholder();
  }

  // -------------------- Neutral image placeholder (categories) --------------------
  function imagePlaceholder() {
    return svg(`
      <rect width="400" height="280" fill="#F4F4EE"/>
      <g transform="translate(180, 110)" stroke="#8B8B85" stroke-width="1.4" fill="none" stroke-linejoin="round" stroke-linecap="round">
        <rect x="0" y="0" width="40" height="32" rx="3"/>
        <circle cx="13" cy="11" r="3" fill="#8B8B85" stroke="none"/>
        <path d="M 4 28 L 14 18 L 22 24 L 30 14 L 36 20 L 36 29 L 4 29 Z" fill="#8B8B85" stroke="none" opacity="0.45"/>
      </g>
      <text x="200" y="170"
        font-family="Geist Mono, ui-monospace, monospace"
        font-size="11"
        letter-spacing="2"
        text-anchor="middle"
        fill="#8B8B85">IMAGE COMING SOON</text>
    `, { viewBox: '0 0 400 280', class: 'placeholder-tile', xmlns: 'http://www.w3.org/2000/svg', preserveAspectRatio: 'xMidYMid slice' });
  }

  // -------------------- Per-robot branded placeholder --------------------
  // Each robot gets a unique tile: brand-tinted bg, big brand initial, brand + model name.
  // Used on Featured cards, related product cards, and the product page hero.
  function brandInitials(brand) {
    const overrides = {
      'iRobot': 'iR',
      '1X': '1X',
      'Digital Dream Labs': 'DDL',
      'Energize Lab': 'EL',
      'KEYi': 'KE'
    };
    if (overrides[brand]) return overrides[brand];
    const words = brand.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function brandHue(brand) {
    let h = 0;
    for (const c of brand) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 360;
  }

  function escapeText(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function robotPlaceholder(robot, opts) {
    opts = opts || {};

    // If the robot has a real photo, render it. Falls back to the typographic
    // tile on load error so a missing file doesn't leave an empty box.
    if (robot && robot.photo) {
      const wrap = h('div', { class: 'photo-img-wrap' });
      const img = document.createElement('img');
      img.className = 'photo-img';
      img.alt = robot.brand + ' ' + robot.name;
      img.loading = 'lazy';
      img.src = robot.photo;
      img.onerror = () => {
        wrap.innerHTML = '';
        // Re-render with photo blanked so we don't loop on error
        wrap.appendChild(robotPlaceholder({ ...robot, photo: null }, opts));
      };
      wrap.appendChild(img);
      return wrap;
    }

    const big = opts.size === 'hero';
    const hue = brandHue(robot.brand);
    const bgA = `hsl(${hue}, 16%, 96%)`;
    const bgB = `hsl(${hue}, 22%, 88%)`;
    const accent = `hsl(${hue}, 28%, 24%)`;
    const muted  = `hsl(${hue}, 14%, 48%)`;
    const initials = brandInitials(robot.brand);
    const initialSize = big ? 132 : 92;
    const skuLabel = `BYRO · ${robot.id.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 18)}`;
    const tileId = 'pl-' + robot.id;

    return svg(`
      <defs>
        <linearGradient id="${tileId}-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgA}"/>
          <stop offset="100%" stop-color="${bgB}"/>
        </linearGradient>
        <pattern id="${tileId}-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${accent}" stroke-width="0.4" opacity="0.08"/>
        </pattern>
      </defs>
      <rect width="400" height="280" fill="url(#${tileId}-bg)"/>
      <rect width="400" height="280" fill="url(#${tileId}-grid)"/>
      <g stroke="${accent}" stroke-width="0.6" fill="none" opacity="0.18">
        <line x1="20" y1="20" x2="40" y2="20"/>
        <line x1="20" y1="20" x2="20" y2="40"/>
        <line x1="380" y1="20" x2="360" y2="20"/>
        <line x1="380" y1="20" x2="380" y2="40"/>
        <line x1="20" y1="260" x2="40" y2="260"/>
        <line x1="20" y1="260" x2="20" y2="240"/>
        <line x1="380" y1="260" x2="360" y2="260"/>
        <line x1="380" y1="260" x2="380" y2="240"/>
      </g>
      <text x="28" y="36"
        font-family="Geist Mono, ui-monospace, monospace"
        font-size="10"
        letter-spacing="1.5"
        fill="${muted}">${skuLabel}</text>
      <text x="372" y="36"
        font-family="Geist Mono, ui-monospace, monospace"
        font-size="10"
        letter-spacing="1.5"
        text-anchor="end"
        fill="${muted}">IMG · PENDING</text>
      <text x="200" y="${big ? 165 : 152}"
        font-family="Geist, system-ui, sans-serif"
        font-size="${initialSize}"
        font-weight="300"
        letter-spacing="-0.05em"
        text-anchor="middle"
        fill="${accent}">${initials}</text>
      <line x1="60" y1="${big ? 200 : 184}" x2="340" y2="${big ? 200 : 184}" stroke="${accent}" stroke-width="0.6" opacity="0.25"/>
      <text x="200" y="${big ? 224 : 208}"
        font-family="Geist, system-ui, sans-serif"
        font-size="15"
        font-weight="500"
        letter-spacing="-0.01em"
        text-anchor="middle"
        fill="${accent}">${escapeText(robot.brand)}</text>
      <text x="200" y="${big ? 246 : 228}"
        font-family="Geist Mono, ui-monospace, monospace"
        font-size="10"
        letter-spacing="1.5"
        text-transform="uppercase"
        text-anchor="middle"
        fill="${muted}">${escapeText(robot.name.toUpperCase())}</text>
      <text x="200" y="260"
        font-family="Geist Mono, ui-monospace, monospace"
        font-size="9"
        letter-spacing="2"
        text-anchor="middle"
        fill="${muted}"
        opacity="0.7">PRODUCT PHOTO COMING SOON</text>
    `, { viewBox: '0 0 400 280', class: 'placeholder-tile', xmlns: 'http://www.w3.org/2000/svg', preserveAspectRatio: 'xMidYMid slice' });
  }

  // -------------------- Hero --------------------
  function Hero() {
    const metaStrip = h('div', { class: 'hero-meta-strip' },
      h('span', { class: 'notice' },
        h('span', { class: 'pill' }, 'NEW'),
        h('span', null, 'BYRO Home is live. Browse 1,427 robots ready to ship.'),
        h('span', { class: 'arrow' }, '→')
      ),
      h('span', { class: 'live' }, 'LIVE · 84 MAKERS · 1,427 LISTINGS')
    );

    const canvasHost = h('div', { class: 'hero-canvas-host', id: 'hero-canvas' });

    const heroCard = h('div', { class: 'hero-card' },
      h('div', { class: 'spotlight' }),
      h('div', { class: 'hero-card-left' },
        h('div', { class: 'eyebrow' },
          h('span', { class: 'dot' }),
          h('span', null, 'The robot marketplace · live now')
        ),
        h('h1', { class: 'hero-h' }, 'Bring a robot ', h('span', { class: 'it' }, 'home'), '.'),
        h('p', { class: 'hero-sub' },
          'BYRO is the marketplace for the robots people actually live with. Vacuums, mowers, companions, humanoids — every maker in one cart, financing built in, and one app that connects to all of them.'
        ),
        h('div', { class: 'hero-actions' },
          h('a', { class: 'btn btn-on-dark btn-lg btn-arrow', href: '#/browse' }, 'Browse robots', arrowSvg()),
          h('a', { class: 'btn btn-ghost-on-dark btn-lg', href: '#/how-it-works' }, 'How BYRO works')
        )
      ),
      h('div', { class: 'hero-card-right' },
        h('div', { class: 'spline-frame' }, canvasHost)
      )
    );

    const hero = h('section', { class: 'hero' },
      h('div', { class: 'wrap' }, metaStrip, heroCard)
    );

    mountSplineRuntime(canvasHost);
    return hero;
  }

  // -------------------- Spline Runtime mount + recolor probe --------------------
  // Loads the scene with @splinetool/runtime (instead of <spline-viewer>) so we can
  // introspect the scene's variables + named objects and recolor what's exposed.
  function mountSplineRuntime(canvasHost) {
    canvasHost.innerHTML = '';

    const loader = document.createElement('div');
    loader.className = 'spline-loader';
    loader.innerHTML = '<div class="ring"></div>LOADING SPECIMEN';
    canvasHost.appendChild(loader);

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvasHost.appendChild(canvas);

    let loaded = false;
    setTimeout(() => {
      if (!loaded) {
        loader.innerHTML = '<span>3D unavailable — open in a modern browser with WebGL</span>';
      }
    }, 14000);

    import('@splinetool/runtime').then(({ Application }) => {
      const app = new Application(canvas);
      return app.load(window.BYRO_HERO_SCENE).then(() => ({ app }));
    }).then(({ app }) => {
      loaded = true;
      loader.remove();
      window.__byroSpline = app;  // park on window for live tweaking in DevTools
      probeAndRecolor(app);
    }).catch((err) => {
      console.warn('[BYRO] Spline runtime failed to load:', err);
      loader.innerHTML = '<span>3D failed to load — check console</span>';
    });
  }

  function probeAndRecolor(app) {
    const tint = window.BYRO_HERO_TINT || {};

    // 1) Variables — the official knobs the scene creator exposed.
    let varNames = [];
    try {
      varNames = typeof app.getVariablesNames === 'function' ? app.getVariablesNames() : [];
    } catch (e) { /* swallow */ }
    let vars = {};
    try {
      vars = typeof app.getVariables === 'function' ? app.getVariables() : {};
    } catch (e) { /* swallow */ }

    console.groupCollapsed('[BYRO] Spline scene probe');
    console.log('Variables:', varNames, vars);

    // 2) Named objects via internal scene traversal (runtime SDK uses Three.js underneath).
    const named = [];
    const visit = (obj) => {
      if (!obj) return;
      if (obj.name) named.push({ name: obj.name, type: obj.type, hasMaterial: !!obj.material });
      if (obj.children && obj.children.length) obj.children.forEach(visit);
    };
    // The Application's internal scene lives at various keys depending on build; try them.
    const sceneRoot = app._scene || app.scene || (app._data && app._data.scene) || null;
    if (sceneRoot) visit(sceneRoot);
    console.log('Named objects:', named);
    console.log('Tweak in DevTools: window.__byroSpline.findObjectByName("Name").color = "#hex"');
    console.groupEnd();

    // 3) Recolor: only target eyes. Everything else stays as the scene was made.
    const eyeKeys = /(^|[^a-z])(eye|iris|pupil|lens)([^a-z]|$)/i;

    let recolored = 0;
    for (const entry of named) {
      if (!eyeKeys.test(entry.name)) continue;
      if (!tint.eye) continue;
      try {
        const obj = typeof app.findObjectByName === 'function' ? app.findObjectByName(entry.name) : null;
        if (obj && 'color' in obj) {
          obj.color = tint.eye;
          recolored++;
        }
      } catch (e) { /* keep going */ }
    }

    // 4) Variables: try setting any color variable whose name matches "eye".
    for (const vname of varNames) {
      if (!eyeKeys.test(vname)) continue;
      if (!tint.eye) continue;
      try {
        if (typeof app.setVariable === 'function') {
          app.setVariable(vname, tint.eye);
          recolored++;
        }
      } catch (e) { /* keep going */ }
    }

    console.log('[BYRO] Eye recolor attempts applied:', recolored);
    if (recolored === 0) {
      console.warn('[BYRO] No objects/variables matched "eye" in the scene. The scene either has no eyes, or the creator did not name them.');
    }
  }

  // -------------------- Trust strip --------------------
  function TrustStrip() {
    return h('section', { 'aria-label': 'BYRO commitments' },
      h('div', { class: 'wrap' },
        h('div', { class: 'trust-strip' },
          ...trustPoints.map(tp =>
            h('div', { class: 'tp' },
              h('div', { class: 'k' }, tp.k),
              h('div', { class: 'v' }, tp.v)
            )
          )
        )
      )
    );
  }

  // -------------------- Stats --------------------
  function StatsStrip() {
    return h('section',
      { 'aria-label': 'Marketplace stats' },
      h('div', { class: 'wrap' },
        h('div', { class: 'stats-strip reveal' },
          ...stats.map(s =>
            h('div', { class: 'stat' },
              h('div', { class: 'v' }, s.v),
              h('div', { class: 'l' }, s.l)
            )
          )
        )
      )
    );
  }

  // -------------------- Categories --------------------
  function Categories() {
    const grid = h('div', { class: 'cats' });
    categories.forEach((c) => {
      const tile = h('a', {
        class: 'cat',
        href: '#/browse?cat=' + c.id
      },
        h('div', { class: 'num' }, c.id.toUpperCase()),
        h('div', { class: 'ill' }, categoryMark(c.id)),
        h('div', { class: 'name' }, c.name),
        h('div', { class: 'blurb' }, c.blurb),
        h('div', { class: 'meta' },
          h('span', { class: 'group' },
            h('span', null, c.count + ' listings'),
            h('span', null, '·'),
            h('span', null, c.makers + ' makers'),
            h('span', null, '·'),
            h('span', { class: 'star' }, '★ ' + c.rating.toFixed(1))
          ),
          h('span', { class: 'arrow' }, '↗')
        )
      );
      grid.appendChild(tile);
    });

    return h('section', { class: 'section', id: 'cats' },
      h('div', { class: 'wrap' },
        h('div', { class: 'section-head' },
          h('div', null,
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Browse the shelves')),
            h('h2', { class: 'h2 reveal', style: { marginTop: '18px' } },
              'Every kind of robot. ',
              h('span', { class: 'serif-it' }, 'In one cart'), '.'
            )
          ),
          h('div', { class: 'right' },
            h('p', { class: 'lead' },
              'Six honest categories, every household type covered. Tap a shelf to open the full marketplace filtered to that aisle.'
            )
          )
        ),
        grid
      )
    );
  }

  // -------------------- Featured (with filter chips + compare) --------------------
  function Featured() {
    const compareSet = new Set();
    let activeFilter = 'all';

    const grid = h('div', { class: 'feat-grid' });
    const compareCount = h('span', { class: 'count' }, '0');
    const compareBar = h('span', { class: 'compare-bar' },
      compareCount,
      ' selected to compare'
    );

    const chips = h('div', { class: 'chips' });
    const allChip = h('button', { class: 'chip on', dataset: { id: 'all' } }, 'All');
    chips.appendChild(allChip);
    categories.forEach(c => {
      chips.appendChild(h('button', { class: 'chip', dataset: { id: c.id } }, c.name));
    });

    function setFilter(id) {
      activeFilter = id;
      [...chips.children].forEach(c => c.classList.toggle('on', c.dataset.id === id));
      render();
    }
    chips.addEventListener('click', (e) => {
      const t = e.target.closest('.chip');
      if (t) setFilter(t.dataset.id);
    });

    function toggleCompare(id, btn) {
      if (compareSet.has(id)) compareSet.delete(id);
      else compareSet.add(id);
      btn.classList.toggle('on', compareSet.has(id));
      compareCount.textContent = String(compareSet.size);
    }

    function card(r) {
      const tagEl = r.period === 'one time'
        ? h('span', { class: 'tag positive' }, 'In stock')
        : r.period === 'waitlist'
          ? h('span', { class: 'tag ink' }, 'Waitlist')
          : r.period === 'invite only'
            ? h('span', { class: 'tag ink' }, 'Invite only')
            : h('span', { class: 'tag ink' }, 'Reserve');

      const compareBtn = h('button', {
        class: 'compare',
        'aria-label': 'Add to compare',
        title: 'Add to compare'
      }, '+');
      compareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(r.id, compareBtn);
      });

      const priceStack = r.price != null
        ? h('div', { class: 'price-stack' },
            h('span', { class: 'price' }, fmtMoney(r.price)),
            r.monthly != null
              ? h('span', { class: 'monthly' }, 'or ' + fmtMonthly(r.monthly))
              : null
          )
        : h('div', { class: 'price-stack' },
            h('span', { class: 'price-period' }, r.period.toUpperCase())
          );

      const addBtn = r.inStock
        ? h('button', {
            class: 'add',
            onclick: (e) => { e.preventDefault(); e.stopPropagation(); addToCart(r.id); showCartToast(r); }
          }, 'Add')
        : h('button', {
            class: 'add ghost',
            onclick: (e) => { e.preventDefault(); e.stopPropagation(); alert(`Joined waitlist for ${r.brand} ${r.name}`); }
          }, r.period === 'waitlist' ? 'Notify me' : 'Reserve');

      const ratingEl = r.rating != null
        ? h('span', { class: 'rating' },
            h('span', { class: 'star' }, '★'),
            r.rating.toFixed(1),
            h('span', { class: 'count' }, '(' + r.reviewCount.toLocaleString() + ')')
          )
        : h('span', { class: 'rating' },
            h('span', { class: 'count' }, 'New')
          );

      return h('a', {
        class: 'rcard',
        href: '#/product/' + r.id
      },
        h('div', { class: 'photo' },
          tagEl,
          compareBtn,
          robotPlaceholder(r)
        ),
        h('div', { class: 'body' },
          h('div', { class: 'brand-row' },
            h('div', { class: 'brand' }, r.brand),
            ratingEl
          ),
          h('div', { class: 'name' }, r.name),
          h('div', { class: 'desc' }, r.tagline),
          h('div', { class: 'meta-mini' }, r.meta.slice(0, 3).join(' · ')),
          h('div', { class: 'price-row' }, priceStack, addBtn)
        )
      );
    }

    function render() {
      grid.innerHTML = '';
      const list = activeFilter === 'all'
        ? robots.slice(0, 9)
        : robots.filter(r => r.category === activeFilter).slice(0, 9);
      list.forEach(r => grid.appendChild(card(r)));
    }
    render();

    return h('section', { class: 'section', id: 'feat', style: { background: 'transparent' } },
      h('div', { class: 'wrap' },
        h('div', { class: 'section-head' },
          h('div', null,
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'This week on BYRO')),
            h('h2', { class: 'h2 reveal', style: { marginTop: '18px' } },
              'Nine picks from the ',
              h('span', { class: 'serif-it' }, 'BYRO desk'), '.'
            )
          ),
          h('div', { class: 'right' },
            h('p', { class: 'lead' },
              'Hand-picked across categories. Verified by our team, reviewed by their owners. Free shipping and 30-day returns on every purchase.'
            )
          )
        ),
        h('div', { class: 'feat-toolbar' }, chips, compareBar),
        grid,
        h('div', { style: { marginTop: '36px', display: 'flex', justifyContent: 'center' } },
          h('a', {
            class: 'btn btn-lg btn-arrow',
            href: '#/browse'
          }, 'See all 1,427 robots', arrowSvg())
        )
      )
    );
  }

  // -------------------- How it works --------------------
  function HowIll(kind) {
    const ink = '#0A0A0A', mute = '#8B8B85';
    if (kind === 'browse') {
      return svg(`
        <rect x="6" y="6" width="268" height="148" rx="10" fill="#fff" stroke="#E5E5DF"/>
        <rect x="20" y="20" width="200" height="22" rx="11" fill="#F4F4EE" stroke="#E5E5DF"/>
        <circle cx="32" cy="31" r="4" fill="none" stroke="${ink}" stroke-width="1"/>
        <line x1="35" y1="34" x2="40" y2="39" stroke="${ink}" stroke-width="1"/>
        <text x="46" y="35" font-family="Geist Mono" font-size="9" fill="${mute}">SEARCH ROBOTS</text>
        <rect x="226" y="20" width="34" height="22" rx="11" fill="${ink}"/>
        <text x="243" y="35" text-anchor="middle" font-family="Geist Mono" font-size="9" fill="#fff">SORT</text>
        ${[0,1,2].map(i => `
          <g transform="translate(${20 + i*84}, 56)">
            <rect width="76" height="88" rx="6" fill="#F4F4EE" stroke="#E5E5DF"/>
            <ellipse cx="38" cy="40" rx="22" ry="6" fill="#000" opacity="0.1"/>
            <ellipse cx="38" cy="34" rx="22" ry="8" fill="#fff" stroke="${ink}" stroke-width="0.8"/>
            <circle cx="38" cy="30" r="3" fill="${ink}"/>
            <line x1="8" y1="62" x2="62" y2="62" stroke="#E5E5DF" stroke-width="0.6"/>
            <text x="8" y="74" font-family="Geist" font-size="8" font-weight="500" fill="${ink}">Model ${i+1}</text>
            <text x="8" y="83" font-family="Geist Mono" font-size="7" fill="${mute}">$ ${[599,899,1199][i]}</text>
          </g>
        `).join('')}
      `, { viewBox: '0 0 280 160', xmlns: 'http://www.w3.org/2000/svg' });
    }
    if (kind === 'checkout') {
      return svg(`
        <rect x="6" y="6" width="268" height="148" rx="10" fill="#fff" stroke="#E5E5DF"/>
        <rect x="20" y="22" width="160" height="92" rx="8" fill="#F4F4EE" stroke="#E5E5DF"/>
        <text x="30" y="38" font-family="Geist Mono" font-size="8" fill="${mute}">CART · 2 ITEMS</text>
        <line x1="30" y1="44" x2="170" y2="44" stroke="#E5E5DF" stroke-width="0.6"/>
        <rect x="30" y="50" width="24" height="22" rx="4" fill="#fff" stroke="${ink}" stroke-width="0.6"/>
        <text x="60" y="60" font-family="Geist" font-size="8.5" fill="${ink}">Roomba j9+</text>
        <text x="60" y="70" font-family="Geist Mono" font-size="7" fill="${mute}">$899.00</text>
        <line x1="30" y1="78" x2="170" y2="78" stroke="#E5E5DF" stroke-width="0.6"/>
        <rect x="30" y="82" width="24" height="22" rx="4" fill="#fff" stroke="${ink}" stroke-width="0.6"/>
        <text x="60" y="92" font-family="Geist" font-size="8.5" fill="${ink}">Loona Petbot</text>
        <text x="60" y="102" font-family="Geist Mono" font-size="7" fill="${mute}">$449.00</text>
        <rect x="190" y="22" width="70" height="92" rx="8" fill="${ink}"/>
        <text x="200" y="42" font-family="Geist Mono" font-size="7" fill="#A8A8A2">TOTAL</text>
        <text x="200" y="60" font-family="Geist" font-size="14" font-weight="600" fill="#fff">$1,348</text>
        <rect x="200" y="80" width="50" height="20" rx="10" fill="#fff"/>
        <text x="225" y="93" text-anchor="middle" font-family="Geist Mono" font-size="7" fill="${ink}" letter-spacing="1">PAY</text>
        <text x="200" y="110" font-family="Geist Mono" font-size="6" fill="#A8A8A2">SHIPS IN 3 DAYS</text>
        <line x1="20" y1="130" x2="260" y2="130" stroke="${mute}" stroke-width="0.6" stroke-dasharray="2 3"/>
        <text x="20" y="146" font-family="Geist Mono" font-size="7.5" fill="${mute}">SHIP TO · 600 BRAZOS ST, AUSTIN TX</text>
      `, { viewBox: '0 0 280 160', xmlns: 'http://www.w3.org/2000/svg' });
    }
    if (kind === 'unbox') {
      return svg(`
        <rect x="6" y="6" width="268" height="148" rx="10" fill="#fff" stroke="#E5E5DF"/>
        <polygon points="60,118 60,68 140,52 140,102" fill="#F4F4EE" stroke="${ink}" stroke-width="1"/>
        <polygon points="140,102 140,52 220,68 220,118" fill="#fff" stroke="${ink}" stroke-width="1"/>
        <polygon points="60,68 140,52 220,68 140,84" fill="#fff" stroke="${ink}" stroke-width="1"/>
        <line x1="140" y1="52" x2="140" y2="102" stroke="${ink}" stroke-width="0.7"/>
        <rect x="135" y="56" width="10" height="50" fill="${ink}"/>
        <rect x="158" y="76" width="22" height="6" fill="${ink}"/>
        <text x="169" y="98" text-anchor="middle" font-family="Geist Mono" font-size="6" fill="${mute}" letter-spacing="1.5">BYRO</text>
        <path d="M40 130 Q50 118 64 118 L72 118 Q82 118 88 126" stroke="${ink}" stroke-width="1.2" fill="none"/>
        <path d="M240 130 Q230 118 216 118 L208 118 Q198 118 192 126" stroke="${ink}" stroke-width="1.2" fill="none"/>
        <circle cx="80" cy="40" r="1.4" fill="${ink}"/>
        <circle cx="200" cy="40" r="1.4" fill="${ink}"/>
        <path d="M70 50 L74 54 M74 50 L70 54" stroke="${ink}" stroke-width="0.8"/>
        <path d="M210 50 L214 54 M214 50 L210 54" stroke="${ink}" stroke-width="0.8"/>
        <text x="140" y="146" text-anchor="middle" font-family="Geist Mono" font-size="7.5" fill="${mute}" letter-spacing="1">30 DAY TRY AT HOME</text>
      `, { viewBox: '0 0 280 160', xmlns: 'http://www.w3.org/2000/svg' });
    }
  }

  function HowItWorks() {
    return h('section', { class: 'section', id: 'how' },
      h('div', { class: 'wrap' },
        h('div', { class: 'section-head' },
          h('div', null,
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'How BYRO works')),
            h('h2', { class: 'h2 reveal', style: { marginTop: '18px' } },
              'From browse tab to ',
              h('span', { class: 'serif-it' }, 'living room'), '.'
            )
          ),
          h('div', { class: 'right' },
            h('p', { class: 'lead' },
              'No dealer voicemail, no quote forms. Pick a robot, check out, and we coordinate the rest with the maker.'
            )
          )
        ),
        h('div', { class: 'steps' },
          h('div', { class: 'step' },
            h('div', { class: 'num' }, 'BROWSE'),
            h('div', { class: 'ill' }, HowIll('browse')),
            h('h3', null, 'Side by side, all in one place.'),
            h('p', null, 'Compare every robot in a category at once. Filter by what actually matters: noise, battery life, square footage, real owner ratings.')
          ),
          h('div', { class: 'step' },
            h('div', { class: 'num' }, 'CHECK OUT'),
            h('div', { class: 'ill' }, HowIll('checkout')),
            h('h3', null, 'One cart, one card, one address.'),
            h('p', null, 'Buy from any maker through BYRO. Pay once, finance from $9/mo, or rent month-to-month on eligible models.')
          ),
          h('div', { class: 'step' },
            h('div', { class: 'num' }, 'UNBOX'),
            h('div', { class: 'ill' }, HowIll('unbox')),
            h('h3', null, 'Set up help, on us.'),
            h('p', null, '30-day try-at-home window on every purchase. Free returns if it does not click. Concierge setup call within 48 hours.')
          )
        )
      )
    );
  }

  // -------------------- App teaser (homepage) --------------------
  function AppTeaser() {
    return h('section', { class: 'section' },
      h('div', { class: 'wrap' },
        h('div', { class: 'app-band' },
          h('div', { class: 'app-band-copy' },
            h('div', { class: 'eyebrow', style: { color: 'var(--dark-ink-3)' } },
              h('span', { class: 'dot', style: { background: 'var(--pulse)', boxShadow: '0 0 8px var(--pulse)' } }),
              h('span', null, 'Coming Q1 2027 · BYRO App')
            ),
            h('h2', { class: 'app-band-title' },
              'Every robot you own.', h('br'), 'One app.'
            ),
            h('p', { class: 'app-band-sub' },
              'BYRO integrates directly with every maker’s software so warranty, troubleshooting, service history, and concierge all live in one place. Bought a Roborock, a Loona, and a mower from three different brands? Now they answer to one app.'
            ),
            h('div', { class: 'app-band-actions' },
              h('a', { class: 'btn btn-on-dark btn-lg btn-arrow', href: '#/app' }, 'See how it works', arrowSvg()),
              h('a', { class: 'btn btn-ghost-on-dark btn-lg', href: '#/app' }, 'Join the waitlist')
            )
          ),
          h('div', { class: 'app-band-mock' },
            h('div', { class: 'app-mock-row' },
              h('span', { class: 'm', style: { background: 'hsl(20, 22%, 70%)' } }, 'R'),
              h('span', { class: 'n' }, 'S8 Pro Ultra'),
              h('span', { class: 'd' }, 'Cleaning')
            ),
            h('div', { class: 'app-mock-row' },
              h('span', { class: 'm', style: { background: 'hsl(140, 22%, 70%)' } }, 'L'),
              h('span', { class: 'n' }, 'Loona'),
              h('span', { class: 'd' }, 'Idle')
            ),
            h('div', { class: 'app-mock-row' },
              h('span', { class: 'm', style: { background: 'hsl(60, 22%, 70%)' } }, 'M'),
              h('span', { class: 'n' }, 'LUBA 5000'),
              h('span', { class: 'd' }, 'Charging')
            ),
            h('div', { class: 'app-mock-row alert' },
              h('span', { class: 'm', style: { background: 'hsl(260, 22%, 70%)' } }, 'aibo'),
              h('span', { class: 'n' }, 'aibo ERS-1000'),
              h('span', { class: 'd' }, 'Update · 1 tap')
            )
          )
        )
      )
    );
  }

  // -------------------- CTA Band --------------------
  function CtaBand() {
    return h('section', { class: 'section' },
      h('div', { class: 'wrap' },
        h('div', { class: 'cta-band' },
          h('div', null,
            h('div', { class: 'eyebrow', style: { color: 'var(--dark-ink-3)', marginBottom: '18px' } },
              h('span', { class: 'dot', style: { background: 'var(--dark-ink)' } }),
              h('span', null, 'Ready when you are')
            ),
            h('h2', null,
              'The robot marketplace,', h('br'),
              'built for ', h('span', { class: 'it' }, 'everyday people'), '.'
            ),
            h('p', null, 'Browse the catalog, save what you like, get notified when prices drop. Free to use, no account required to start.')
          ),
          h('div', { class: 'actions' },
            h('a', { class: 'btn btn-on-dark btn-lg btn-arrow', href: '#/browse' }, 'Start browsing', arrowSvg()),
            h('a', { class: 'btn btn-ghost-on-dark btn-lg', href: '#/account' }, 'Create account')
          ),
          h('div', { class: 'swap-row' },
            h('span', { class: 'label' }, 'Already own one?'),
            h('a', { class: 'swap', href: '#/sell' },
              'Sell or trade in your robot through BYRO',
              arrowSvg()
            )
          )
        )
      )
    );
  }

  // -------------------- Footer --------------------
  function FooterBlock() {
    return h('footer', { class: 'foot' },
      h('div', { class: 'wrap' },
        h('div', { class: 'foot-grid' },
          h('div', { class: 'col' },
            Wordmark(22),
            h('p', null, 'The marketplace for the robots people actually live with. Verified makers, real reviews, ship-to-your-door financing.')
          ),
          h('div', { class: 'col' },
            h('h5', null, 'Marketplace'),
            h('a', { href: '#/browse' }, 'Browse robots'),
            h('a', { href: '#/featured' }, 'Featured'),
            h('a', { href: '#/new-arrivals' }, 'New arrivals'),
            h('a', { href: '#/gift-guide' }, 'Gift guide'),
            h('a', { href: '#/app' }, 'BYRO app')
          ),
          h('div', { class: 'col' },
            h('h5', null, 'For makers'),
            h('a', { href: '#/sell' }, 'Sell on BYRO'),
            h('a', { href: '#/industrial' }, 'Industrial sales'),
            h('a', { href: '#/press' }, 'Press'),
            h('a', { href: '#/api' }, 'API')
          ),
          h('div', { class: 'col' },
            h('h5', null, 'Company'),
            h('a', { href: '#/about' }, 'About'),
            h('a', { href: '#/careers' }, 'Careers'),
            h('a', { href: '#/support' }, 'Support'),
            h('a', { href: '#/privacy' }, 'Privacy')
          )
        ),
        h('div', { class: 'foot-bottom' },
          h('span', null, '© 2026 BYRO Inc.'),
          h('span', null, 'Made in Denver and the internet.')
        )
      )
    );
  }

  // -------------------- Product page --------------------
  // Minimal "related robot" card — slimmer than the Featured rcard (no compare, no chips).
  function RelatedCard(r) {
    const tagEl = r.period === 'one time'
      ? h('span', { class: 'tag positive' }, 'In stock')
      : r.period === 'waitlist'
        ? h('span', { class: 'tag ink' }, 'Waitlist')
        : r.period === 'invite only'
          ? h('span', { class: 'tag ink' }, 'Invite only')
          : h('span', { class: 'tag ink' }, 'Reserve');

    const priceEl = r.price != null
      ? h('span', { class: 'price' }, fmtMoney(r.price))
      : h('span', { class: 'price-period' }, r.period.toUpperCase());

    return h('a', { class: 'rcard', href: '#/product/' + r.id },
      h('div', { class: 'photo' },
        tagEl,
        robotPlaceholder(r)
      ),
      h('div', { class: 'body' },
        h('div', { class: 'brand' }, r.brand),
        h('div', { class: 'name' }, r.name),
        h('div', { class: 'desc' }, r.tagline),
        h('div', { class: 'price-row' },
          h('div', { class: 'price-stack' }, priceEl),
          h('span', { class: 'arrow', style: { color: 'var(--ink-3)' } }, '↗')
        )
      )
    );
  }

  function ProductPage(robot) {
    const cat = findCategory(robot.category);
    const detail = robot.detail || {};
    const reviews = reviewsFor(robot);
    const related = relatedRobots(robot, 3);

    // Breadcrumb
    const breadcrumb = h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/' }, 'Home'),
      h('span', { class: 'sep' }, '/'),
      h('a', { href: '#/category/' + (cat ? cat.id : '') }, cat ? cat.name : 'Marketplace'),
      h('span', { class: 'sep' }, '/'),
      h('span', { class: 'current' }, robot.brand + ' ' + robot.name)
    );

    // Status tag for hero
    const statusTag = robot.period === 'one time' && robot.inStock
      ? h('span', { class: 'tag positive' }, 'In stock · Ships in 3 days')
      : robot.period === 'waitlist'
        ? h('span', { class: 'tag ink' }, 'Waitlist')
        : robot.period === 'invite only'
          ? h('span', { class: 'tag ink' }, 'Invite only')
          : h('span', { class: 'tag ink' }, 'Reserve · Q2 delivery');

    // Rating display
    const ratingEl = robot.rating != null
      ? h('div', { class: 'pp-rating' },
          h('span', { class: 'stars' }, '★'.repeat(Math.round(robot.rating)) + '☆'.repeat(5 - Math.round(robot.rating))),
          h('span', { class: 'num' }, robot.rating.toFixed(1)),
          h('a', { class: 'count', href: '#reviews-section', onclick: (e) => { e.preventDefault(); document.querySelector('#reviews')?.scrollIntoView({ behavior: 'smooth' }); } }, '(' + robot.reviewCount.toLocaleString() + ' reviews)')
        )
      : h('div', { class: 'pp-rating' },
          h('span', { class: 'num', style: { color: 'var(--ink-3)' } }, 'New on BYRO — no reviews yet')
        );

    // Price block
    const priceBlock = robot.price != null
      ? h('div', { class: 'pp-price' },
          h('div', { class: 'big' }, fmtMoney(robot.price)),
          robot.monthly != null
            ? h('div', { class: 'monthly' }, 'or ' + fmtMonthly(robot.monthly) + ' with BYRO financing · 0% APR for 24 mo')
            : null,
          h('div', { class: 'period' }, robot.period === 'one time' ? 'One-time purchase' : robot.period.toUpperCase())
        )
      : h('div', { class: 'pp-price' },
          h('div', { class: 'big', style: { fontSize: '24px' } }, 'Pricing coming soon'),
          h('div', { class: 'period' }, robot.period.toUpperCase())
        );

    // Primary CTA
    const primaryCta = robot.inStock
      ? h('button', {
          class: 'btn btn-ink btn-lg btn-arrow',
          onclick: () => { addToCart(robot.id); showCartToast(robot); }
        }, 'Add to cart', arrowSvg())
      : h('button', {
          class: 'btn btn-ink btn-lg btn-arrow',
          onclick: () => alert(robot.period === 'waitlist' ? 'Joined waitlist' : 'Reserved a slot')
        }, robot.period === 'waitlist' ? 'Notify me' : 'Reserve', arrowSvg());

    // Hero: photo + facts
    const hero = h('section', { class: 'pp-hero' },
      h('div', { class: 'wrap' },
        h('div', { class: 'pp-hero-grid' },
          h('div', { class: 'pp-photo' },
            statusTag,
            robotPlaceholder(robot, { size: 'hero' })
          ),
          h('div', { class: 'pp-facts' },
            h('div', { class: 'pp-brand' }, robot.brand),
            h('h1', { class: 'pp-name' }, robot.name),
            h('p', { class: 'pp-tagline' }, robot.tagline),
            ratingEl,
            priceBlock,
            h('div', { class: 'pp-actions' },
              primaryCta,
              h('button', {
                class: 'btn btn-lg',
                onclick: () => alert('Added to comparison')
              }, 'Add to compare')
            ),
            h('ul', { class: 'pp-mini-trust' },
              h('li', null, 'Free shipping'),
              h('li', null, '30-day try-at-home'),
              h('li', null, 'Verified maker'),
              h('li', null, 'Concierge setup')
            )
          )
        )
      )
    );

    // Description + Specs + What's in the box
    const overview = h('section', { class: 'pp-section' },
      h('div', { class: 'wrap' },
        h('div', { class: 'pp-overview-grid' },
          h('div', { class: 'pp-overview-main' },
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Overview')),
            h('p', { class: 'pp-desc' }, detail.description || robot.tagline),
            detail.editorial
              ? h('div', { class: 'pp-editorial' },
                  h('div', { class: 'label' }, 'The BYRO take'),
                  h('p', null, detail.editorial)
                )
              : null
          ),
          h('div', { class: 'pp-overview-side' },
            h('div', { class: 'pp-box' },
              h('h4', null, 'Specs'),
              h('dl', { class: 'pp-specs' },
                ...(detail.specs ? Object.entries(detail.specs).flatMap(([k, v]) => [
                  h('dt', null, k),
                  h('dd', null, v)
                ]) : [h('dd', null, '—')])
              )
            ),
            detail.inBox && detail.inBox.length
              ? h('div', { class: 'pp-box' },
                  h('h4', null, 'In the box'),
                  h('ul', { class: 'pp-inbox' },
                    ...detail.inBox.map(item => h('li', null, item))
                  )
                )
              : null
          )
        )
      )
    );

    // Reviews
    const reviewsSection = reviews.length
      ? h('section', { class: 'pp-section', id: 'reviews' },
          h('div', { class: 'wrap' },
            h('div', { class: 'pp-reviews-head' },
              h('div', null,
                h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Owner reviews')),
                h('h2', { class: 'h3', style: { marginTop: '12px' } },
                  robot.rating.toFixed(1) + ' average across ',
                  h('span', { class: 'serif-it' }, robot.reviewCount.toLocaleString() + ' verified owners')
                )
              ),
              h('button', { class: 'btn', onclick: () => document.querySelector('#reviews')?.scrollIntoView({ behavior: 'smooth' }) }, 'Jump to reviews')
            ),
            h('div', { class: 'pp-review-list' },
              ...reviews.map(rv =>
                h('article', { class: 'pp-review' },
                  h('div', { class: 'pp-review-head' },
                    h('span', { class: 'stars' }, '★'.repeat(Math.floor(rv.stars)) + (rv.stars % 1 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rv.stars))),
                    h('span', { class: 'author' }, rv.author),
                    h('span', { class: 'loc' }, rv.loc)
                  ),
                  h('p', { class: 'pp-review-body' }, rv.body)
                )
              )
            )
          )
        )
      : null;

    // Related
    const relatedSection = related.length
      ? h('section', { class: 'pp-section' },
          h('div', { class: 'wrap' },
            h('div', { class: 'eyebrow' },
              h('span', { class: 'dot' }),
              h('span', null, 'Compare to other ' + (cat ? cat.name.toLowerCase() : 'robots'))
            ),
            h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '28px' } },
              'Similar picks from the ',
              h('span', { class: 'serif-it' }, 'BYRO desk')
            ),
            h('div', { class: 'feat-grid' },
              ...related.map(RelatedCard)
            )
          )
        )
      : null;

    // Back to browse
    const backRow = h('section', { class: 'pp-section', style: { paddingTop: '0' } },
      h('div', { class: 'wrap' },
        h('div', { class: 'pp-back' },
          h('a', { class: 'btn btn-lg btn-arrow', href: '#/' }, 'Back to marketplace', arrowSvg())
        )
      )
    );

    return h('main', { class: 'pp' }, breadcrumb, hero, overview, reviewsSection, relatedSection, backRow);
  }

  // ============================================================
  //                  Shared page primitives
  //   PageHero, PageSection, Prose, FormStack, FormField, Faq
  // ============================================================

  function PageHero(eyebrow, title, subtitle, opts) {
    opts = opts || {};
    const titleNode = typeof title === 'string'
      ? h('h1', { class: 'page-hero-title' }, title)
      : title;
    const subtitleNode = subtitle
      ? (typeof subtitle === 'string'
          ? h('p', { class: 'page-hero-sub' }, subtitle)
          : subtitle)
      : null;
    return h('section', { class: 'page-hero' + (opts.compact ? ' compact' : '') },
      h('div', { class: 'wrap' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, eyebrow)),
        titleNode,
        subtitleNode
      )
    );
  }

  function PageSection(opts, ...kids) {
    opts = opts || {};
    const cls = 'pp-section' + (opts.tone === 'soft' ? ' tone-soft' : '');
    return h('section', { class: cls },
      h('div', { class: 'wrap' }, ...kids)
    );
  }

  // Prose: takes an array of {tag, text} or strings; renders styled long-form copy.
  function Prose(blocks) {
    return h('div', { class: 'prose' },
      ...blocks.map(b => {
        if (typeof b === 'string') return h('p', null, b);
        if (b.tag === 'h2') return h('h2', null, b.text);
        if (b.tag === 'h3') return h('h3', null, b.text);
        if (b.tag === 'ul') return h('ul', null, ...b.items.map(i => h('li', null, i)));
        if (b.tag === 'ol') return h('ol', null, ...b.items.map(i => h('li', null, i)));
        if (b.tag === 'quote') return h('blockquote', null, b.text);
        return h('p', null, b.text);
      })
    );
  }

  function FormField(label, input, hint) {
    return h('label', { class: 'form-field' },
      h('span', { class: 'form-label' }, label),
      input,
      hint ? h('span', { class: 'form-hint' }, hint) : null
    );
  }

  function FormStack(opts, ...fields) {
    opts = opts || {};
    return h('form', {
      class: 'form-stack',
      onsubmit: (e) => {
        e.preventDefault();
        alert(opts.successMessage || 'Submitted. We will be in touch.');
      }
    }, ...fields);
  }

  function Faq(items) {
    return h('div', { class: 'faq' },
      ...items.map(it =>
        h('details', { class: 'faq-item' },
          h('summary', null, h('span', { class: 'q' }, it.q), h('span', { class: 'chev' }, '+')),
          h('div', { class: 'faq-a' }, it.a)
        )
      )
    );
  }

  // ============================================================
  //                     MARKETPLACE pages
  //   BrowsePage, FeaturedPage, NewArrivalsPage, GiftGuidePage
  // ============================================================

  // ---- Browse: full catalog with filter chips + sort ----
  function BrowsePage() {
    // Read ?cat=<id> from the hash to preselect a category from a deep link.
    const queryStr = (window.location.hash.split('?')[1] || '');
    const initialCat = new URLSearchParams(queryStr).get('cat') || 'all';

    const grid = h('div', { class: 'feat-grid' });
    const counter = h('span', { class: 'browse-count' }, '');
    let activeCat = initialCat;
    let activeBrand = 'all';
    let activeSort = 'rating';
    let inStockOnly = false;

    const allBrands = Array.from(new Set(robots.map(r => r.brand))).sort();

    const catChips = h('div', { class: 'chips' },
      h('button', { class: 'chip' + (activeCat === 'all' ? ' on' : ''), dataset: { id: 'all' } }, 'All categories'),
      ...categories.map(c => h('button', { class: 'chip' + (activeCat === c.id ? ' on' : ''), dataset: { id: c.id } }, c.name))
    );
    const brandChips = h('div', { class: 'chips' },
      h('button', { class: 'chip on', dataset: { id: 'all' } }, 'All brands'),
      ...allBrands.map(b => h('button', { class: 'chip', dataset: { id: b } }, b))
    );
    const sortSelect = h('select', { class: 'browse-sort' },
      h('option', { value: 'rating' }, 'Sort: Top rated'),
      h('option', { value: 'price-asc' }, 'Sort: Price · low to high'),
      h('option', { value: 'price-desc' }, 'Sort: Price · high to low'),
      h('option', { value: 'brand' }, 'Sort: Brand A–Z')
    );
    const stockToggle = h('label', { class: 'browse-toggle' },
      h('input', { type: 'checkbox' }),
      h('span', null, 'In stock only')
    );

    catChips.addEventListener('click', (e) => {
      const t = e.target.closest('.chip'); if (!t) return;
      activeCat = t.dataset.id;
      [...catChips.children].forEach(c => c.classList.toggle('on', c.dataset.id === activeCat));
      render();
    });
    brandChips.addEventListener('click', (e) => {
      const t = e.target.closest('.chip'); if (!t) return;
      activeBrand = t.dataset.id;
      [...brandChips.children].forEach(c => c.classList.toggle('on', c.dataset.id === activeBrand));
      render();
    });
    sortSelect.addEventListener('change', () => { activeSort = sortSelect.value; render(); });
    stockToggle.querySelector('input').addEventListener('change', (e) => {
      inStockOnly = e.target.checked; render();
    });

    function render() {
      let list = robots.slice();
      if (activeCat !== 'all') list = list.filter(r => r.category === activeCat);
      if (activeBrand !== 'all') list = list.filter(r => r.brand === activeBrand);
      if (inStockOnly) list = list.filter(r => r.inStock);
      if (activeSort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (activeSort === 'price-asc') list.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
      if (activeSort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
      if (activeSort === 'brand') list.sort((a, b) => a.brand.localeCompare(b.brand));
      grid.innerHTML = '';
      list.forEach(r => grid.appendChild(RelatedCard(r)));
      counter.textContent = list.length + ' of ' + robots.length + ' robots';
    }
    render();

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · Browse',
        'Every robot we list, one place.',
        'Twenty models, nine makers, six categories. Filter by what matters to you and let the rest fade out.'
      ),
      PageSection({},
        h('div', { class: 'browse-controls' },
          h('div', { class: 'browse-filter-group' },
            h('div', { class: 'browse-filter-label' }, 'Category'),
            catChips
          ),
          h('div', { class: 'browse-filter-group' },
            h('div', { class: 'browse-filter-label' }, 'Brand'),
            brandChips
          ),
          h('div', { class: 'browse-meta-row' },
            counter,
            h('div', { class: 'browse-meta-controls' }, stockToggle, sortSelect)
          )
        ),
        grid
      )
    );
  }

  // ---- Featured: editorial picks ----
  function FeaturedPage() {
    const top = robots.find(r => r.id === 'roborock-s8-pro');
    const firstTimer = robots.find(r => r.id === 'irobot-j9');
    const splurge   = robots.find(r => r.id === 'aibo-ers1000');
    const renter    = robots.find(r => r.id === 'eilik-energize');

    function PickCard(r, kicker, take) {
      return h('a', { class: 'pick-card', href: '#/product/' + r.id },
        h('div', { class: 'pick-kicker' }, kicker),
        h('div', { class: 'pick-photo' }, robotPlaceholder(r)),
        h('div', { class: 'pick-body' },
          h('div', { class: 'pick-brand' }, r.brand),
          h('div', { class: 'pick-name' }, r.name),
          h('p', { class: 'pick-take' }, take),
          h('div', { class: 'pick-cta' }, 'See the breakdown ', arrowSvg())
        )
      );
    }

    const featured9 = [
      'roborock-s8-pro','loona','mammotion-luba','neo-beta','moflin','enabot-rola',
      'irobot-j9','vector-2','husqvarna-450x'
    ].map(id => robots.find(r => r.id === id)).filter(Boolean);
    const grid = h('div', { class: 'feat-grid' });
    featured9.forEach(r => grid.appendChild(RelatedCard(r)));

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · Featured',
        'Picks from the BYRO desk.',
        'Three editor’s notes, then the rest of the week’s lineup. Updated every Monday by our buying team.'
      ),
      PageSection({},
        h('div', { class: 'picks-grid' },
          PickCard(firstTimer, 'Best first robot', 'The j9+ is the easiest “you will actually use it” vacuum. Genius AI, Clean Base, set-and-forget for two months at a stretch.'),
          PickCard(splurge,    'Best splurge',     'Sony’s aibo is the only robot pet that earns the word pet. OLED eyes, cloud memory, joins the family.'),
          PickCard(renter,     'Best for renters', 'Eilik fits in a backpack, plugs into USB-C, and goes wherever you go. The robot version of a houseplant.')
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'This week on BYRO')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } },
          'Nine more we kept coming back to.'
        ),
        grid
      )
    );
  }

  // ---- New arrivals: synthesize an addedDate, sort newest first ----
  function NewArrivalsPage() {
    const now = Date.now();
    const dayMs = 86400 * 1000;
    // Deterministic days-ago per robot from id hash, in range 0..90
    function daysAgo(id) {
      let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      return h % 91;
    }
    let activeWindow = 90;

    const winChips = h('div', { class: 'chips' },
      h('button', { class: 'chip', dataset: { d: '7' } }, 'Last 7 days'),
      h('button', { class: 'chip', dataset: { d: '30' } }, 'Last 30 days'),
      h('button', { class: 'chip on', dataset: { d: '90' } }, 'Last 90 days')
    );
    const grid = h('div', { class: 'feat-grid' });

    function fmtAgo(d) {
      if (d === 0) return 'Added today';
      if (d === 1) return 'Added yesterday';
      if (d < 7) return 'Added ' + d + ' days ago';
      if (d < 30) return 'Added ' + Math.floor(d / 7) + 'w ago';
      return 'Added ' + Math.floor(d / 30) + 'mo ago';
    }
    function render() {
      const list = robots
        .map(r => ({ r, d: daysAgo(r.id) }))
        .filter(x => x.d <= activeWindow)
        .sort((a, b) => a.d - b.d);
      grid.innerHTML = '';
      list.forEach(({ r, d }) => {
        const card = RelatedCard(r);
        const badge = h('span', { class: 'arrival-badge' }, fmtAgo(d));
        card.querySelector('.photo')?.appendChild(badge);
        grid.appendChild(card);
      });
    }
    winChips.addEventListener('click', (e) => {
      const t = e.target.closest('.chip'); if (!t) return;
      activeWindow = parseInt(t.dataset.d, 10);
      [...winChips.children].forEach(c => c.classList.toggle('on', c === t));
      render();
    });
    render();

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · New arrivals',
        'Just landed on BYRO.',
        'Recently listed by verified makers. Sorted newest first so you see what changed since you last looked.'
      ),
      PageSection({},
        h('div', { class: 'browse-filter-group' },
          h('div', { class: 'browse-filter-label' }, 'Window'),
          winChips
        ),
        grid
      )
    );
  }

  // ---- Gift guide: by recipient + by budget ----
  function GiftGuidePage() {
    const byRecipient = [
      { kicker: 'For new parents',           ids: ['roborock-s8-pro', 'moflin'],            why: 'A vacuum that handles cracker dust on its own and a quiet AI pet for the nursery. Both are quiet enough not to wake a sleeping kid.' },
      { kicker: 'For pet households',        ids: ['enabot-rola', 'aibo-ers1000'],          why: 'A roaming camera that follows the dog and a robot pet that does not steal your shoes.' },
      { kicker: 'For the tech in-law',       ids: ['loona', 'vector-2'],                    why: 'Expressive desk companions with personality. Tech-curious without being a project.' },
      { kicker: 'For the partner who hates chores', ids: ['eufy-x10', 'husqvarna-450x'],    why: 'The vacuum that mops carpets and the mower that handles a half-acre on its own. Christmas dinner gets way less defensive.' }
    ];
    const byBudget = [
      { kicker: 'Under $500',  ids: ['eilik-energize', 'miko-3', 'moflin'] },
      { kicker: 'Under $1,000', ids: ['irobot-j9', 'eufy-x10', 'loona'] },
      { kicker: 'Under $2,000', ids: ['roborock-s8-pro', 'dreame-x40', 'aibo-ers1000'] },
      { kicker: 'No budget',    ids: ['neo-beta', 'mammotion-luba', 'figure-02'] }
    ];

    function Section(group) {
      return h('div', { class: 'gift-section' },
        h('div', { class: 'gift-head' },
          h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, group.kicker)),
          group.why ? h('p', { class: 'gift-why' }, group.why) : null
        ),
        h('div', { class: 'feat-grid' }, ...group.ids.map(id => {
          const r = robots.find(x => x.id === id);
          return r ? RelatedCard(r) : null;
        }).filter(Boolean))
      );
    }

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · Gift guide',
        'The 2026 BYRO Gift Guide.',
        'Robots they will actually use. Sorted by the person, then by the budget, so you can shop by either.'
      ),
      PageSection({},
        h('h2', { class: 'h3' }, 'By recipient'),
        ...byRecipient.map(Section)
      ),
      PageSection({ tone: 'soft' },
        h('h2', { class: 'h3' }, 'By budget'),
        ...byBudget.map(Section)
      )
    );
  }

  // ============================================================
  //                      FOR MAKERS pages
  //   SellPage, IndustrialPage, PressPage, ApiPage
  // ============================================================

  function SellPage() {
    const why = [
      { k: 'One marketplace, every category', v: 'Buyers find your robot next to its peers, not lost between unrelated SKUs on a general site. Conversion on a focused storefront is consistently 2–4×.' },
      { k: 'Curated audience, ready to buy', v: 'BYRO traffic is people researching a household robot they actually want. No tire kickers, no enterprise leads, no resellers.' },
      { k: 'We handle the cart, you handle the box', v: 'BYRO collects payment, holds the funds in escrow until ship confirmation, and routes payouts weekly. You drop-ship from your warehouse.' }
    ];
    const steps = [
      { n: '01 · APPLY',  t: 'Tell us about your robot.',                     b: 'A short form: company, category, units per year, retail price. We respond within two business days.' },
      { n: '02 · LIST',   t: 'We build the listing with you.',                b: 'Your concierge captures specs, photos, and reviews into the BYRO format. You approve the page before it goes live.' },
      { n: '03 · SHIP',   t: 'Orders ship from your warehouse.',              b: 'We notify you on order, you fulfill within 48 hours, BYRO pays out the Friday after delivery.' }
    ];

    const form = FormStack({ successMessage: 'Application received. Our maker relations team will reach out within two business days.' },
      h('div', { class: 'form-row' },
        FormField('Company name',    h('input', { type: 'text', required: true,  placeholder: 'Acme Robotics, Inc.' })),
        FormField('Primary contact', h('input', { type: 'text', required: true,  placeholder: 'Your name' }))
      ),
      h('div', { class: 'form-row' },
        FormField('Email',           h('input', { type: 'email', required: true, placeholder: 'you@example.com' })),
        FormField('Phone',           h('input', { type: 'tel',                   placeholder: 'Optional' }))
      ),
      h('div', { class: 'form-row' },
        FormField('Primary category', h('select', { required: true },
          h('option', { value: '' }, 'Choose one'),
          ...categories.map(c => h('option', { value: c.id }, c.name))
        )),
        FormField('Units shipped per year', h('select', { required: true },
          h('option', { value: '' }, 'Choose one'),
          h('option', { value: '<500' }, 'Under 500'),
          h('option', { value: '500-5k' }, '500–5,000'),
          h('option', { value: '5k-50k' }, '5,000–50,000'),
          h('option', { value: '50k+' }, '50,000+')
        ))
      ),
      FormField('What is your retail price range?', h('input', { type: 'text', placeholder: 'e.g., $799–$1,499' })),
      FormField('Anything else we should know?',    h('textarea', { rows: '4', placeholder: 'Optional — your robot, your timeline, anything you want us to see.' })),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Submit application', arrowSvg())
    );

    const logos = ['Roborock','iRobot','Eufy','Dreame','Mammotion','Husqvarna','Segway','Sony','KEYi','1X','Unitree','Figure','Enabot'];

    return h('main', { class: 'page' },
      PageHero(
        'For makers · Sell on BYRO',
        'Reach the buyers who want your robot.',
        'One curated storefront, transparent commission, payouts every Friday. No retail-channel politics.'
      ),
      PageSection({},
        h('div', { class: 'why-grid' },
          ...why.map(w => h('div', { class: 'why-card' },
            h('h3', null, w.k),
            h('p', null, w.v)
          ))
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'How it works')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '32px' } }, 'Three steps. No retail channel manager required.'),
        h('div', { class: 'steps' },
          ...steps.map(s => h('div', { class: 'step' },
            h('div', { class: 'num' }, s.n),
            h('h3', null, s.t),
            h('p', null, s.b)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Commission')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '18px' } }, '10% flat. Zero listing fees. First month free.'),
        h('p', { class: 'lead', style: { maxWidth: '60ch' } },
          'Same rate whether you sell one robot a month or a thousand. No tiered pricing, no surprise platform fees, no rev-share kickback to category leaders. The first month after listing is on us so you can see the conversion data before we charge.'
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Already on BYRO')),
        h('div', { class: 'logo-strip' },
          ...logos.map(l => h('span', { class: 'logo-pill' }, l))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Apply')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Tell us about your robot.'),
        form
      )
    );
  }

  function IndustrialPage() {
    const tiers = [
      { k: 'Standard',    rate: '10%', range: 'Under $10k SKU price', who: 'Consumer-grade robots and prosumer tools.' },
      { k: 'Industrial',  rate: '8%',  range: '$10k–$50k SKU price',  who: 'Commercial cleaning, last-mile delivery, lab automation.' },
      { k: 'Heavy',       rate: '5%',  range: '$50k+ SKU price',      who: 'Humanoid platforms, warehouse fleets, large mobile manipulators.' }
    ];

    const form = FormStack({ successMessage: 'Thanks — Erik from our industrial team will be in touch within 24 hours.' },
      h('div', { class: 'form-row' },
        FormField('Company name', h('input', { type: 'text', required: true, placeholder: 'Acme Industrial' })),
        FormField('Your role',    h('input', { type: 'text', required: true, placeholder: 'Director of fleet ops, Integrator, Buyer…' }))
      ),
      h('div', { class: 'form-row' },
        FormField('Email',  h('input', { type: 'email', required: true, placeholder: 'you@company.com' })),
        FormField('Phone',  h('input', { type: 'tel',                   placeholder: 'Optional — we’ll call back same day' }))
      ),
      FormField('What are you looking to buy or sell?', h('textarea', { rows: '5', required: true, placeholder: 'Quantities, timeframes, integration constraints, dealer relationships if any.' })),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Send RFP', arrowSvg())
    );

    return h('main', { class: 'page' },
      PageHero(
        'For makers · Industrial sales',
        'Fleet sales, dealer programs, and large-ticket robots.',
        'Dedicated account management for $10k+ SKUs. We work directly with integrators, dealers, and fleet operators.'
      ),
      PageSection({},
        h('div', { class: 'why-grid' },
          h('div', { class: 'why-card' },
            h('h3', null, 'Dedicated account manager'),
            h('p', null, 'One named contact across the lifecycle of the deal. Erik Hirschmann leads industrial; he answers in under four hours during business days.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Concierge installation'),
            h('p', null, 'For $10k+ robots, we coordinate installer scheduling, site survey, and acceptance testing through partner network. Pass-through, no markup.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Net-30 enterprise terms'),
            h('p', null, 'For verified industrial buyers we offer net-30 invoicing and dedicated PO workflows. Standard credit check, decision in three business days.')
          )
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Commission tiers')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Lower rate as the SKU price climbs.'),
        h('div', { class: 'tier-grid' },
          ...tiers.map(t => h('div', { class: 'tier-card' },
            h('div', { class: 'tier-name' }, t.k),
            h('div', { class: 'tier-rate' }, t.rate),
            h('div', { class: 'tier-range' }, t.range),
            h('p', { class: 'tier-who' }, t.who)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Talk to industrial')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Send an RFP or buy intent.'),
        form
      )
    );
  }

  function PressPage() {
    const releases = [
      { date: 'Apr 18, 2026', title: 'BYRO closes $4.2M seed round to build the household robot marketplace',
        body: 'BYRO, the consumer marketplace for household robots, announced today that it has closed a $4.2 million seed round. The funding will accelerate maker onboarding and expand white-glove logistics nationwide.' },
      { date: 'Mar 02, 2026', title: 'BYRO surpasses 1,000 listings across nine verified makers',
        body: 'In its first quarter of public availability, BYRO now lists 1,427 individual robot configurations from 84 verified makers across cleaning, lawn, companion, humanoid, pet, and security categories.' },
      { date: 'Feb 14, 2026', title: 'BYRO HQ opens in downtown Denver',
        body: 'BYRO has signed a long-term lease on a 12,000-square-foot space in Denver’s LoDo district, consolidating its product, design, and maker-relations teams under one roof.' }
    ];

    return h('main', { class: 'page' },
      PageHero(
        'Company · Press',
        'BYRO in the news.',
        'Press releases, media coverage, and brand assets. For interviews and embargoed access, email press@byro.shop.'
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Press releases')),
        h('div', { class: 'release-list' },
          ...releases.map(r => h('article', { class: 'release' },
            h('div', { class: 'release-date' }, r.date),
            h('h3', { class: 'release-title' }, r.title),
            h('p', { class: 'release-body' }, r.body),
          ))
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Press contact')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '8px' } }, 'press@byro.shop'),
        h('p', { class: 'lead', style: { maxWidth: '54ch' } }, 'Same-day response for interview requests. We can put you in touch with founders, maker partners, or BYRO buyers.')
      )
    );
  }

  function ApiPage() {
    const codeSample = `# List robots in the cleaning category, in stock, top-rated\ncurl https://api.byro.shop/v1/robots \\\n  -G \\\n  -d category=cleaning \\\n  -d in_stock=true \\\n  -d sort=rating \\\n  -H "Authorization: Bearer $BYRO_KEY"`;

    const surface = [
      { k: 'GET /v1/robots',     v: 'Browse the full catalog with filtering by category, brand, price, rating, and availability.' },
      { k: 'GET /v1/robots/:id', v: 'Full robot detail including specs, reviews, financing terms, and current inventory.' },
      { k: 'POST /v1/orders',    v: 'Create an order for a logged-in BYRO customer. Returns the order id and shipping status.' },
      { k: 'GET /v1/orders/:id', v: 'Look up an order. Includes maker fulfillment status and tracking once shipped.' },
      { k: 'POST /v1/webhooks',  v: 'Subscribe to order, inventory, and listing-change events delivered to your endpoint.' }
    ];

    const form = FormStack({ successMessage: 'On the list. We will email when the public beta opens.' },
      h('div', { class: 'form-row' },
        FormField('Your name', h('input', { type: 'text', required: true, placeholder: 'Name' })),
        FormField('Email',     h('input', { type: 'email', required: true, placeholder: 'you@company.com' }))
      ),
      FormField('What are you building?', h('textarea', { rows: '4', placeholder: 'Optional — affiliate integration, comparison tool, internal procurement, robot research…' })),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Request early access', arrowSvg())
    );

    return h('main', { class: 'page' },
      PageHero(
        'For makers · API',
        'BYRO API · public beta in Q4 2026.',
        'Programmatic access to the entire BYRO marketplace. Catalog, inventory, orders, and webhooks.'
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Sample request')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '20px' } }, 'A GET away.'),
        h('pre', { class: 'code-block' }, codeSample)
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Surface')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'What ships in the beta.'),
        h('dl', { class: 'api-dl' },
          ...surface.flatMap(s => [
            h('dt', null, s.k),
            h('dd', null, s.v)
          ])
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Early access')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Get on the list.'),
        h('p', { class: 'lead', style: { maxWidth: '60ch', marginBottom: '24px' } },
          'First wave of API keys ships in October 2026. We will prioritize comparison tools, affiliate integrations, and procurement systems for property managers.'
        ),
        form
      )
    );
  }

  // ============================================================
  //                       COMPANY pages
  //   AboutPage, CareersPage, SupportPage, PrivacyPage
  // ============================================================

  function AboutPage() {
    const values = [
      { k: 'One marketplace, not a sea of tabs',  v: 'Every category, every maker, one cart. The robot is the product, not the brand’s storefront.' },
      { k: 'Honest reviews only',                  v: 'No paid placements, no sponsored top spots. Reviews come from verified owners, full stop.' },
      { k: 'Real returns, no scripts',             v: '30-day try-at-home on every robot. If it doesn’t work in your space, send it back. No call-center friction.' },
      { k: 'No quote forms',                        v: 'Buying a $1,500 vacuum should be as easy as buying a $40 toaster. Pricing is published, financing is in-line, the buy button works.' }
    ];
    const team = [
      { name: 'Ted O’Brien', role: 'Founder', bio: 'Building BYRO out of Denver after watching too many people call three “dealer hotlines” to price the same robot. Previously a project manager at Daita Dynamics. Studied finance and real estate at CU Boulder.' }
    ];

    return h('main', { class: 'page' },
      PageHero(
        'Company · About',
        'Why BYRO exists.',
        'We make every household robot easy to find, fair to compare, and simple to buy. One marketplace, every maker, real reviews from real homes.'
      ),
      PageSection({},
        h('div', { class: 'about-grid' },
          h('div', { class: 'about-main' },
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'The story')),
            h('h2', { class: 'h3', style: { marginTop: '12px' } }, 'Built in Denver, for everyday people.'),
            Prose([
              'In 2025 we watched a friend spend three weeks comparing four robot vacuums across five manufacturer sites. Each site insisted theirs was the best. Each had a dealer locator instead of a buy button. Each used a different vocabulary for the same specs.',
              'That market existed before for cars, before Carvana. It existed for furniture, before Wayfair. It existed for everything, before Amazon. We thought it was time someone built the same thing for the robots people are about to fill their homes with.',
              { tag: 'quote', text: '“The right marketplace makes the category itself feel real. That is what we are doing for household robots.” — Ted O’Brien' },
              'BYRO opened to the public in early 2026 with 47 verified makers and 1,427 robot configurations. We added the humanoid category two months later. We will not stop until everything that drives, walks, mops, or rolls in a home is on one shelf.'
            ])
          ),
          h('div', { class: 'about-side' },
            h('div', { class: 'about-stat' },
              h('div', { class: 'v' }, '2026'),
              h('div', { class: 'l' }, 'Founded')
            ),
            h('div', { class: 'about-stat' },
              h('div', { class: 'v' }, 'Denver, CO'),
              h('div', { class: 'l' }, 'Headquarters')
            ),
            h('div', { class: 'about-stat' },
              h('div', { class: 'v' }, '14'),
              h('div', { class: 'l' }, 'People')
            ),
            h('div', { class: 'about-stat' },
              h('div', { class: 'v' }, '84 / 1,427'),
              h('div', { class: 'l' }, 'Makers · listings')
            )
          )
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Values')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Four things we will not move on.'),
        h('div', { class: 'value-grid' },
          ...values.map((v, i) => h('div', { class: 'value-card' },
            h('div', { class: 'value-num' }, String(i + 1).padStart(2, '0')),
            h('h3', null, v.k),
            h('p', null, v.v)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Team')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Small, opinionated, in the same room.'),
        h('div', { class: 'team-grid' },
          ...team.map(t => h('div', { class: 'team-card' },
            h('div', { class: 'team-avatar' }, t.name.split(' ').map(s => s[0]).join('').slice(0, 2)),
            h('div', { class: 'team-name' }, t.name),
            h('div', { class: 'team-role' }, t.role),
            h('p', { class: 'team-bio' }, t.bio)
          ))
        )
      )
    );
  }

  function CareersPage() {
    const roles = [
      { title: 'Senior Frontend Engineer', loc: 'Denver, CO · hybrid',    salary: '$160k–$210k + equity',
        body: 'Own the customer-facing storefront. Ship reactively without a build step today; design the migration to Next.js as we scale. Care about typography and motion the way some people care about test coverage.' },
      { title: 'Brand Designer',           loc: 'Denver, CO · onsite 3d/wk', salary: '$110k–$150k + equity',
        body: 'Define the BYRO visual system across web, retail packaging, and the maker onboarding kit. Two designers on the team — you make it three.' },
      { title: 'Operations Manager',       loc: 'Denver, CO · onsite',     salary: '$120k–$160k + equity',
        body: 'Run maker onboarding, listing QA, and the white-glove logistics partner network. You will set up systems that scale 10× without doubling headcount.' },
      { title: 'Maker Relations Lead',     loc: 'Remote (US) · light travel', salary: '$140k–$190k + equity',
        body: 'Bring on the next 100 makers. Travel to maker HQs, run the diligence checklist, sit with founders to map BYRO into their channel strategy. Half-product, half-sales role.' }
    ];

    return h('main', { class: 'page' },
      PageHero(
        'Company · Careers',
        'Build the robot marketplace.',
        'We are 14 people in Denver building the marketplace household robots deserve. Below are the four roles open today.'
      ),
      PageSection({},
        h('div', { class: 'why-grid' },
          h('div', { class: 'why-card' },
            h('h3', null, 'Real ownership'),
            h('p', null, 'Everyone is at the table for product decisions. The customer is the boss; the loudest opinion in the room is not.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Comp that respects you'),
            h('p', null, 'Top-of-band cash plus meaningful equity. We publish the salary band on every role and we hire inside it.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Health + time'),
            h('p', null, 'Full health, dental, vision, $250/mo wellness stipend, four weeks PTO, full December off as a company.')
          )
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Open roles')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Four hires we are making this quarter.'),
        h('div', { class: 'role-grid' },
          ...roles.map(r => h('article', { class: 'role-card' },
            h('div', { class: 'role-head' },
              h('h3', { class: 'role-title' }, r.title),
              h('div', { class: 'role-meta' }, h('span', null, r.loc), h('span', null, '·'), h('span', null, r.salary))
            ),
            h('p', { class: 'role-body' }, r.body),
            h('button', {
              class: 'btn btn-ink btn-arrow',
              onclick: () => alert('Email careers@byro.shop with the role name as the subject — we read everything.')
            }, 'Apply', arrowSvg())
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'How to apply')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '12px' } }, 'careers@byro.shop'),
        h('p', { class: 'lead', style: { maxWidth: '60ch' } },
          'Send a paragraph about why this role and a link or attachment that shows your work. No cover letter required. We respond within five business days.'
        )
      )
    );
  }

  function SupportPage() {
    const faqs = [
      { q: 'How does the 30-day try-at-home work?',
        a: 'Every robot on BYRO ships with a 30-day at-home trial. If it does not fit your space, your floor type, or your household, request a return inside your BYRO dashboard and we send a prepaid label. Refunds clear within five business days of the robot arriving at the maker’s warehouse.' },
      { q: 'How does BYRO financing work?',
        a: 'Eligible robots show a monthly payment alongside the sticker price. Financing is provided by our partner, Affirm, with rates from 0% APR for 24 months on qualified buyers. Approval is instant via a soft credit pull that does not affect your score.' },
      { q: 'What if my robot breaks?',
        a: 'Year-one warranty is included on every robot and handled by the maker. BYRO will coordinate the warranty claim if you contact our concierge first; for out-of-warranty repairs, we maintain a partner network in 27 metros.' },
      { q: 'How is shipping handled?',
        a: 'BYRO arranges free standard shipping on every order. Most consumer robots arrive in three business days. Industrial and humanoid robots may require freight scheduling — your concierge will coordinate.' },
      { q: 'Do you install the robot for me?',
        a: 'For robots under $1,500 we provide a 30-minute concierge setup call by video. For robots $1,500+ we include a one-hour on-site setup visit in 27 metros at no charge. Outside those metros we coordinate a third-party installer at cost.' },
      { q: 'Will my BYRO robot work with my existing smart-home app?',
        a: 'Every robot page lists native app and integration support (HomeKit, Matter, Alexa, Google Home). If a robot does not work with what you already use, the spec table will say so before you check out.' },
      { q: 'How do I change my account email or password?',
        a: 'From your dashboard go to Account → Login and security. Email changes require a verification step sent to both the old and new addresses; password resets can be done from the sign-in page at any time.' },
      { q: 'What is BYRO concierge?',
        a: 'A real person you can reach by phone, email, or chat about anything robot-related — pre-purchase advice, sizing for your floor plan, returns, warranty, scheduled service. Available 7am–7pm MT, every day.' }
    ];

    const form = FormStack({ successMessage: 'Got it — your concierge will reply within one business hour.' },
      h('div', { class: 'form-row' },
        FormField('Your name',    h('input', { type: 'text', required: true, placeholder: 'Name' })),
        FormField('Email',        h('input', { type: 'email', required: true, placeholder: 'you@example.com' }))
      ),
      FormField('What do you need help with?', h('select', { required: true },
        h('option', { value: '' }, 'Choose one'),
        h('option', null, 'Pre-purchase advice'),
        h('option', null, 'Return / try-at-home'),
        h('option', null, 'Order status'),
        h('option', null, 'Warranty / repair'),
        h('option', null, 'Account / billing'),
        h('option', null, 'Something else')
      )),
      FormField('Tell us more', h('textarea', { rows: '5', required: true, placeholder: 'Share order number, robot model, and what is happening.' })),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Send to concierge', arrowSvg())
    );

    return h('main', { class: 'page' },
      PageHero(
        'Company · Support',
        'Help, when you need it.',
        'Real concierge support for every robot we sell. Find an answer below or get a person in under an hour.'
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Frequently asked')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Most folks find their answer here.'),
        Faq(faqs)
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'support-contact-grid' },
          h('div', null,
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Talk to a person')),
            h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '14px' } }, 'BYRO Concierge'),
            h('div', { class: 'support-line' }, h('span', { class: 'k' }, 'Phone'), h('span', { class: 'v' }, '+1 (303) 555-BYRO')),
            h('div', { class: 'support-line' }, h('span', { class: 'k' }, 'Email'), h('span', { class: 'v' }, 'help@byro.shop')),
            h('div', { class: 'support-line' }, h('span', { class: 'k' }, 'Hours'), h('span', { class: 'v' }, '7am–7pm MT, every day')),
            h('div', { class: 'support-line' }, h('span', { class: 'k' }, 'Status'), h('span', { class: 'v' }, 'status.byro.shop'))
          ),
          form
        )
      )
    );
  }

  // ============================================================
  //                       BYRO APP page
  //   The differentiator: one app for every robot you own.
  // ============================================================

  function AppPage() {
    const why = [
      { k: 'One warranty file',
        v: 'Every robot you buy through BYRO ships with the purchase date, serial number, and warranty terms already loaded in your app. No more digging through Gmail for the receipt from a vacuum you bought in 2024.' },
      { k: 'Cross-maker troubleshooting',
        v: 'Your Roomba won’t dock and your Loona keeps disconnecting? The BYRO app sees both. Our diagnostics catch the cross-device culprit — overlapping wifi channels, sleep-mode collisions, app version drift — and tell you what to do.' },
      { k: 'A real person, one tap away',
        v: 'Stuck on something the in-app fix can’t solve? Tap Concierge and a BYRO support specialist gets your full robot inventory, purchase history, and the recent diagnostic in front of them before they answer the call.' }
    ];

    const connectSteps = [
      { n: '01 · BUY',          t: 'Buy through BYRO, auto-linked.',         body: 'Every robot you purchase on BYRO is added to your app the moment it ships, with the warranty start date, model, and serial pre-filled.' },
      { n: '02 · BRING THE REST', t: 'Add robots you already own.',           body: 'Scan the maker’s in-box QR code, enter a serial number, or import your purchase email. Most makers light up in under a minute.' },
      { n: '03 · TALK TO THE MAKERS', t: 'We integrate with their software so you don’t have to.', body: 'BYRO holds direct API integrations with Roborock, iRobot, Eufy, Husqvarna, KEYi, Sony, Mammotion, Enabot — and growing. Live status, error codes, and over-the-air updates surface in one place.' }
    ];

    const capabilities = [
      { t: 'Live status, every robot',          b: 'See which robots are running, charging, stuck, or offline at a glance. Quiet alerts when something needs you.' },
      { t: 'Two-tap warranty claims',           b: 'BYRO files the claim with the maker on your behalf, attaches your purchase record, and tracks the resolution. You approve the outcome.' },
      { t: 'Service history that follows you',  b: 'Every firmware update, error code, and repair logged automatically. Sells the robot one day? Hand over the full record.' },
      { t: 'Cross-device routines',             b: 'Tell your vacuum to wait until your dog robot is asleep. Tell your mower not to start during a security patrol. We route the intent across maker APIs.' },
      { t: 'Schedule installs and service',     b: 'Book a BYRO concierge install or a partner technician straight from the robot’s page. No phone calls, no maker-by-maker portals.' },
      { t: 'Renewals, recalls, and tips',       b: 'Filter replacement reminders, official recall alerts, and BYRO-curated owner tips — once, for every robot you own.' }
    ];

    const integrations = ['Roborock','iRobot','Eufy','Dreame','Mammotion','Husqvarna','Segway','KEYi','Sony','Casio','Miko','Enabot','1X','Unitree','Figure'];

    const form = FormStack({ successMessage: 'You’re on the list. We’ll email you when the app opens to beta.' },
      h('div', { class: 'form-row' },
        FormField('Your name', h('input', { type: 'text', required: true, placeholder: 'Name' })),
        FormField('Email',     h('input', { type: 'email', required: true, placeholder: 'you@example.com' }))
      ),
      FormField('Which robots do you own today?', h('textarea', { rows: '3', placeholder: 'Optional — we use this to prioritize maker integrations.' })),
      h('div', { class: 'form-row' },
        FormField('Phone preference', h('select', null,
          h('option', null, 'iOS only'),
          h('option', null, 'Android only'),
          h('option', null, 'Both'),
          h('option', null, 'No preference')
        )),
        FormField('How soon do you need this?', h('select', null,
          h('option', null, 'Yesterday'),
          h('option', null, 'This year'),
          h('option', null, 'Just curious')
        ))
      ),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Join the waitlist', arrowSvg())
    );

    // Phone mockup: typographic placeholder for the app interface
    const phone = h('div', { class: 'app-phone' },
      h('div', { class: 'app-phone-screen' },
        h('div', { class: 'app-phone-statusbar' }, h('span', null, '9:41'), h('span', null, '●●●')),
        h('div', { class: 'app-phone-header' },
          h('div', { class: 'app-phone-eyebrow' }, 'YOUR ROBOTS · 4 ACTIVE'),
          h('div', { class: 'app-phone-title' }, 'Good morning, Ted.')
        ),
        h('div', { class: 'app-phone-list' },
          h('div', { class: 'app-phone-row' },
            h('div', { class: 'app-phone-row-mark', style: { background: 'hsl(20, 22%, 88%)' } }, 'R'),
            h('div', { class: 'app-phone-row-body' },
              h('div', { class: 'app-phone-row-name' }, 'Roborock S8 Pro Ultra'),
              h('div', { class: 'app-phone-row-meta' }, 'Cleaning · 38 min left')
            ),
            h('div', { class: 'app-phone-row-status', style: { background: 'var(--positive)' } })
          ),
          h('div', { class: 'app-phone-row' },
            h('div', { class: 'app-phone-row-mark', style: { background: 'hsl(140, 22%, 88%)' } }, 'L'),
            h('div', { class: 'app-phone-row-body' },
              h('div', { class: 'app-phone-row-name' }, 'Loona Petbot'),
              h('div', { class: 'app-phone-row-meta' }, 'Idle · battery 84%')
            ),
            h('div', { class: 'app-phone-row-status', style: { background: 'var(--ink-4)' } })
          ),
          h('div', { class: 'app-phone-row' },
            h('div', { class: 'app-phone-row-mark', style: { background: 'hsl(60, 22%, 88%)' } }, 'M'),
            h('div', { class: 'app-phone-row-body' },
              h('div', { class: 'app-phone-row-name' }, 'LUBA AWD 5000'),
              h('div', { class: 'app-phone-row-meta' }, 'Charging · next run 4:00 PM')
            ),
            h('div', { class: 'app-phone-row-status', style: { background: 'var(--ink-4)' } })
          ),
          h('div', { class: 'app-phone-row alert' },
            h('div', { class: 'app-phone-row-mark', style: { background: 'hsl(260, 22%, 88%)' } }, 'aibo'),
            h('div', { class: 'app-phone-row-body' },
              h('div', { class: 'app-phone-row-name' }, 'aibo ERS-1000'),
              h('div', { class: 'app-phone-row-meta' }, 'Firmware update needed · 1 tap')
            ),
            h('div', { class: 'app-phone-row-status', style: { background: '#E8530E' } })
          )
        ),
        h('div', { class: 'app-phone-fab' }, 'Concierge')
      )
    );

    return h('main', { class: 'page' },
      PageHero(
        'BYRO · The app',
        h('h1', { class: 'page-hero-title' }, 'Every robot you own. One app.'),
        'The BYRO app talks directly to your robots’ makers so warranty, troubleshooting, history, and concierge live in one place. Coming Q1 2027 on iOS and Android.'
      ),
      PageSection({},
        h('div', { class: 'app-hero-grid' },
          h('div', { class: 'app-hero-copy' },
            h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Why it matters')),
            h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '14px' } }, 'Stop juggling six apps you barely remember the password to.'),
            h('p', { class: 'lead', style: { maxWidth: '52ch' } },
              'Buy a robot today and you also commit to learning a new app, hunting down a warranty receipt, and bookmarking a support phone number. Multiply that by every robot you’ll own this decade. BYRO collapses all of it into one app you already trust.'
            )
          ),
          phone
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Three things it does today')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'The basics, in one inbox.'),
        h('div', { class: 'why-grid' },
          ...why.map(w => h('div', { class: 'why-card' },
            h('h3', null, w.k),
            h('p', null, w.v)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'How it connects')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Three steps, then it works.'),
        h('div', { class: 'steps' },
          ...connectSteps.map(s => h('div', { class: 'step' },
            h('div', { class: 'num' }, s.n),
            h('h3', null, s.t),
            h('p', null, s.body)
          ))
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Capabilities')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'What you actually do in the app.'),
        h('div', { class: 'cap-grid' },
          ...capabilities.map(c => h('div', { class: 'cap-card' },
            h('h3', null, c.t),
            h('p', null, c.b)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Maker integrations at launch')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '20px' } }, 'Fifteen brands, day one.'),
        h('p', { class: 'lead', style: { maxWidth: '60ch', marginBottom: '20px' } },
          'Direct API integrations are live with these makers today and shipping with the v1 app. New brands roll out monthly — vote for yours on the waitlist form.'
        ),
        h('div', { class: 'logo-strip' },
          ...integrations.map(l => h('span', { class: 'logo-pill' }, l))
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Get on the list')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '12px' } }, 'Early access opens this fall.'),
        h('p', { class: 'lead', style: { maxWidth: '60ch', marginBottom: '24px' } },
          'First wave of beta invites ships to BYRO buyers and waitlist members in October 2026. Public launch on iOS and Android in Q1 2027.'
        ),
        form
      )
    );
  }

  // ============================================================
  //                      CART / CHECKOUT / ACCOUNT
  // ============================================================

  function CartPage() {
    const lines = cartLines();
    const subtotal = cartSubtotal();
    const subtotalMonthly = lines.reduce((s, l) => s + (l.robot.monthly || 0) * l.qty, 0);

    if (lines.length === 0) {
      return h('main', { class: 'page' },
        PageHero(
          'Marketplace · Cart',
          'Your cart is empty.',
          'Once you add a robot, it lands here. Free shipping and 30-day try-at-home come with every order.'
        ),
        PageSection({},
          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            h('a', { class: 'btn btn-ink btn-lg btn-arrow', href: '#/browse' }, 'Browse robots', arrowSvg()),
            h('a', { class: 'btn btn-lg', href: '#/featured' }, 'See featured picks')
          )
        )
      );
    }

    const linesEl = h('div', { class: 'cart-lines' });

    function renderLines() {
      linesEl.innerHTML = '';
      const fresh = cartLines();
      fresh.forEach(line => {
        const dec = h('button', { class: 'qty-btn', 'aria-label': 'Decrease' }, '−');
        const inc = h('button', { class: 'qty-btn', 'aria-label': 'Increase' }, '+');
        const qtyVal = h('span', { class: 'qty-val' }, String(line.qty));
        dec.addEventListener('click', () => { setQty(line.id, line.qty - 1); renderLines(); });
        inc.addEventListener('click', () => { setQty(line.id, line.qty + 1); renderLines(); });

        const removeBtn = h('button', { class: 'cart-remove' }, 'Remove');
        removeBtn.addEventListener('click', () => { removeFromCart(line.id); renderLines(); });

        const lineTotal = fmtMoney((line.robot.price || 0) * line.qty);

        linesEl.appendChild(h('article', { class: 'cart-line' },
          h('a', { class: 'cart-photo', href: '#/product/' + line.robot.id }, robotPlaceholder(line.robot)),
          h('div', { class: 'cart-body' },
            h('div', { class: 'cart-brand' }, line.robot.brand),
            h('a', { class: 'cart-name', href: '#/product/' + line.robot.id }, line.robot.name),
            h('div', { class: 'cart-tagline' }, line.robot.tagline),
            h('div', { class: 'cart-actions' },
              h('div', { class: 'qty-stepper' }, dec, qtyVal, inc),
              removeBtn
            )
          ),
          h('div', { class: 'cart-line-price' },
            h('div', { class: 'cart-line-total' }, lineTotal),
            line.robot.monthly
              ? h('div', { class: 'cart-line-monthly' }, 'or ' + fmtMonthly(line.robot.monthly * line.qty))
              : null
          )
        ));
      });

      // Update totals
      const freshSubtotal = cartSubtotal();
      const freshMonthly = cartLines().reduce((s, l) => s + (l.robot.monthly || 0) * l.qty, 0);
      const subEl = document.querySelector('.cart-summary .subtotal-val');
      const monEl = document.querySelector('.cart-summary .monthly-val');
      const totEl = document.querySelector('.cart-summary .total-val');
      if (subEl) subEl.textContent = fmtMoney(freshSubtotal);
      if (monEl) monEl.textContent = freshMonthly > 0 ? 'or ' + fmtMonthly(freshMonthly) : '—';
      if (totEl) totEl.textContent = fmtMoney(freshSubtotal);

      if (cartLines().length === 0) {
        // Auto-navigate to empty state if last item removed
        route();
      }
    }

    renderLines();

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · Cart',
        'Your cart.',
        cartCount() + (cartCount() === 1 ? ' robot' : ' robots') + ' ready to ship. Adjust quantities or remove anything you change your mind on.'
      ),
      PageSection({},
        h('div', { class: 'cart-grid' },
          linesEl,
          h('aside', { class: 'cart-summary' },
            h('div', { class: 'cart-summary-card' },
              h('h3', null, 'Order summary'),
              h('div', { class: 'cart-sum-row' },
                h('span', { class: 'k' }, 'Subtotal'),
                h('span', { class: 'v subtotal-val' }, fmtMoney(subtotal))
              ),
              h('div', { class: 'cart-sum-row' },
                h('span', { class: 'k' }, 'Shipping'),
                h('span', { class: 'v' }, 'Free')
              ),
              h('div', { class: 'cart-sum-row' },
                h('span', { class: 'k' }, 'Try-at-home'),
                h('span', { class: 'v' }, '30 days, free returns')
              ),
              h('div', { class: 'cart-sum-divider' }),
              h('div', { class: 'cart-sum-row total' },
                h('span', { class: 'k' }, 'Total'),
                h('span', { class: 'v total-val' }, fmtMoney(subtotal))
              ),
              h('div', { class: 'cart-sum-monthly' },
                h('span', { class: 'k' }, 'or finance'),
                h('span', { class: 'v monthly-val' }, subtotalMonthly > 0 ? 'or ' + fmtMonthly(subtotalMonthly) : '—')
              ),
              h('a', { class: 'btn btn-ink btn-lg btn-arrow cart-checkout', href: '#/checkout' }, 'Proceed to checkout', arrowSvg()),
              h('div', { class: 'cart-trust' },
                h('span', null, '• Free shipping'),
                h('span', null, '• 30-day try-at-home'),
                h('span', null, '• 0% APR available')
              )
            )
          )
        )
      )
    );
  }

  function CheckoutPage() {
    const lines = cartLines();
    if (lines.length === 0) {
      window.location.hash = '#/cart';
      return h('main', { class: 'page' });
    }
    const subtotal = cartSubtotal();
    const subtotalMonthly = lines.reduce((s, l) => s + (l.robot.monthly || 0) * l.qty, 0);

    const form = h('form', {
      class: 'form-stack checkout-form',
      onsubmit: (e) => {
        e.preventDefault();
        const orderId = 'B' + Math.floor(Math.random() * 90000 + 10000) + '-' + new Date().getFullYear();
        sessionStorage.setItem('byro.lastOrder', JSON.stringify({
          id: orderId,
          items: cartLines(),
          subtotal: cartSubtotal(),
          placedAt: new Date().toISOString()
        }));
        clearCart();
        window.location.hash = '#/order-confirmed';
      }
    },
      h('h3', { class: 'co-section-title' }, '1. Contact'),
      h('div', { class: 'form-row' },
        FormField('Email',     h('input', { type: 'email', required: true, placeholder: 'you@example.com' })),
        FormField('Phone',     h('input', { type: 'tel',                   placeholder: 'Optional' }))
      ),

      h('h3', { class: 'co-section-title' }, '2. Shipping address'),
      h('div', { class: 'form-row' },
        FormField('First name', h('input', { type: 'text', required: true })),
        FormField('Last name',  h('input', { type: 'text', required: true }))
      ),
      FormField('Street address', h('input', { type: 'text', required: true, placeholder: '1700 Wynkoop St, Unit 200' })),
      h('div', { class: 'form-row' },
        FormField('City',   h('input', { type: 'text', required: true })),
        FormField('State',  h('input', { type: 'text', required: true, placeholder: 'CO' }))
      ),
      h('div', { class: 'form-row' },
        FormField('ZIP',    h('input', { type: 'text', required: true, placeholder: '80202' })),
        FormField('Country',h('input', { type: 'text', value: 'United States', readonly: true }))
      ),

      h('h3', { class: 'co-section-title' }, '3. Payment'),
      FormField('Card number',     h('input', { type: 'text', required: true, placeholder: '4242 4242 4242 4242', autocomplete: 'off' }), 'Demo only — no charge is made.'),
      h('div', { class: 'form-row' },
        FormField('Expiry (MM/YY)', h('input', { type: 'text', required: true, placeholder: '12/27' })),
        FormField('CVC',            h('input', { type: 'text', required: true, placeholder: '123' }))
      ),

      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Place order · ' + fmtMoney(subtotal), arrowSvg()),
      h('p', { class: 'co-disclaimer' }, 'This is a demo checkout — no card is charged and no real order is placed.')
    );

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · Checkout',
        'Last step.',
        cartCount() + (cartCount() === 1 ? ' robot' : ' robots') + ' for ' + fmtMoney(subtotal) + '. Free shipping, 30-day try-at-home, no signature required.'
      ),
      PageSection({},
        h('div', { class: 'cart-grid' },
          form,
          h('aside', { class: 'cart-summary' },
            h('div', { class: 'cart-summary-card' },
              h('h3', null, 'Order summary'),
              ...lines.map(line => h('div', { class: 'co-line' },
                h('div', { class: 'co-line-name' }, line.robot.brand + ' ' + line.robot.name),
                h('div', { class: 'co-line-qty' }, 'Qty ' + line.qty),
                h('div', { class: 'co-line-price' }, fmtMoney((line.robot.price || 0) * line.qty))
              )),
              h('div', { class: 'cart-sum-divider' }),
              h('div', { class: 'cart-sum-row' },
                h('span', { class: 'k' }, 'Subtotal'),
                h('span', { class: 'v' }, fmtMoney(subtotal))
              ),
              h('div', { class: 'cart-sum-row' },
                h('span', { class: 'k' }, 'Shipping'),
                h('span', { class: 'v' }, 'Free')
              ),
              h('div', { class: 'cart-sum-row total' },
                h('span', { class: 'k' }, 'Total'),
                h('span', { class: 'v' }, fmtMoney(subtotal))
              ),
              subtotalMonthly > 0
                ? h('div', { class: 'cart-sum-monthly' },
                    h('span', { class: 'k' }, 'or finance'),
                    h('span', { class: 'v' }, 'or ' + fmtMonthly(subtotalMonthly))
                  )
                : null
            )
          )
        )
      )
    );
  }

  function OrderConfirmedPage() {
    let lastOrder = null;
    try { lastOrder = JSON.parse(sessionStorage.getItem('byro.lastOrder') || 'null'); }
    catch (e) { lastOrder = null; }

    if (!lastOrder) {
      // Direct visit without a recent order — bounce to home
      return h('main', { class: 'page' },
        PageHero(
          'Marketplace · Order',
          'No recent order found.',
          'Looks like you landed here without placing an order. Head back to browse the marketplace.'
        ),
        PageSection({},
          h('a', { class: 'btn btn-ink btn-lg btn-arrow', href: '#/' }, 'Back to home', arrowSvg())
        )
      );
    }

    return h('main', { class: 'page' },
      h('section', { class: 'page-hero compact order-confirmed-hero' },
        h('div', { class: 'wrap' },
          h('div', { class: 'check-mark', 'aria-hidden': 'true' }, '✓'),
          h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Order placed · ' + lastOrder.id)),
          h('h1', { class: 'page-hero-title' }, 'Thanks. You did it.'),
          h('p', { class: 'page-hero-sub' },
            'A confirmation email is on its way. You can track the shipment from your BYRO dashboard once the maker hands it off to the carrier.'
          )
        )
      ),
      PageSection({},
        h('div', { class: 'why-grid' },
          h('div', { class: 'why-card' },
            h('h3', null, 'What happens next'),
            h('p', null, 'BYRO routes your order to the maker now. You will get a ship-confirmation email with tracking inside three business days.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Your 30-day window'),
            h('p', null, 'Once the robot arrives, the try-at-home clock starts. Decide it is not for you? Request a prepaid return label from your dashboard.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Setup help on call'),
            h('p', null, 'Your concierge will reach out within 48 hours to schedule a 30-minute setup walkthrough or, on $1,500+ robots, an on-site install.')
          )
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'What you ordered')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '20px' } },
          (lastOrder.items.length) + (lastOrder.items.length === 1 ? ' robot' : ' robots') + ' · ' + fmtMoney(lastOrder.subtotal)
        ),
        h('div', { class: 'co-summary-list' },
          ...lastOrder.items.map(line => h('div', { class: 'co-line' },
            h('div', { class: 'co-line-name' }, line.robot.brand + ' ' + line.robot.name),
            h('div', { class: 'co-line-qty' }, 'Qty ' + line.qty),
            h('div', { class: 'co-line-price' }, fmtMoney((line.robot.price || 0) * line.qty))
          ))
        )
      ),
      PageSection({},
        h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          h('a', { class: 'btn btn-ink btn-lg btn-arrow', href: '#/browse' }, 'Continue browsing', arrowSvg()),
          h('a', { class: 'btn btn-lg', href: '#/support' }, 'Reach the concierge')
        )
      )
    );
  }

  function AccountPage() {
    const form = FormStack({ successMessage: 'You’re on the list — we’ll email when sign-in opens.' },
      h('div', { class: 'form-row' },
        FormField('Email',  h('input', { type: 'email', required: true, placeholder: 'you@example.com' })),
        FormField('Name',   h('input', { type: 'text',                   placeholder: 'Optional' }))
      ),
      h('button', { type: 'submit', class: 'btn btn-ink btn-lg btn-arrow' }, 'Join the waitlist', arrowSvg())
    );

    return h('main', { class: 'page' },
      PageHero(
        'Company · Account',
        'BYRO accounts · beta in Q3 2026.',
        'Sign-in, saved searches, order history, and the BYRO app all live behind a free account. Public sign-up opens this fall — drop your email to be first in.'
      ),
      PageSection({},
        h('div', { class: 'why-grid' },
          h('div', { class: 'why-card' },
            h('h3', null, 'One inbox, every order'),
            h('p', null, 'Every robot you buy through BYRO shows up in your account with warranty, ship date, and concierge thread — even before the app launches.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Saved searches + price drops'),
            h('p', null, 'Track a robot you’re thinking about. We notify when the price moves, when reviews cross a threshold, or when a better model arrives in its category.')
          ),
          h('div', { class: 'why-card' },
            h('h3', null, 'Bring your existing robots'),
            h('p', null, 'Add the robots you already own (Roomba, Husqvarna, aibo, whatever) so concierge and the upcoming BYRO app already know your inventory.')
          )
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Join the waitlist')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '20px' } }, 'First wave of invites ships in September.'),
        form
      )
    );
  }

  function HowItWorksPage() {
    const steps = [
      { n: 'BROWSE',    t: 'Side by side, all in one place.',
        body: 'Compare every robot in a category on one page. Filter by noise, battery, square footage, real owner ratings. No dealer locator, no quote form, no five tabs to track.',
        kind: 'browse' },
      { n: 'CHECK OUT', t: 'One cart, one card, one address.',
        body: 'Buy from any maker through BYRO. Pay once, finance from $9/mo at 0% APR for 24 months on qualified buyers, or rent month-to-month on eligible models. Same checkout for a $159 desk companion and a $24,500 humanoid.',
        kind: 'checkout' },
      { n: 'UNBOX',     t: 'Set up help, on us.',
        body: '30-day try-at-home on every purchase. Free returns if it does not click. Concierge setup call within 48 hours of delivery; on-site installation included on robots $1,500 and up in 27 metros.',
        kind: 'unbox' }
    ];
    const commitments = [
      { k: 'Free shipping',         v: 'Every order, every robot' },
      { k: '30-day try-at-home',    v: 'Return free if it doesn’t click' },
      { k: 'Verified makers',       v: 'Every brand vetted by BYRO' },
      { k: 'Financing built in',    v: 'From $9/mo with soft credit pull' },
      { k: 'White-glove install',   v: 'Included on $1,500+ robots' },
      { k: 'Concierge support',     v: 'Real people, 7am–7pm MT' }
    ];

    return h('main', { class: 'page' },
      PageHero(
        'Marketplace · How it works',
        'From browse tab to living room.',
        'No dealer voicemail, no quote forms, no separate accounts at five manufacturer sites. Pick a robot, check out, and we coordinate the rest with the maker.'
      ),
      PageSection({},
        h('div', { class: 'steps' },
          ...steps.map(s => h('div', { class: 'step' },
            h('div', { class: 'num' }, s.n),
            h('div', { class: 'ill' }, HowIll(s.kind)),
            h('h3', null, s.t),
            h('p', null, s.body)
          ))
        )
      ),
      PageSection({ tone: 'soft' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Every order, every time')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '24px' } }, 'Six things BYRO commits to.'),
        h('div', { class: 'trust-strip' },
          ...commitments.map(c => h('div', { class: 'tp' },
            h('div', { class: 'k' }, c.k),
            h('div', { class: 'v' }, c.v)
          ))
        )
      ),
      PageSection({},
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), h('span', null, 'Common questions')),
        h('h2', { class: 'h3', style: { marginTop: '12px', marginBottom: '16px' } }, 'Three answers, the rest in Support.'),
        Faq([
          { q: 'How does the 30-day try-at-home work?',
            a: 'Every robot ships with a 30-day at-home trial. Request a return from your dashboard and we send a prepaid label; refunds clear within five business days of the robot arriving at the maker.' },
          { q: 'When am I charged?',
            a: 'BYRO authorizes your card at checkout and captures the charge when the robot ships from the maker’s warehouse. If you cancel before ship, the authorization drops off automatically.' },
          { q: 'Who handles warranty and repairs?',
            a: 'Year-one warranty is included on every robot and handled by the maker. BYRO concierge will coordinate the claim if you contact us first. Out-of-warranty service is available through our partner network in 27 metros.' }
        ]),
        h('div', { style: { marginTop: '28px' } },
          h('a', { class: 'btn btn-lg btn-arrow', href: '#/support' }, 'See all support topics', arrowSvg())
        )
      )
    );
  }

  function PrivacyPage() {
    return h('main', { class: 'page' },
      PageHero(
        'Company · Privacy',
        'Privacy.',
        'How BYRO collects, uses, and protects your data. Last updated June 1, 2026.'
      ),
      PageSection({},
        Prose([
          { tag: 'h2', text: 'Data we collect' },
          'When you browse BYRO without an account, we collect anonymous traffic data (pages viewed, device type, approximate region) using first-party analytics. We do not sell this data and we do not place advertising cookies.',
          'When you create an account, we collect your name, email, shipping address, and any robot reviews you write. When you buy, we collect order history and payment confirmation tokens — we do not store full card numbers; payments are processed by Stripe.',
          { tag: 'h2', text: 'How we use your data' },
          'Strictly to operate BYRO: ship your orders, coordinate warranty and returns, suggest robots you might like based on what you have viewed, and improve the site. Marketing emails are opt-in and unsubscribe is one click in every message.',
          { tag: 'h2', text: 'Sharing' },
          'We share order details with the maker who fulfills your robot (name, shipping address, items) and with shipping carriers. We do not sell or rent your data to anyone, for any reason.',
          { tag: 'h2', text: 'Cookies' },
          { tag: 'ul', items: [
            'Essential cookies for sign-in and cart state.',
            'First-party analytics cookies (anonymous traffic patterns).',
            'No third-party advertising or tracking cookies.'
          ]},
          { tag: 'h2', text: 'Your rights' },
          'You can request a copy of your data, ask us to delete your account, or correct any field at any time. Email privacy@byro.shop and we will respond within seven days.',
          { tag: 'h2', text: 'Children' },
          'BYRO is intended for adults aged 18+. We do not knowingly collect data from anyone under 13. If we learn we have, we delete it.',
          { tag: 'h2', text: 'International users' },
          'BYRO currently ships within the United States. Data is stored in U.S. data centers. If you reside in the EU/UK and create an account or contact us, we treat your data under GDPR/UK-DPA principles.',
          { tag: 'h2', text: 'Changes to this policy' },
          'We will note material changes in a banner on the homepage for at least 14 days before they take effect, and email anyone with an account.',
          { tag: 'h2', text: 'Contact' },
          'Email privacy@byro.shop or write us at: BYRO Inc., 1700 Wynkoop St #200, Denver, CO 80202.'
        ])
      )
    );
  }

  // -------------------- Scroll reveal --------------------
  function attachReveal() {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  // -------------------- Router + Mount --------------------
  function renderHome(root) {
    root.appendChild(Header());
    root.appendChild(Hero());
    root.appendChild(TrustStrip());
    root.appendChild(StatsStrip());
    root.appendChild(Categories());
    root.appendChild(Featured());
    root.appendChild(AppTeaser());
    root.appendChild(HowItWorks());
    root.appendChild(CtaBand());
    root.appendChild(FooterBlock());
  }

  function renderProduct(root, id) {
    const robot = findRobot(id);
    if (!robot) {
      // Unknown product: bounce home and keep the hash clean.
      window.location.hash = '';
      renderHome(root);
      return;
    }
    root.appendChild(Header());
    root.appendChild(ProductPage(robot));
    root.appendChild(FooterBlock());
  }

  // Map plain hash routes to a page-factory function. Product is dynamic so it stays in route().
  const ROUTES = {
    '#/browse':       BrowsePage,
    '#/featured':     FeaturedPage,
    '#/new-arrivals': NewArrivalsPage,
    '#/gift-guide':   GiftGuidePage,
    '#/sell':         SellPage,
    '#/industrial':   IndustrialPage,
    '#/press':        PressPage,
    '#/api':          ApiPage,
    '#/about':        AboutPage,
    '#/careers':      CareersPage,
    '#/support':      SupportPage,
    '#/privacy':      PrivacyPage,
    '#/how-it-works': HowItWorksPage,
    '#/app':          AppPage,
    '#/cart':         CartPage,
    '#/checkout':     CheckoutPage,
    '#/order-confirmed': OrderConfirmedPage,
    '#/account':      AccountPage
  };

  function renderPage(root, factory) {
    root.appendChild(Header());
    root.appendChild(factory());
    root.appendChild(FooterBlock());
  }

  function route() {
    const root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = '';
    window.scrollTo(0, 0);
    const fullHash = window.location.hash || '';
    const [hashPath] = fullHash.split('?');
    const productMatch = hashPath.match(/^#\/product\/(.+)/);
    if (productMatch) {
      renderProduct(root, decodeURIComponent(productMatch[1]));
    } else if (ROUTES[hashPath]) {
      renderPage(root, ROUTES[hashPath]);
    } else {
      renderHome(root);
    }
    attachReveal();
  }

  function mount() {
    route();
    window.addEventListener('hashchange', route);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
