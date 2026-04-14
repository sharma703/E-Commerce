/**
 * ═══════════════════════════════════════════════════════════════
 *  Megacart — db.js  (Client-Side Database Layer)
 *  Version : 1.0.0
 * ───────────────────────────────────────────────────────────────
 *  Provides a structured, schema-driven localStorage "database"
 *  with the following collections / tables:
 *
 *    • users      – registered accounts
 *    • session    – currently logged-in user
 *    • products   – product catalogue (seeded from PRODUCTS array)
 *    • cart       – per-user shopping cart items
 *    • orders     – placed orders with line items
 *    • wishlist   – per-user saved/wishlisted product ids
 *    • reviews    – product reviews left by users
 *
 *  All methods are synchronous to match the existing codebase.
 *  Drop this file in before script.js and login.html scripts;
 *  both files import helpers from the MegacartDB global object.
 *
 *  Usage (anywhere in the app):
 *    MegacartDB.users.register({ name, email, phone, password })
 *    MegacartDB.users.login(email, password)
 *    MegacartDB.cart.add(productId, qty)
 *    MegacartDB.orders.place()
 *    … etc.
 * ═══════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     INTERNAL CONSTANTS
  ───────────────────────────────────────────────────────────── */
  const DB_VERSION   = '1';
  const DB_PREFIX    = 'mcdb_v1_';            // namespace all keys

  const KEYS = {
    meta      : DB_PREFIX + 'meta',
    users     : DB_PREFIX + 'users',
    session   : DB_PREFIX + 'session',
    cart      : DB_PREFIX + 'cart',
    orders    : DB_PREFIX + 'orders',
    wishlist  : DB_PREFIX + 'wishlist',
    reviews   : DB_PREFIX + 'reviews',
    products  : DB_PREFIX + 'products',
    // legacy keys written by the old code — kept for migration
    _legacyUser  : 'megacart_user_v1',
    _legacyUsers : 'megacart_users_v1',
    _legacyCart  : 'megacart_cart_v1',
  };

  /* ─────────────────────────────────────────────────────────────
     LOW-LEVEL STORAGE HELPERS
  ───────────────────────────────────────────────────────────── */

  function _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[MegacartDB] read error:', key, e);
      return null;
    }
  }

  function _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[MegacartDB] write error:', key, e);
      return false;
    }
  }

  function _remove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  /** Generate a short unique id:  "mc_<timestamp><random>" */
  function _uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /** Deep clone via JSON (keeps things simple and serialisable). */
  function _clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (_) { return obj; }
  }

  /** Timestamp string for records. */
  function _now() { return new Date().toISOString(); }

  /* ─────────────────────────────────────────────────────────────
     MIGRATION — lift old localStorage keys into the new schema
  ───────────────────────────────────────────────────────────── */

  function _migrate() {
    const meta = _read(KEYS.meta);
    if (meta && meta.version === DB_VERSION) return; // already migrated

    console.info('[MegacartDB] Running migration from legacy keys…');

    // ── Users list ──────────────────────────────────────────────
    const oldUsers = _read(KEYS._legacyUsers) || [];
    const newUsers = _read(KEYS.users) || [];
    const existingEmails = new Set(newUsers.map(u => u.email));

    oldUsers.forEach(u => {
      if (u.email && !existingEmails.has(u.email)) {
        newUsers.push({
          id        : _uid('usr'),
          name      : u.name  || '',
          email     : u.email.toLowerCase().trim(),
          phone     : u.phone || '',
          password  : u.password || '',
          googleId  : u.googleId || null,
          picture   : u.picture  || null,
          role      : 'customer',
          createdAt : u.createdAt || _now(),
          updatedAt : _now(),
        });
        existingEmails.add(u.email);
      }
    });
    _write(KEYS.users, newUsers);

    // ── Session / logged-in user ─────────────────────────────────
    const oldSession = _read(KEYS._legacyUser);
    if (oldSession && oldSession.email && !_read(KEYS.session)) {
      // Find matching user record or create a minimal one
      const matched = newUsers.find(u => u.email === (oldSession.email || '').toLowerCase());
      _write(KEYS.session, matched || {
        id    : _uid('usr'),
        name  : oldSession.name  || '',
        email : (oldSession.email || '').toLowerCase(),
      });
    }

    // ── Cart ─────────────────────────────────────────────────────
    const oldCart = _read(KEYS._legacyCart) || [];
    if (oldCart.length && !(_read(KEYS.cart) || []).length) {
      const session = _read(KEYS.session);
      const uid = session ? session.id : 'guest';
      const cartRecords = oldCart.map(item => ({
        id        : _uid('ci'),
        userId    : uid,
        productId : item.id,
        name      : item.name,
        price     : item.price,
        mrp       : item.mrp,
        image     : item.image,
        qty       : item.qty,
        addedAt   : _now(),
      }));
      _write(KEYS.cart, cartRecords);
    }

    // ── Write version stamp so migration doesn't run again ────────
    _write(KEYS.meta, { version: DB_VERSION, migratedAt: _now() });
    console.info('[MegacartDB] Migration complete.');
  }

  /* ─────────────────────────────────────────────────────────────
     USERS COLLECTION
  ───────────────────────────────────────────────────────────── */

  const users = {

    _all() { return _read(KEYS.users) || []; },
    _save(list) { _write(KEYS.users, list); },

    /** Return all users (admin use). */
    getAll() { return _clone(this._all()); },

    /** Find a user by email (case-insensitive). */
    findByEmail(email) {
      const e = (email || '').toLowerCase().trim();
      return _clone(this._all().find(u => u.email === e) || null);
    },

    /** Find a user by phone. */
    findByPhone(phone) {
      const p = (phone || '').replace(/[\s\-+]/g, '');
      return _clone(this._all().find(u => u.phone === p) || null);
    },

    /** Find a user by id. */
    findById(id) {
      return _clone(this._all().find(u => u.id === id) || null);
    },

    /**
     * Register a new user.
     * Returns { ok: true, user } on success,
     * or      { ok: false, field, message } on failure.
     */
    register({ name, email, phone, password }) {
      name     = (name     || '').trim();
      email    = (email    || '').toLowerCase().trim();
      phone    = (phone    || '').replace(/[\s\-+]/g, '');
      password = (password || '');

      // Validations
      if (!name || name.length < 2)
        return { ok: false, field: 'name', message: 'Name must be at least 2 characters.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { ok: false, field: 'email', message: 'Enter a valid email address.' };
      if (phone && !/^[6-9]\d{9}$/.test(phone))
        return { ok: false, field: 'phone', message: 'Enter a valid 10-digit Indian mobile number.' };
      if (!password || password.length < 6)
        return { ok: false, field: 'password', message: 'Password must be at least 6 characters.' };

      const list = this._all();

      if (list.find(u => u.email === email))
        return { ok: false, field: 'email', message: 'An account with this email already exists.' };
      if (phone && list.find(u => u.phone === phone))
        return { ok: false, field: 'phone', message: 'This mobile number is already registered.' };

      const user = {
        id        : _uid('usr'),
        name,
        email,
        phone,
        password, // ⚠ plain text — fine for localStorage demo; use hashing in production
        googleId  : null,
        picture   : null,
        role      : 'customer',
        createdAt : _now(),
        updatedAt : _now(),
      };

      list.push(user);
      this._save(list);

      // Also keep legacy key so existing login.html code still works
      _write(KEYS._legacyUsers, list);

      // Return without password
      const { password: _p, ...safeUser } = user;
      return { ok: true, user: safeUser };
    },

    /**
     * Validate credentials.
     * Returns { ok: true, user } or { ok: false, field, message }.
     */
    login(email, password) {
      email = (email || '').toLowerCase().trim();
      const list = this._all();
      const user = list.find(u => u.email === email);

      if (user && user.password && user.password !== password)
        return { ok: false, field: 'password', message: 'Incorrect password. Please try again.' };

      if (!user) {
        // Auto-create from email (demo behaviour kept from original code)
        const firstName = email.split('@')[0]
          .replace(/[._\-]/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const autoUser = {
          id        : _uid('usr'),
          name      : firstName,
          email,
          phone     : '',
          password  : password,
          googleId  : null,
          picture   : null,
          role      : 'customer',
          createdAt : _now(),
          updatedAt : _now(),
        };
        list.push(autoUser);
        this._save(list);
        _write(KEYS._legacyUsers, list);
        const { password: _p, ...safe } = autoUser;
        return { ok: true, user: safe };
      }

      const { password: _p, ...safeUser } = user;
      return { ok: true, user: safeUser };
    },

    /**
     * Register / login via Google.
     * payload: { name, email, picture, googleId }
     */
    loginWithGoogle({ name, email, picture, googleId }) {
      email = (email || '').toLowerCase().trim();
      const list = this._all();
      let user = list.find(u => u.email === email);

      if (!user) {
        user = {
          id        : _uid('usr'),
          name      : name || email.split('@')[0],
          email,
          phone     : '',
          password  : null,
          googleId  : googleId || null,
          picture   : picture  || null,
          role      : 'customer',
          createdAt : _now(),
          updatedAt : _now(),
        };
        list.push(user);
      } else {
        // Update Google data on existing account
        user.googleId = user.googleId || googleId;
        user.picture  = user.picture  || picture;
        user.updatedAt = _now();
      }

      this._save(list);
      _write(KEYS._legacyUsers, list);
      const { password: _p, ...safeUser } = user;
      return { ok: true, user: safeUser };
    },

    /** Update user fields (name, phone, picture). Returns updated user or null. */
    update(id, fields) {
      const list = this._all();
      const idx = list.findIndex(u => u.id === id);
      if (idx === -1) return null;
      const allowed = ['name', 'phone', 'picture'];
      allowed.forEach(k => { if (fields[k] !== undefined) list[idx][k] = fields[k]; });
      list[idx].updatedAt = _now();
      this._save(list);
      _write(KEYS._legacyUsers, list);
      const { password: _p, ...safe } = list[idx];
      return safe;
    },

    /** Change password. Returns { ok, message }. */
    changePassword(id, oldPassword, newPassword) {
      const list = this._all();
      const user = list.find(u => u.id === id);
      if (!user) return { ok: false, message: 'User not found.' };
      if (user.password && user.password !== oldPassword)
        return { ok: false, message: 'Current password is incorrect.' };
      if (!newPassword || newPassword.length < 6)
        return { ok: false, message: 'New password must be at least 6 characters.' };
      user.password  = newPassword;
      user.updatedAt = _now();
      this._save(list);
      return { ok: true, message: 'Password updated.' };
    },

    /** Total number of registered users. */
    count() { return this._all().length; },
  };

  /* ─────────────────────────────────────────────────────────────
     SESSION (CURRENT USER)
  ───────────────────────────────────────────────────────────── */

  const session = {

    /** Get the currently logged-in user (or null). */
    get() { return _read(KEYS.session) || null; },

    /**
     * Start a session. Writes both the new DB key AND the
     * legacy key so existing index.html guard keeps working.
     */
    set(user) {
      _write(KEYS.session,         user);
      _write(KEYS._legacyUser,     user);   // legacy guard reads this key
    },

    /** Clear session (logout). */
    clear() {
      _remove(KEYS.session);
      _remove(KEYS._legacyUser);
    },

    /** Returns true if someone is logged in. */
    isLoggedIn() { return !!this.get(); },
  };

  /* ─────────────────────────────────────────────────────────────
     CART COLLECTION
  ───────────────────────────────────────────────────────────── */

  const cart = {

    /** Cart items are stored as a flat array of records. */
    _all()       { return _read(KEYS.cart) || []; },
    _save(items) {
      _write(KEYS.cart, items);
      // Keep legacy key in sync so existing renderCartItems() works
      const legacyFmt = items.map(i => ({
        id    : i.productId,
        name  : i.name,
        price : i.price,
        mrp   : i.mrp,
        image : i.image,
        qty   : i.qty,
      }));
      _write(KEYS._legacyCart, legacyFmt);
    },

    /** Items belonging to the current user (or guest). */
    _userId() {
      const s = session.get();
      return s ? s.id || s.email : 'guest';
    },

    myItems() {
      const uid = this._userId();
      return this._all().filter(i => i.userId === uid);
    },

    /**
     * Add a product to cart (or increment qty if already present).
     * productData: { id, name, price, mrp, image }
     */
    add(productData, qty = 1) {
      qty = Math.max(1, parseInt(qty) || 1);
      const uid  = this._userId();
      const list = this._all();
      const existing = list.find(i => i.userId === uid && i.productId === productData.id);

      if (existing) {
        existing.qty     += qty;
        existing.updatedAt = _now();
      } else {
        list.push({
          id        : _uid('ci'),
          userId    : uid,
          productId : productData.id,
          name      : productData.name,
          price     : productData.price,
          mrp       : productData.mrp   || productData.price,
          image     : productData.image || '',
          qty,
          addedAt   : _now(),
          updatedAt : _now(),
        });
      }

      this._save(list);
      return { ok: true };
    },

    /** Remove a product from cart. */
    remove(productId) {
      const uid  = this._userId();
      const list = this._all().filter(i => !(i.userId === uid && i.productId === productId));
      this._save(list);
    },

    /** Set absolute qty. Removes item if qty ≤ 0. */
    setQty(productId, qty) {
      if (qty <= 0) { this.remove(productId); return; }
      const uid  = this._userId();
      const list = this._all();
      const item = list.find(i => i.userId === uid && i.productId === productId);
      if (item) { item.qty = qty; item.updatedAt = _now(); }
      this._save(list);
    },

    /** Adjust qty by delta (+1 / -1). */
    adjustQty(productId, delta) {
      const uid  = this._userId();
      const list = this._all();
      const item = list.find(i => i.userId === uid && i.productId === productId);
      if (!item) return;
      const newQty = item.qty + delta;
      if (newQty <= 0) { this.remove(productId); return; }
      item.qty       = newQty;
      item.updatedAt = _now();
      this._save(list);
    },

    /** Clear all items in the current user's cart. */
    clear() {
      const uid  = this._userId();
      const list = this._all().filter(i => i.userId !== uid);
      this._save(list);
    },

    /** Total item count in cart. */
    totalItems() { return this.myItems().reduce((s, i) => s + i.qty, 0); },

    /** Cart subtotal in rupees. */
    subtotal() { return this.myItems().reduce((s, i) => s + i.price * i.qty, 0); },

    /** Returns items formatted the same way the legacy code expected. */
    toLegacyFormat() {
      return this.myItems().map(i => ({
        id    : i.productId,
        name  : i.name,
        price : i.price,
        mrp   : i.mrp,
        image : i.image,
        qty   : i.qty,
      }));
    },
  };

  /* ─────────────────────────────────────────────────────────────
     ORDERS COLLECTION
  ───────────────────────────────────────────────────────────── */

  const orders = {

    _all()       { return _read(KEYS.orders) || []; },
    _save(list)  { _write(KEYS.orders, list); },

    /** Place an order from the current cart. Returns the new order or null. */
    place(addressInfo) {
      const items = cart.myItems();
      if (!items.length) return { ok: false, message: 'Cart is empty.' };

      const s = session.get();
      const order = {
        id          : _uid('ord'),
        userId      : s ? (s.id || s.email) : 'guest',
        userName    : s ? s.name  : 'Guest',
        userEmail   : s ? s.email : '',
        items       : _clone(items),
        subtotal    : cart.subtotal(),
        address     : addressInfo || null,
        status      : 'placed',   // placed → shipped → delivered
        placedAt    : _now(),
        updatedAt   : _now(),
      };

      const list = this._all();
      list.push(order);
      this._save(list);
      cart.clear();

      return { ok: true, order };
    },

    /** All orders for the current user. */
    mine() {
      const s = session.get();
      if (!s) return [];
      const uid = s.id || s.email;
      return _clone(this._all().filter(o => o.userId === uid));
    },

    /** All orders (admin). */
    getAll() { return _clone(this._all()); },

    /** Get a single order by id. */
    findById(id) { return _clone(this._all().find(o => o.id === id) || null); },

    /** Update order status (admin). */
    updateStatus(id, status) {
      const list = this._all();
      const o = list.find(o => o.id === id);
      if (!o) return false;
      o.status    = status;
      o.updatedAt = _now();
      this._save(list);
      return true;
    },

    /** Total number of orders. */
    count() { return this._all().length; },

    /** Total revenue across all orders. */
    totalRevenue() { return this._all().reduce((s, o) => s + (o.subtotal || 0), 0); },
  };

  /* ─────────────────────────────────────────────────────────────
     WISHLIST COLLECTION
  ───────────────────────────────────────────────────────────── */

  const wishlist = {

    _all()      { return _read(KEYS.wishlist) || []; },
    _save(list) { _write(KEYS.wishlist, list); },

    _userId() {
      const s = session.get();
      return s ? s.id || s.email : null;
    },

    /** Product ids wishlisted by the current user. */
    mine() {
      const uid = this._userId();
      if (!uid) return [];
      return this._all().filter(w => w.userId === uid).map(w => w.productId);
    },

    /** Toggle a product in / out of wishlist. Returns true if now wishlisted. */
    toggle(productId) {
      const uid = this._userId();
      if (!uid) return false;
      const list = this._all();
      const idx = list.findIndex(w => w.userId === uid && w.productId === productId);
      if (idx !== -1) {
        list.splice(idx, 1);
        this._save(list);
        return false;
      } else {
        list.push({ id: _uid('wl'), userId: uid, productId, addedAt: _now() });
        this._save(list);
        return true;
      }
    },

    /** Check if a product is wishlisted by the current user. */
    has(productId) { return this.mine().includes(productId); },

    /** Remove a product from wishlist. */
    remove(productId) {
      const uid = this._userId();
      if (!uid) return;
      this._save(this._all().filter(w => !(w.userId === uid && w.productId === productId)));
    },

    /** Count of wishlist items for the current user. */
    count() { return this.mine().length; },
  };

  /* ─────────────────────────────────────────────────────────────
     REVIEWS COLLECTION
  ───────────────────────────────────────────────────────────── */

  const reviews = {

    _all()      { return _read(KEYS.reviews) || []; },
    _save(list) { _write(KEYS.reviews, list); },

    /** All reviews for a product. */
    forProduct(productId) {
      return _clone(this._all().filter(r => r.productId === productId));
    },

    /** Add a review. rating: 1-5. */
    add({ productId, rating, title, body }) {
      const s = session.get();
      if (!s) return { ok: false, message: 'You must be logged in to review.' };
      if (rating < 1 || rating > 5) return { ok: false, message: 'Rating must be 1–5.' };

      const list = this._all();
      // One review per user per product
      const existing = list.find(r => r.productId === productId && r.userId === (s.id || s.email));
      if (existing) {
        existing.rating    = rating;
        existing.title     = title || '';
        existing.body      = body  || '';
        existing.updatedAt = _now();
        this._save(list);
        return { ok: true, review: existing };
      }

      const review = {
        id        : _uid('rev'),
        productId,
        userId    : s.id || s.email,
        userName  : s.name,
        rating,
        title     : title || '',
        body      : body  || '',
        createdAt : _now(),
        updatedAt : _now(),
      };
      list.push(review);
      this._save(list);
      return { ok: true, review };
    },

    /** Average rating for a product. */
    avgRating(productId) {
      const r = this.forProduct(productId);
      if (!r.length) return null;
      return (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1);
    },
  };

  /* ─────────────────────────────────────────────────────────────
     PRODUCTS COLLECTION  (read-only catalogue mirror)
  ───────────────────────────────────────────────────────────── */

  const products = {

    /**
     * Seed the DB with the PRODUCTS array from script.js.
     * Only runs once (won't overwrite existing data).
     * Called from init() after script.js has loaded.
     */
    seed(productArray) {
      if (!Array.isArray(productArray) || !productArray.length) return;
      const existing = _read(KEYS.products);
      if (existing && existing.length) return;  // already seeded
      _write(KEYS.products, productArray.map(p => ({
        ...p,
        seededAt: _now(),
      })));
      console.info(`[MegacartDB] Seeded ${productArray.length} products.`);
    },

    /** Get all products from DB (or fall back to global PRODUCTS array). */
    getAll() {
      const stored = _read(KEYS.products);
      if (stored && stored.length) return _clone(stored);
      return typeof PRODUCTS !== 'undefined' ? _clone(PRODUCTS) : [];
    },

    /** Find by id. */
    findById(id) { return this.getAll().find(p => p.id === id) || null; },

    /** Filter by category. */
    byCategory(cat) {
      return cat === 'all' ? this.getAll() : this.getAll().filter(p => p.category === cat);
    },

    /** Simple text search. */
    search(query) {
      const q = (query || '').toLowerCase();
      return this.getAll().filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    },

    /** Count of products in DB. */
    count() { return this.getAll().length; },
  };

  /* ─────────────────────────────────────────────────────────────
     ANALYTICS HELPERS  (simple counters, no tracking)
  ───────────────────────────────────────────────────────────── */

  const analytics = {
    summary() {
      return {
        users        : users.count(),
        products     : products.count(),
        orders       : orders.count(),
        revenue      : orders.totalRevenue(),
        cartItems    : cart.totalItems(),
        wishlistItems: wishlist.count(),
      };
    },
  };

  /* ─────────────────────────────────────────────────────────────
     DB ADMIN HELPERS
  ───────────────────────────────────────────────────────────── */

  const admin = {

    /** Export everything as a JSON string (download from console). */
    exportAll() {
      const data = {};
      Object.entries(KEYS).forEach(([name, key]) => {
        if (!key.startsWith(DB_PREFIX)) return; // skip legacy keys
        data[name] = _read(key);
      });
      return JSON.stringify(data, null, 2);
    },

    /** Nuclear option — wipe ALL MegacartDB keys. */
    reset() {
      if (!confirm('[MegacartDB Admin] ⚠ This will delete ALL database data. Continue?')) return;
      Object.values(KEYS).forEach(k => _remove(k));
      console.warn('[MegacartDB] Database has been reset.');
    },

    /**
     * Print a readable DB summary to the browser console.
     * Usage: MegacartDB.admin.inspect()
     */
    inspect() {
      console.group('[MegacartDB] Database Inspection');
      console.table(analytics.summary());
      console.log('Users:',    users.getAll());
      console.log('Session:',  session.get());
      console.log('Cart:',     cart.myItems());
      console.log('Orders:',   orders.getAll());
      console.log('Wishlist:', wishlist.mine());
      console.groupEnd();
    },
  };

  /* ─────────────────────────────────────────────────────────────
     COMPATIBILITY SHIMS
     These functions are called by the existing script.js and
     login.html code. They delegate to the new DB layer so zero
     changes are needed in those files.
  ───────────────────────────────────────────────────────────── */

  /**
   * getUser()   – returns current session user (or null)
   * saveUser()  – persists session
   * clearUser() – logout
   * getUsers()  – returns all registered users
   * saveUsers() – replaces users list (legacy register path)
   */
  global.getUser   = () => session.get();
  global.saveUser  = (u) => session.set(u);
  global.clearUser = () => session.clear();
  global.getUsers  = () => users.getAll().map(u => {
    // Return with password so legacy password-check still works
    const full = _read(KEYS.users) || [];
    return full.find(x => x.email === u.email) || u;
  });
  global.saveUsers = (list) => {
    // Legacy register path: list is the full users array
    _write(KEYS.users, list.map(u => ({
      id        : u.id        || _uid('usr'),
      name      : u.name      || '',
      email     : (u.email    || '').toLowerCase().trim(),
      phone     : u.phone     || '',
      password  : u.password  || '',
      googleId  : u.googleId  || null,
      picture   : u.picture   || null,
      role      : u.role      || 'customer',
      createdAt : u.createdAt || _now(),
      updatedAt : _now(),
    })));
    _write(KEYS._legacyUsers, list);
  };

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */

  function init() {
    _migrate();

    // Seed product catalogue once script.js has defined PRODUCTS
    if (typeof PRODUCTS !== 'undefined') {
      products.seed(PRODUCTS);
    } else {
      // script.js loads after us — seed on next tick
      setTimeout(() => {
        if (typeof PRODUCTS !== 'undefined') products.seed(PRODUCTS);
      }, 0);
    }

    console.info('[MegacartDB] Ready. Version:', DB_VERSION, '| Keys:', Object.keys(KEYS).length);
  }

  /* ─────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────── */

  global.MegacartDB = {
    users,
    session,
    cart,
    orders,
    wishlist,
    reviews,
    products,
    analytics,
    admin,
    init,
    _uid,
    _now,
    VERSION : DB_VERSION,
  };

  // Auto-init as soon as this script is parsed
  init();

})(window);
