import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = process.env.VERCEL === '1';

const DB_PATH = IS_VERCEL
  ? path.join('/tmp', 'vendora.db')
  : path.join(__dirname, 'vendora.db');

const BACKUPS_DIR = IS_VERCEL
  ? path.join('/tmp', 'backups')
  : path.join(__dirname, 'backups');

// Ensure backups directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// On Vercel, copy initial vendora.db from repository into /tmp if not already copied
if (IS_VERCEL && !fs.existsSync(DB_PATH)) {
  const sourceDb = path.join(__dirname, 'vendora.db');
  if (fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, DB_PATH);
      console.log('Copied initial vendora.db into /tmp on Vercel');
    } catch (e) {
      console.error('Failed to copy database to /tmp:', e);
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);

// Schema Definition (Phase 1 + Phase 2 + Phase 3 + Phase 4)
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trust_status TEXT NOT NULL DEFAULT 'Untested',
    trust_score INTEGER DEFAULT 50,
    notes TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vendor_platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    identifier TEXT NOT NULL,
    url TEXT DEFAULT '',
    is_primary INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'General',
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS product_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform_id INTEGER REFERENCES vendor_platforms(id) ON DELETE SET NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    duration TEXT NOT NULL,
    warranty TEXT DEFAULT 'No Warranty',
    availability TEXT DEFAULT 'Available',
    delivery_method TEXT DEFAULT 'Direct Login',
    description TEXT DEFAULT '',
    last_checked TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES product_offers(id) ON DELETE SET NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    quantity INTEGER DEFAULT 1,
    purchase_date TEXT DEFAULT (datetime('now')),
    warranty_days INTEGER DEFAULT 25,
    warranty_expiry TEXT,
    result TEXT DEFAULT 'Successful',
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS vendor_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id INTEGER NOT NULL REFERENCES product_offers(id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    old_price REAL NOT NULL,
    new_price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    recorded_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS replacements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    replacement_number INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Pending',
    request_date TEXT DEFAULT (datetime('now')),
    resolved_date TEXT,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    issue_type TEXT DEFAULT 'Account Expired Early',
    financial_loss REAL DEFAULT 0.0,
    seller_response TEXT DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS evidence_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    title TEXT NOT NULL,
    image_data TEXT,
    source_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    target_price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- PHASE 4 TABLES
  CREATE TABLE IF NOT EXISTS monitored_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    uptime_status TEXT DEFAULT 'Online',
    last_checked TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS detected_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER REFERENCES monitored_sources(id) ON DELETE SET NULL,
    vendor_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    detected_price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    duration TEXT DEFAULT '1 Month',
    warranty TEXT DEFAULT '25 Days',
    raw_snippet TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    detected_at TEXT DEFAULT (datetime('now'))
  );

  -- BUSINESS & RESELLER SUITE TABLES
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT DEFAULT '',
    platform TEXT DEFAULT 'WhatsApp',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customer_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT DEFAULT '',
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name TEXT DEFAULT '',
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
    cost_price REAL NOT NULL DEFAULT 0.0,
    sale_price REAL NOT NULL DEFAULT 0.0,
    profit REAL NOT NULL DEFAULT 0.0,
    currency TEXT DEFAULT 'USD',
    duration TEXT DEFAULT '1 Month',
    warranty_days INTEGER DEFAULT 25,
    sale_date TEXT DEFAULT (datetime('now')),
    warranty_expiry TEXT,
    status TEXT DEFAULT 'Active',
    credentials TEXT DEFAULT '',
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS stock_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
    credentials TEXT NOT NULL,
    duration TEXT DEFAULT '1 Month',
    cost_price REAL DEFAULT 0.0,
    status TEXT DEFAULT 'In Stock',
    sold_to_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    sold_to_sale_id INTEGER REFERENCES customer_sales(id) ON DELETE SET NULL,
    added_at TEXT DEFAULT (datetime('now')),
    sold_at TEXT,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS sale_replacement_chain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES customer_sales(id) ON DELETE CASCADE,
    replacement_number INTEGER NOT NULL DEFAULT 1,
    issue_date TEXT DEFAULT (datetime('now')),
    previous_credentials TEXT DEFAULT '',
    new_credentials TEXT NOT NULL,
    issue_reason TEXT DEFAULT 'اکاؤنٹ بند ہو گیا',
    vendor_notes TEXT DEFAULT '',
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

try {
  db.prepare("ALTER TABLE customer_sales ADD COLUMN original_credentials TEXT DEFAULT ''").run();
} catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN payment_status TEXT DEFAULT 'Paid'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN amount_paid REAL DEFAULT 0.0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN pending_amount REAL DEFAULT 0.0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN payment_method TEXT DEFAULT 'JazzCash'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN payment_proof_trx TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN renewal_status TEXT DEFAULT 'Active'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE customer_sales ADD COLUMN reminder_sent_at TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN safety_guidelines TEXT DEFAULT ''").run(); } catch (e) {}

// Populate sample safety guidelines if empty
try {
  db.prepare("UPDATE products SET safety_guidelines = 'صرف 1 ڈیوائس میں چلائیں، پاس ورڈ اور ای میل تبدیل نہ کریں، کلاؤڈ سنک بند رکھیں۔' WHERE (safety_guidelines IS NULL OR safety_guidelines = '') AND name LIKE '%CapCut%'").run();
  db.prepare("UPDATE products SET safety_guidelines = 'براؤزر کوکیز کلیر نہ کریں، سیشن لاگ آؤٹ نہ کریں، سنگل براؤزر اور کلین آئی پی استعمال کریں۔' WHERE (safety_guidelines IS NULL OR safety_guidelines = '') AND name LIKE '%Claude%'").run();
  db.prepare("UPDATE products SET safety_guidelines = 'اکاؤنٹ کا پاس ورڈ نہ بدلیں، کسٹم اوتار یا فون نمبر ایڈ نہ کریں۔' WHERE (safety_guidelines IS NULL OR safety_guidelines = '') AND name LIKE '%ChatGPT%'").run();
  db.prepare("UPDATE products SET safety_guidelines = 'ایجوکیشن ٹیم جوائن کرتے وقت اپنا ذاتی ای میل استعمال کریں یا فراہم کردہ اسناد سے لاگ ان کریں۔' WHERE (safety_guidelines IS NULL OR safety_guidelines = '') AND name LIKE '%Canva%'").run();
} catch (e) {}

// Seed Phase 4 Monitored Sources & Detected Offers if empty
const sourcesCount = db.prepare('SELECT COUNT(*) as count FROM monitored_sources').get().count;
if (sourcesCount === 0) {
  console.log('Seeding Phase 4 Monitored Sources and Staging Feed...');
  const v1 = db.prepare("SELECT id FROM vendors WHERE name = 'XYZ Store'").get();
  const v2 = db.prepare("SELECT id FROM vendors WHERE name = 'Prime Accounts'").get();
  
  const insertSource = db.prepare(`
    INSERT INTO monitored_sources (vendor_id, name, platform, source_url, status, uptime_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSource.run(v1?.id || null, 'XYZ Store Telegram Feed', 'Telegram', 'https://t.me/xyzstore', 'Active', 'Online').lastInsertRowid;
  const s2 = insertSource.run(v2?.id || null, 'Prime Accounts Store Web', 'Website', 'https://primeaccs.shop', 'Active', 'Online').lastInsertRowid;

  const insertDetected = db.prepare(`
    INSERT INTO detected_offers (source_id, vendor_name, product_name, detected_price, currency, duration, warranty, raw_snippet, status, detected_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
  `);

  insertDetected.run(s1, 'XYZ Store', 'CapCut Pro', 1.70, 'USD', '1 Month', '25 Days', '🔥 Flash Sale! CapCut Pro 1 Month reduced to $1.70 today only! Instant replacement warranty included. DM @xyzstore', 'Pending');
  insertDetected.run(s2, 'Prime Accounts', 'Claude Pro', 15.50, 'USD', '1 Month', '15 Days', 'New Claude Pro private account with clean cookies available for $15.50 on primeaccs.shop', 'Pending');
}

// Seed Customers, Sales & Inventory if empty
const salesCount = db.prepare('SELECT COUNT(*) as count FROM customer_sales').get().count;
if (salesCount === 0) {
  console.log('Seeding Customers, Sales, and Inventory...');
  let c1 = db.prepare("SELECT id FROM customers WHERE name = 'Zubair Ahmed'").get()?.id;
  if (!c1) {
    c1 = db.prepare("INSERT INTO customers (name, contact, platform, notes) VALUES (?, ?, ?, ?)").run('Zubair Ahmed', '+92 321 9876543', 'WhatsApp', 'Regular buyer of CapCut and Claude').lastInsertRowid;
  }
  let c2 = db.prepare("SELECT id FROM customers WHERE name = 'Hamza Khan'").get()?.id;
  if (!c2) {
    c2 = db.prepare("INSERT INTO customers (name, contact, platform, notes) VALUES (?, ?, ?, ?)").run('Hamza Khan', '@hamza_editor', 'Telegram', 'Runs a video editing agency').lastInsertRowid;
  }

  const capcutProd = db.prepare("SELECT id, name FROM products WHERE name LIKE '%CapCut%'").get() || db.prepare("SELECT id, name FROM products LIMIT 1").get();
  const claudeProd = db.prepare("SELECT id, name FROM products WHERE name LIKE '%Claude%'").get();
  const anyVendor = db.prepare("SELECT id, name FROM vendors WHERE name = 'XYZ Store'").get() || db.prepare("SELECT id, name FROM vendors LIMIT 1").get();
  const p1 = anyVendor ? db.prepare("SELECT id FROM purchases WHERE vendor_id = ?").get(anyVendor.id) : null;

  if (capcutProd && anyVendor) {
    db.prepare(`
      INSERT INTO customer_sales (customer_id, customer_name, customer_contact, product_id, product_name, vendor_id, vendor_name, purchase_id, cost_price, sale_price, profit, duration, warranty_days, warranty_expiry, status, credentials, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1.80, 4.00, 2.20, '1 Month', 25, datetime('now', '+20 days'), 'Active', 'capcut_pro_vip@gmail.com:CapPass123', 'Smooth delivery on WhatsApp')
    `).run(c1, 'Zubair Ahmed', '+92 321 9876543', capcutProd.id, capcutProd.name, anyVendor.id, anyVendor.name, p1 ? p1.id : null);

    db.prepare(`
      INSERT INTO customer_sales (customer_id, customer_name, customer_contact, product_id, product_name, vendor_id, vendor_name, purchase_id, cost_price, sale_price, profit, duration, warranty_days, warranty_expiry, status, credentials, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1.80, 4.50, 2.70, '1 Month', 25, datetime('now', '+15 days'), 'Active', 'hamza_agency@yahoo.com:Hamza2026', 'Paid via Easypaisa')
    `).run(c2, 'Hamza Khan', '@hamza_editor', capcutProd.id, capcutProd.name, anyVendor.id, anyVendor.name, p1 ? p1.id : null);

    db.prepare(`
      INSERT INTO stock_inventory (product_id, product_name, vendor_id, purchase_id, credentials, duration, cost_price, status)
      VALUES (?, ?, ?, ?, 'stock_capcut_1@gmail.com:StrongPass1', '1 Month', 1.80, 'In Stock')
    `).run(capcutProd.id, capcutProd.name, anyVendor.id, p1 ? p1.id : null);

    db.prepare(`
      INSERT INTO stock_inventory (product_id, product_name, vendor_id, purchase_id, credentials, duration, cost_price, status)
      VALUES (?, ?, ?, ?, 'stock_capcut_2@gmail.com:StrongPass2', '1 Month', 1.80, 'In Stock')
    `).run(capcutProd.id, capcutProd.name, anyVendor.id, p1 ? p1.id : null);
  }

  if (claudeProd && anyVendor) {
    db.prepare(`
      INSERT INTO stock_inventory (product_id, product_name, vendor_id, purchase_id, credentials, duration, cost_price, status)
      VALUES (?, ?, ?, ?, 'claude_session_cookie_token_xyz99', '1 Month', 16.50, 'In Stock')
    `).run(claudeProd.id, claudeProd.name, anyVendor.id, p1 ? p1.id : null);
  }
}

/* ========================================================================= */
/*                                API ROUTES                                */
/* ========================================================================= */

// 1. Dashboard Statistics
app.get('/api/dashboard', (req, res) => {
  try {
    const totalVendors = db.prepare('SELECT COUNT(*) as count FROM vendors').get().count;
    const trustedCount = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE trust_status = 'Trusted'").get().count;
    const untestedCount = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE trust_status = 'Untested'").get().count;
    const riskyCount = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE trust_status = 'Risky'").get().count;
    const scammerCount = db.prepare("SELECT COUNT(*) as count FROM vendors WHERE trust_status = 'Scammer'").get().count;
    
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalPurchases = db.prepare('SELECT COUNT(*) as count FROM purchases').get().count;
    
    const totalSpentResult = db.prepare("SELECT SUM(price * quantity) as total FROM purchases WHERE result = 'Successful'").get();
    const totalSpent = totalSpentResult.total || 0;

    const totalLossResult = db.prepare("SELECT SUM(financial_loss) as total FROM issues").get();
    const totalLoss = totalLossResult.total || 0;

    const pendingReplacementsCount = db.prepare("SELECT COUNT(*) as count FROM replacements WHERE status = 'Pending'").get().count;
    const pendingDetectedCount = db.prepare("SELECT COUNT(*) as count FROM detected_offers WHERE status = 'Pending'").get().count;

    // Reseller Suite Metrics
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const totalSales = db.prepare('SELECT COUNT(*) as count FROM customer_sales').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(sale_price), 0) as total FROM customer_sales').get().total;
    const totalProfit = db.prepare('SELECT COALESCE(SUM(profit), 0) as total FROM customer_sales').get().total;
    const inStockCount = db.prepare("SELECT COUNT(*) as count FROM stock_inventory WHERE status = 'In Stock'").get().count;
    const totalUdhaar = db.prepare('SELECT COALESCE(SUM(pending_amount), 0) as total FROM customer_sales').get().total;
    const expiringSoonCount = db.prepare(`
      SELECT COUNT(*) as count FROM customer_sales 
      WHERE status IN ('Active', 'Replaced') 
        AND warranty_expiry IS NOT NULL 
        AND (julianday(warranty_expiry) - julianday('now')) <= 3
    `).get().count;
    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT p.id FROM products p
        LEFT JOIN stock_inventory s ON p.id = s.product_id AND s.status = 'In Stock'
        GROUP BY p.id
        HAVING COUNT(s.id) <= 1
      )
    `).get().count;

    const alerts = db.prepare(`
      SELECT pa.id, pa.target_price, pr.name as product_name,
             (SELECT COUNT(*) FROM product_offers po WHERE po.product_id = pa.product_id AND po.price <= pa.target_price) as active_deals_count
      FROM price_alerts pa
      JOIN products pr ON pa.product_id = pr.id
    `).all();
    const activePriceAlertsCount = alerts.filter(a => a.active_deals_count > 0).length;

    const recentPurchases = db.prepare(`
      SELECT p.id, p.price, p.currency, p.quantity, p.purchase_date, p.result, p.notes,
             p.warranty_days, p.warranty_expiry,
             v.name as vendor_name, v.trust_status,
             pr.name as product_name
      FROM purchases p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN products pr ON p.product_id = pr.id
      ORDER BY p.purchase_date DESC
      LIMIT 6
    `).all();

    const recentOffers = db.prepare(`
      SELECT o.id, o.price, o.currency, o.duration, o.warranty, o.availability, o.last_checked,
             v.name as vendor_name, v.trust_status,
             pr.name as product_name,
             vp.platform, vp.identifier
      FROM product_offers o
      JOIN vendors v ON o.vendor_id = v.id
      JOIN products pr ON o.product_id = pr.id
      LEFT JOIN vendor_platforms vp ON o.platform_id = vp.id
      ORDER BY o.id DESC
      LIMIT 6
    `).all();

    res.json({
      stats: {
        totalVendors,
        trustedCount,
        untestedCount,
        riskyCount,
        scammerCount,
        totalProducts,
        totalPurchases,
        totalSpent,
        totalLoss,
        pendingReplacementsCount,
        activePriceAlertsCount,
        pendingDetectedCount,
        totalCustomers,
        totalSales,
        totalRevenue,
        totalProfit,
        inStockCount,
        totalUdhaar,
        expiringSoonCount,
        lowStockCount
      },
      recentPurchases,
      recentOffers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Vendors List
app.get('/api/vendors', (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT v.*,
             COUNT(DISTINCT o.id) as offer_count,
             COUNT(DISTINCT p.id) as purchase_count,
             COALESCE(SUM(CASE WHEN p.result = 'Successful' THEN p.quantity ELSE 0 END), 0) as successful_items,
             COALESCE((SELECT SUM(financial_loss) FROM issues WHERE vendor_id = v.id), 0) as total_loss,
             (SELECT COUNT(*) FROM issues WHERE vendor_id = v.id) as issue_count
      FROM vendors v
      LEFT JOIN product_offers o ON v.id = o.vendor_id
      LEFT JOIN purchases p ON v.id = p.vendor_id
    `;
    const where = [];
    const params = [];

    if (status && status !== 'All') { where.push('v.trust_status = ?'); params.push(status); }
    if (search) {
      where.push('(v.name LIKE ? OR v.tags LIKE ? OR v.notes LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (where.length > 0) query += ' WHERE ' + where.join(' AND ');
    query += ' GROUP BY v.id ORDER BY v.trust_score DESC, v.name ASC';

    const vendors = db.prepare(query).all(...params);
    const platformQuery = db.prepare('SELECT * FROM vendor_platforms WHERE vendor_id = ?');
    const offerQuery = db.prepare(`
      SELECT o.id, o.price, o.duration, o.warranty, pr.name as product_name
      FROM product_offers o
      JOIN products pr ON o.product_id = pr.id
      WHERE o.vendor_id = ?
      ORDER BY o.price ASC
    `);
    for (const vendor of vendors) {
      vendor.platforms = platformQuery.all(vendor.id);
      vendor.offers = offerQuery.all(vendor.id);
    }
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Single Vendor Detail
app.get('/api/vendors/:id', (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    vendor.platforms = db.prepare('SELECT * FROM vendor_platforms WHERE vendor_id = ?').all(vendor.id);
    vendor.offers = db.prepare(`
      SELECT o.*, pr.name as product_name, pr.category as product_category,
             vp.platform, vp.identifier
      FROM product_offers o
      JOIN products pr ON o.product_id = pr.id
      LEFT JOIN vendor_platforms vp ON o.platform_id = vp.id
      WHERE o.vendor_id = ?
      ORDER BY o.last_checked DESC
    `).all(vendor.id);

    vendor.purchases = db.prepare(`
      SELECT p.*, pr.name as product_name
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.vendor_id = ?
      ORDER BY p.purchase_date DESC
    `).all(vendor.id);

    vendor.notes_list = db.prepare('SELECT * FROM vendor_notes WHERE vendor_id = ? ORDER BY created_at DESC').all(vendor.id);
    vendor.issues = db.prepare('SELECT * FROM issues WHERE vendor_id = ? ORDER BY created_at DESC').all(vendor.id);
    vendor.evidence = db.prepare('SELECT * FROM evidence_records WHERE vendor_id = ? ORDER BY created_at DESC').all(vendor.id);

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Create Vendor
app.post('/api/vendors', (req, res) => {
  try {
    const { name, trust_status, trust_score, notes, tags, platforms } = req.body;
    if (!name) return res.status(400).json({ error: 'Vendor name is required' });

    const insert = db.prepare(`
      INSERT INTO vendors (name, trust_status, trust_score, notes, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      trust_status || 'Untested',
      trust_score !== undefined ? Number(trust_score) : 50,
      notes || '',
      tags || ''
    );
    const vendorId = result.lastInsertRowid;

    if (platforms && Array.isArray(platforms)) {
      const insertPlat = db.prepare(`
        INSERT INTO vendor_platforms (vendor_id, platform, identifier, url, is_primary)
        VALUES (?, ?, ?, ?, ?)
      `);
      platforms.forEach((p, idx) => {
        if (p.identifier) {
          insertPlat.run(vendorId, p.platform || 'Telegram', p.identifier.trim(), p.url || '', p.is_primary ? 1 : (idx === 0 ? 1 : 0));
        }
      });
    }

    if (notes && notes.trim()) {
      db.prepare('INSERT INTO vendor_notes (vendor_id, note_text) VALUES (?, ?)').run(vendorId, notes.trim());
    }

    res.json({ id: vendorId, message: 'Vendor created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Update Vendor
app.put('/api/vendors/:id', (req, res) => {
  try {
    const { name, trust_status, trust_score, notes, tags, platforms } = req.body;
    const vendorId = req.params.id;

    db.prepare(`
      UPDATE vendors 
      SET name = ?, trust_status = ?, trust_score = ?, notes = ?, tags = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name.trim(), trust_status, Number(trust_score), notes || '', tags || '', vendorId);

    if (platforms && Array.isArray(platforms)) {
      db.prepare('DELETE FROM vendor_platforms WHERE vendor_id = ?').run(vendorId);
      const insertPlat = db.prepare(`
        INSERT INTO vendor_platforms (vendor_id, platform, identifier, url, is_primary)
        VALUES (?, ?, ?, ?, ?)
      `);
      platforms.forEach((p, idx) => {
        if (p.identifier) {
          insertPlat.run(vendorId, p.platform || 'Telegram', p.identifier.trim(), p.url || '', p.is_primary ? 1 : (idx === 0 ? 1 : 0));
        }
      });
    }

    res.json({ message: 'Vendor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Delete Vendor
app.delete('/api/vendors/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vendors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT pr.*,
             COUNT(DISTINCT o.id) as offer_count,
             MIN(o.price) as min_price,
             MAX(o.price) as max_price
      FROM products pr
      LEFT JOIN product_offers o ON pr.id = o.product_id
      GROUP BY pr.id
      ORDER BY pr.name ASC
    `).all();
    const vendorOffersQuery = db.prepare(`
      SELECT o.id, o.price, o.duration, o.warranty, v.name as vendor_name, v.trust_status
      FROM product_offers o
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.product_id = ?
      ORDER BY o.price ASC
    `);
    for (const prod of products) {
      prod.vendor_offers = vendorOffersQuery.all(prod.id);
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });

    const result = db.prepare(`
      INSERT INTO products (name, category, description)
      VALUES (?, ?, ?)
    `).run(name.trim(), category || 'General', description || '');

    res.json({ id: result.lastInsertRowid, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Offers & Price History
app.post('/api/offers', (req, res) => {
  try {
    const { vendor_id, product_id, platform_id, price, currency, duration, warranty, availability, delivery_method, description } = req.body;
    if (!vendor_id || !product_id || price === undefined) {
      return res.status(400).json({ error: 'Vendor, Product and Price are required' });
    }

    const result = db.prepare(`
      INSERT INTO product_offers 
      (vendor_id, product_id, platform_id, price, currency, duration, warranty, availability, delivery_method, description, last_checked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      vendor_id,
      product_id,
      platform_id || null,
      Number(price),
      currency || 'USD',
      duration || '1 Month',
      warranty || 'No Warranty',
      availability || 'Available',
      delivery_method || 'Direct Login',
      description || ''
    );

    db.prepare(`
      INSERT INTO price_history (offer_id, vendor_id, product_id, old_price, new_price, currency)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(result.lastInsertRowid, vendor_id, product_id, Number(price), Number(price), currency || 'USD');

    res.json({ id: result.lastInsertRowid, message: 'Offer created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/offers/:id', (req, res) => {
  try {
    const { price, currency, duration, warranty, availability, delivery_method, description, platform_id } = req.body;
    const offerId = req.params.id;

    const currentOffer = db.prepare('SELECT * FROM product_offers WHERE id = ?').get(offerId);
    if (!currentOffer) return res.status(404).json({ error: 'Offer not found' });

    const newPrice = Number(price);
    if (Math.abs(currentOffer.price - newPrice) > 0.001) {
      db.prepare(`
        INSERT INTO price_history (offer_id, vendor_id, product_id, old_price, new_price, currency)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(offerId, currentOffer.vendor_id, currentOffer.product_id, currentOffer.price, newPrice, currency || 'USD');
    }

    db.prepare(`
      UPDATE product_offers 
      SET price = ?, currency = ?, duration = ?, warranty = ?, availability = ?, delivery_method = ?, description = ?, platform_id = ?, last_checked = datetime('now')
      WHERE id = ?
    `).run(newPrice, currency || 'USD', duration, warranty, availability, delivery_method, description, platform_id || null, offerId);

    res.json({ message: 'Offer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/offers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM product_offers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Smart Comparison Search
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
    if (!query) {
      return res.json({ products: [], vendors: [], offers: [], comparison: {} });
    }

    const matchedProducts = db.prepare(`
      SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ?
    `).all(`%${query}%`, `%${query}%`);

    const matchedVendors = db.prepare(`
      SELECT * FROM vendors WHERE LOWER(name) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(notes) LIKE ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`);

    for (const v of matchedVendors) {
      v.platforms = db.prepare('SELECT * FROM vendor_platforms WHERE vendor_id = ?').all(v.id);
    }

    const matchedOffers = db.prepare(`
      SELECT o.*,
             v.name as vendor_name, v.trust_status, v.trust_score,
             pr.name as product_name, pr.category as product_category,
             vp.platform, vp.identifier, vp.url,
             (SELECT COUNT(*) FROM purchases p WHERE p.vendor_id = v.id AND p.result = 'Successful') as vendor_successful_purchases,
             (SELECT COUNT(*) FROM purchases p WHERE p.vendor_id = v.id AND p.result = 'Failed') as vendor_failed_purchases,
             (SELECT old_price FROM price_history ph WHERE ph.offer_id = o.id ORDER BY ph.recorded_at DESC LIMIT 1) as previous_price
      FROM product_offers o
      JOIN vendors v ON o.vendor_id = v.id
      JOIN products pr ON o.product_id = pr.id
      LEFT JOIN vendor_platforms vp ON o.platform_id = vp.id
      WHERE LOWER(pr.name) LIKE ? 
         OR LOWER(v.name) LIKE ? 
         OR LOWER(vp.identifier) LIKE ?
         OR LOWER(o.duration) LIKE ?
      ORDER BY o.price ASC, v.trust_score DESC
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);

    for (const offer of matchedOffers) {
      const succ = offer.vendor_successful_purchases || 0;
      const fail = offer.vendor_failed_purchases || 0;
      const total = succ + fail;
      if (total > 0 && fail > 0 && succ > 0) {
        const multiplier = total / succ;
        offer.effective_cost = Number((offer.price * multiplier).toFixed(2));
        offer.is_higher_effective = offer.effective_cost > offer.price;
      } else if (fail > 0 && succ === 0) {
        offer.effective_cost = Number((offer.price * 2.5).toFixed(2));
        offer.is_higher_effective = true;
      } else {
        offer.effective_cost = offer.price;
        offer.is_higher_effective = false;
      }
    }

    const groupedComparison = {};
    for (const offer of matchedOffers) {
      if (!groupedComparison[offer.product_name]) {
        groupedComparison[offer.product_name] = [];
      }
      groupedComparison[offer.product_name].push(offer);
    }

    res.json({
      query,
      products: matchedProducts,
      vendors: matchedVendors,
      offers: matchedOffers,
      comparison: groupedComparison
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Purchases Log & Warranty
app.get('/api/purchases', (req, res) => {
  try {
    const purchases = db.prepare(`
      SELECT p.*,
             v.name as vendor_name, v.trust_status,
             pr.name as product_name,
             o.duration, o.warranty,
             (SELECT COUNT(*) FROM replacements r WHERE r.purchase_id = p.id) as replacement_count
      FROM purchases p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN products pr ON p.product_id = pr.id
      LEFT JOIN product_offers o ON p.offer_id = o.id
      ORDER BY p.purchase_date DESC
    `).all();

    const now = new Date();
    for (const p of purchases) {
      const pDate = new Date(p.purchase_date);
      const wDays = p.warranty_days || 25;
      const expiryDate = new Date(pDate.getTime() + wDays * 24 * 60 * 60 * 1000);
      p.computed_expiry = expiryDate.toISOString();
      const diffMs = expiryDate - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      p.days_left = daysLeft;
      p.warranty_active = daysLeft > 0;
    }

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchases', (req, res) => {
  try {
    const { vendor_id, product_id, offer_id, price, currency, quantity, result, notes, warranty_days } = req.body;
    if (!vendor_id || !product_id || price === undefined) {
      return res.status(400).json({ error: 'Vendor, Product and Price are required' });
    }

    const wDays = warranty_days !== undefined ? Number(warranty_days) : 25;
    const insert = db.prepare(`
      INSERT INTO purchases (vendor_id, product_id, offer_id, price, currency, quantity, result, notes, warranty_days, warranty_expiry, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' days'), datetime('now'))
    `);

    const pResult = insert.run(
      vendor_id,
      product_id,
      offer_id || null,
      Number(price),
      currency || 'USD',
      quantity ? Number(quantity) : 1,
      result || 'Successful',
      notes || '',
      wDays,
      wDays
    );

    if (result === 'Successful') {
      db.prepare('UPDATE vendors SET trust_score = MIN(100, trust_score + 2) WHERE id = ?').run(vendor_id);
    } else if (result === 'Failed') {
      db.prepare('UPDATE vendors SET trust_score = MAX(0, trust_score - 10) WHERE id = ?').run(vendor_id);
    }

    res.json({ id: pResult.lastInsertRowid, message: 'Purchase logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/purchases/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM purchases WHERE id = ?').run(req.params.id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Replacements Management
app.get('/api/replacements', (req, res) => {
  try {
    const { purchase_id } = req.query;
    let query = `
      SELECT r.*,
             p.price, p.purchase_date, p.result as purchase_result,
             v.id as vendor_id, v.name as vendor_name, v.trust_status,
             pr.name as product_name
      FROM replacements r
      JOIN purchases p ON r.purchase_id = p.id
      JOIN vendors v ON p.vendor_id = v.id
      JOIN products pr ON p.product_id = pr.id
    `;
    const params = [];
    if (purchase_id) {
      query += ' WHERE r.purchase_id = ?';
      params.push(purchase_id);
    }
    query += ' ORDER BY r.request_date DESC';

    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/replacements', (req, res) => {
  try {
    const { purchase_id, notes, status } = req.body;
    if (!purchase_id) return res.status(400).json({ error: 'Purchase ID is required' });

    const count = db.prepare('SELECT COUNT(*) as c FROM replacements WHERE purchase_id = ?').get(purchase_id).c;
    const replacement_number = count + 1;

    const result = db.prepare(`
      INSERT INTO replacements (purchase_id, replacement_number, status, notes, request_date)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(purchase_id, replacement_number, status || 'Pending', notes || '');

    db.prepare("UPDATE purchases SET result = 'Replaced' WHERE id = ?").run(purchase_id);
    res.json({ id: result.lastInsertRowid, replacement_number, message: 'Replacement logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/replacements/:id', (req, res) => {
  try {
    const { status, notes } = req.body;
    db.prepare(`
      UPDATE replacements 
      SET status = ?, notes = ?, resolved_date = (CASE WHEN ? != 'Pending' THEN datetime('now') ELSE resolved_date END)
      WHERE id = ?
    `).run(status, notes || '', status, req.params.id);

    res.json({ message: 'Replacement updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/replacements/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM replacements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Replacement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Issues / Complaints
app.get('/api/issues', (req, res) => {
  try {
    const { vendor_id } = req.query;
    let query = `
      SELECT i.*, v.name as vendor_name, v.trust_status, pr.name as product_name
      FROM issues i
      JOIN vendors v ON i.vendor_id = v.id
      LEFT JOIN products pr ON i.product_id = pr.id
    `;
    const params = [];
    if (vendor_id) {
      query += ' WHERE i.vendor_id = ?';
      params.push(vendor_id);
    }
    query += ' ORDER BY i.created_at DESC';

    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/issues', (req, res) => {
  try {
    const { vendor_id, product_id, purchase_id, title, issue_type, financial_loss, seller_response, notes } = req.body;
    if (!vendor_id || !title) return res.status(400).json({ error: 'Vendor and Title are required' });

    const loss = Number(financial_loss) || 0.0;
    const result = db.prepare(`
      INSERT INTO issues (vendor_id, product_id, purchase_id, title, issue_type, financial_loss, seller_response, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(vendor_id, product_id || null, purchase_id || null, title.trim(), issue_type || 'Account Expired Early', loss, seller_response || 'Pending', notes || '');

    if (loss > 0 || seller_response === 'Blocked' || seller_response === 'No Response') {
      db.prepare('UPDATE vendors SET trust_score = MAX(0, trust_score - 15) WHERE id = ?').run(vendor_id);
    }

    res.json({ id: result.lastInsertRowid, message: 'Issue logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/issues/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Evidence Vault
app.get('/api/evidence', (req, res) => {
  try {
    const { vendor_id, type } = req.query;
    let query = `
      SELECT e.*, v.name as vendor_name, v.trust_status
      FROM evidence_records e
      JOIN vendors v ON e.vendor_id = v.id
    `;
    const where = [];
    const params = [];

    if (vendor_id) { where.push('e.vendor_id = ?'); params.push(vendor_id); }
    if (type && type !== 'All') { where.push('e.evidence_type = ?'); params.push(type); }

    if (where.length > 0) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY e.created_at DESC';

    const evidence = db.prepare(query).all(...params);
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evidence', (req, res) => {
  try {
    const { vendor_id, evidence_type, title, image_data, source_url, notes } = req.body;
    if (!vendor_id || !title || !evidence_type) {
      return res.status(400).json({ error: 'Vendor, Evidence Type and Title are required' });
    }

    const result = db.prepare(`
      INSERT INTO evidence_records (vendor_id, evidence_type, title, image_data, source_url, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(vendor_id, evidence_type, title.trim(), image_data || '', source_url || '', notes || '');

    res.json({ id: result.lastInsertRowid, message: 'Evidence saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/evidence/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM evidence_records WHERE id = ?').run(req.params.id);
    res.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Vendor Notes
app.post('/api/vendors/:id/notes', (req, res) => {
  try {
    const { note_text } = req.body;
    if (!note_text || !note_text.trim()) {
      return res.status(400).json({ error: 'Note text is required' });
    }
    const result = db.prepare('INSERT INTO vendor_notes (vendor_id, note_text) VALUES (?, ?)').run(req.params.id, note_text.trim());
    res.json({ id: result.lastInsertRowid, message: 'Note added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Price Alerts
app.get('/api/price-alerts', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT pa.*, pr.name as product_name
      FROM price_alerts pa
      JOIN products pr ON pa.product_id = pr.id
      ORDER BY pa.created_at DESC
    `).all();

    for (const a of alerts) {
      a.matching_deals = db.prepare(`
        SELECT po.*, v.name as vendor_name, v.trust_status, v.trust_score,
               vp.platform, vp.identifier, vp.url
        FROM product_offers po
        JOIN vendors v ON po.vendor_id = v.id
        LEFT JOIN vendor_platforms vp ON po.platform_id = vp.id
        WHERE po.product_id = ? AND po.price <= ?
        ORDER BY po.price ASC
      `).all(a.product_id, a.target_price);
    }
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/price-alerts', (req, res) => {
  try {
    const { product_id, target_price } = req.body;
    const result = db.prepare(`
      INSERT INTO price_alerts (product_id, target_price) VALUES (?, ?)
    `).run(Number(product_id), Number(target_price));
    res.json({ id: result.lastInsertRowid, message: 'Price alert created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/price-alerts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM price_alerts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Price alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. Comprehensive Analytics
app.get('/api/analytics', (req, res) => {
  try {
    const vendorPerformance = db.prepare(`
      SELECT v.id, v.name, v.trust_status, v.trust_score,
             COUNT(p.id) as total_orders,
             COALESCE(SUM(p.price * p.quantity), 0) as total_spend,
             COALESCE(SUM(CASE WHEN p.result = 'Successful' THEN p.quantity ELSE 0 END), 0) as successful_accounts,
             COALESCE(SUM(CASE WHEN p.result = 'Failed' THEN p.quantity ELSE 0 END), 0) as failed_accounts,
             COALESCE(SUM(CASE WHEN p.result = 'Replaced' THEN p.quantity ELSE 0 END), 0) as replaced_accounts,
             COALESCE((SELECT SUM(financial_loss) FROM issues WHERE vendor_id = v.id), 0) as total_loss,
             (SELECT COUNT(*) FROM issues WHERE vendor_id = v.id) as issues_count,
             (SELECT COUNT(*) FROM product_offers WHERE vendor_id = v.id) as offers_count
      FROM vendors v
      LEFT JOIN purchases p ON v.id = p.vendor_id
      GROUP BY v.id
      ORDER BY v.trust_score DESC, total_spend DESC
    `).all();

    for (const vp of vendorPerformance) {
      const totalAccounts = vp.successful_accounts + vp.failed_accounts;
      vp.success_rate = totalAccounts > 0 ? Math.round((vp.successful_accounts / totalAccounts) * 100) : 100;
      if (vp.successful_accounts > 0 && vp.total_spend > 0) {
        vp.real_cost_per_unit = Number((vp.total_spend / vp.successful_accounts).toFixed(2));
      } else {
        vp.real_cost_per_unit = 0;
      }
    }

    const categorySpend = db.prepare(`
      SELECT pr.category, COUNT(p.id) as order_count, SUM(p.price * p.quantity) as total_spent
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.result = 'Successful'
      GROUP BY pr.category
      ORDER BY total_spent DESC
    `).all();

    const totalSpentResult = db.prepare("SELECT SUM(price * quantity) as total FROM purchases WHERE result = 'Successful'").get();
    const totalLostResult = db.prepare("SELECT SUM(financial_loss) as total FROM issues").get();

    res.json({
      vendorPerformance,
      categorySpend,
      totalSpent: totalSpentResult.total || 0,
      totalLost: totalLostResult.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 17. CSV Import & Export
app.post('/api/import-csv', (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({ error: 'CSV data rows are required' });
    }

    let insertedVendors = 0;
    let insertedOffers = 0;

    const findVendor = db.prepare('SELECT id FROM vendors WHERE LOWER(name) = LOWER(?)');
    const insertVendor = db.prepare('INSERT INTO vendors (name, trust_status, trust_score, notes, tags) VALUES (?, ?, ?, ?, ?)');
    const findProduct = db.prepare('SELECT id FROM products WHERE LOWER(name) = LOWER(?)');
    const insertProduct = db.prepare('INSERT INTO products (name, category) VALUES (?, ?)');
    const insertPlatform = db.prepare('INSERT INTO vendor_platforms (vendor_id, platform, identifier, url, is_primary) VALUES (?, ?, ?, ?, 1)');
    const insertOffer = db.prepare(`
      INSERT INTO product_offers (vendor_id, product_id, platform_id, price, currency, duration, warranty, availability, delivery_method, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of csvData) {
      const vendorName = (row.Vendor || row.vendor || row.VendorName || '').trim();
      const productName = (row.Product || row.product || row.ProductName || '').trim();
      const price = parseFloat(row.Price || row.price || 0);

      if (!vendorName) continue;

      let vendor = findVendor.get(vendorName);
      let vId;
      if (!vendor) {
        const vRes = insertVendor.run(
          vendorName,
          row.Status || row.status || 'Untested',
          Number(row.TrustScore || row.trust_score || 60),
          row.Notes || row.notes || '',
          row.Tags || row.tags || ''
        );
        vId = vRes.lastInsertRowid;
        insertedVendors++;

        const platform = (row.Platform || row.platform || 'Telegram').trim();
        const identifier = (row.Identifier || row.identifier || row.Username || '').trim();
        const url = (row.Link || row.link || row.Url || '').trim();
        if (identifier) {
          insertPlatform.run(vId, platform, identifier, url);
        }
      } else {
        vId = vendor.id;
      }

      if (productName && price > 0) {
        let product = findProduct.get(productName);
        let prId;
        if (!product) {
          const prRes = insertProduct.run(productName, row.Category || row.category || 'General');
          prId = prRes.lastInsertRowid;
        } else {
          prId = product.id;
        }

        insertOffer.run(
          vId,
          prId,
          null,
          price,
          row.Currency || row.currency || 'USD',
          row.Duration || row.duration || '1 Month',
          row.Warranty || row.warranty || '25 Days',
          'Available',
          row.DeliveryMethod || row.delivery_method || 'Direct Login',
          row.Description || row.description || ''
        );
        insertedOffers++;
      }
    }

    res.json({
      message: `کامیابی: ${insertedVendors} نئے وینڈرز اور ${insertedOffers} آفرز کامیابی سے امپورٹ ہو گئیں!`,
      insertedVendors,
      insertedOffers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export-csv', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT v.name as Vendor, v.trust_status as Status, v.trust_score as TrustScore, v.tags as Tags,
             vp.platform as Platform, vp.identifier as Identifier, vp.url as Link,
             pr.name as Product, pr.category as Category,
             po.price as Price, po.currency as Currency, po.duration as Duration, po.warranty as Warranty,
             po.delivery_method as DeliveryMethod, v.notes as Notes
      FROM vendors v
      LEFT JOIN vendor_platforms vp ON v.id = vp.vendor_id
      LEFT JOIN product_offers po ON v.id = po.vendor_id
      LEFT JOIN products pr ON po.product_id = pr.id
      ORDER BY v.name ASC
    `).all();

    if (data.length === 0) return res.status(404).send('No data');

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }

    res.header('Content-Type', 'text/csv');
    res.attachment('Vendora_Full_Export.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sample-csv', (req, res) => {
  const sample = `Vendor,Status,TrustScore,Platform,Identifier,Link,Product,Category,Price,Currency,Duration,Warranty,DeliveryMethod,Notes,Tags
"Alpha Supplier","Trusted",90,"Telegram","@alpha_sup","https://t.me/alpha_sup","CapCut Pro","Video Editing",1.80,"USD","1 Month","25 Days","Direct Login","Very fast support","Wholesale, AI Tools"
"Beta Digital","Untested",60,"WhatsApp","+923001234567","https://wa.me/923001234567","Claude Pro","AI Tools",17.00,"USD","1 Month","30 Days Full","Direct Login","New supplier","Cheap"`;

  res.header('Content-Type', 'text/csv');
  res.attachment('Vendora_Sample_Template.csv');
  res.send(sample);
});

/* ========================================================================= */
/*                          PHASE 4 AUTOMATION APIS                          */
/* ========================================================================= */

// 18. Monitored Sources (Telegram Channels, Websites, Discord Servers)
app.get('/api/monitored-sources', (req, res) => {
  try {
    const sources = db.prepare(`
      SELECT ms.*, v.name as vendor_name
      FROM monitored_sources ms
      LEFT JOIN vendors v ON ms.vendor_id = v.id
      ORDER BY ms.created_at DESC
    `).all();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/monitored-sources', (req, res) => {
  try {
    const { vendor_id, name, platform, source_url } = req.body;
    if (!name || !source_url) return res.status(400).json({ error: 'Name and Source URL are required' });

    const result = db.prepare(`
      INSERT INTO monitored_sources (vendor_id, name, platform, source_url, status, uptime_status, last_checked)
      VALUES (?, ?, ?, ?, 'Active', 'Online', datetime('now'))
    `).run(vendor_id ? Number(vendor_id) : null, name.trim(), platform || 'Telegram', source_url.trim());

    res.json({ id: result.lastInsertRowid, message: 'Source added for monitoring' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/monitored-sources/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM monitored_sources WHERE id = ?').run(req.params.id);
    res.json({ message: 'Monitored source deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 19. Ping / Check Source Status
app.post('/api/sources/ping/:id', (req, res) => {
  try {
    const source = db.prepare('SELECT * FROM monitored_sources WHERE id = ?').get(req.params.id);
    if (!source) return res.status(404).json({ error: 'Source not found' });

    // Mark online and updated
    db.prepare("UPDATE monitored_sources SET uptime_status = 'Online', last_checked = datetime('now') WHERE id = ?").run(req.params.id);
    res.json({ status: 'Online', last_checked: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 20. Detected Offers & Staging Feed
app.get('/api/detected-offers', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT do.*, ms.name as source_name, ms.platform as source_platform
      FROM detected_offers do
      LEFT JOIN monitored_sources ms ON do.source_id = ms.id
    `;
    const params = [];
    if (status && status !== 'All') {
      query += ' WHERE do.status = ?';
      params.push(status);
    }
    query += ' ORDER BY do.detected_at DESC';

    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 21. Approve Detected Offer into Live Database
app.post('/api/detected-offers/:id/approve', (req, res) => {
  try {
    const offer = db.prepare('SELECT * FROM detected_offers WHERE id = ?').get(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    // 1. Get or create vendor
    let vendor = db.prepare('SELECT id FROM vendors WHERE LOWER(name) = LOWER(?)').get(offer.vendor_name);
    let vId;
    if (!vendor) {
      const vRes = db.prepare("INSERT INTO vendors (name, trust_status, trust_score) VALUES (?, 'Untested', 65)").run(offer.vendor_name);
      vId = vRes.lastInsertRowid;
    } else {
      vId = vendor.id;
    }

    // 2. Get or create product
    let prod = db.prepare('SELECT id FROM products WHERE LOWER(name) = LOWER(?)').get(offer.product_name);
    let pId;
    if (!prod) {
      const pRes = db.prepare("INSERT INTO products (name, category) VALUES (?, 'General')").run(offer.product_name);
      pId = pRes.lastInsertRowid;
    } else {
      pId = prod.id;
    }

    // 3. Add to live product_offers
    db.prepare(`
      INSERT INTO product_offers (vendor_id, product_id, price, currency, duration, warranty, availability, delivery_method, description, last_checked)
      VALUES (?, ?, ?, ?, ?, ?, 'Available', 'Direct Login', ?, datetime('now'))
    `).run(vId, pId, offer.detected_price, offer.currency || 'USD', offer.duration || '1 Month', offer.warranty || '25 Days', offer.raw_snippet);

    // Mark as Approved
    db.prepare("UPDATE detected_offers SET status = 'Approved' WHERE id = ?").run(req.params.id);

    res.json({ message: 'آفر کامیابی سے منظور ہو کر لائیو ڈیٹا بیس میں شامل ہو گئی!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 22. Dismiss Detected Offer
app.post('/api/detected-offers/:id/dismiss', (req, res) => {
  try {
    db.prepare("UPDATE detected_offers SET status = 'Dismissed' WHERE id = ?").run(req.params.id);
    res.json({ message: 'آفر مسترد کر دی گئی' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 23. Ingestion Webhook Endpoint (For Telegram Bot or Feeds)
app.post('/api/webhooks/incoming', (req, res) => {
  try {
    const { text, sender, source_name } = req.body;
    if (!text) return res.status(400).json({ error: 'Text content is required' });

    // Smart auto parse
    let product = 'CapCut Pro';
    if (/claude/i.test(text)) product = 'Claude Pro';
    else if (/chatgpt|gpt/i.test(text)) product = 'ChatGPT Plus';
    else if (/canva/i.test(text)) product = 'Canva Pro';

    const priceMatch = text.match(/(?:\$|usd|price[:\s]*\$?)\s*([0-9]+(?:\.[0-9]+)?)/i) || text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:\$|usd)/i);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 2.00;

    let duration = '1 Month';
    if (/1\s*year/i.test(text)) duration = '1 Year';
    else if (/lifetime/i.test(text)) duration = 'Lifetime';

    const vendor = sender || 'Detected Vendor';

    const result = db.prepare(`
      INSERT INTO detected_offers (vendor_name, product_name, detected_price, currency, duration, warranty, raw_snippet, status, detected_at)
      VALUES (?, ?, ?, 'USD', ?, '25 Days', ?, 'Pending', datetime('now'))
    `).run(vendor, product, price, duration, text);

    res.json({ id: result.lastInsertRowid, message: 'Message ingested into Staging Queue' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 24. Database Backup Engine (1-Click Local Snapshot)
app.post('/api/backup', (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `vendora_backup_${timestamp}.db`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    fs.copyFileSync(DB_PATH, backupFilePath);

    const stats = fs.statSync(backupFilePath);
    res.json({
      message: 'ڈیٹا بیس کا مکمل بیک اپ کامیابی سے تیار ہو گیا ہے!',
      fileName: backupFileName,
      sizeBytes: stats.size,
      backupPath: backupFilePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db'));
    const list = files.map(f => {
      const full = path.join(BACKUPS_DIR, f);
      const stat = fs.statSync(full);
      return {
        fileName: f,
        sizeBytes: stat.size,
        createdAt: stat.birthtime
      };
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 25. Telegram Public Channel Scraper & Multi-Product Parser Helper
function parseMultiProductText(text) {
  if (!text || typeof text !== 'string') return [];

  let cleanText = text
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];

  const knownProducts = [
    { match: /capcut/i, defaultName: 'CapCut Pro', category: 'Video Editing' },
    { match: /claude/i, defaultName: 'Claude Pro', category: 'AI Tools' },
    { match: /chatgpt|gpt[- ]?4|openai/i, defaultName: 'ChatGPT Plus', category: 'AI Tools' },
    { match: /canva/i, defaultName: 'Canva Pro', category: 'Design' },
    { match: /netflix/i, defaultName: 'Netflix', category: 'Streaming' },
    { match: /prime\s*video|amazon\s*prime/i, defaultName: 'Prime Video', category: 'Streaming' },
    { match: /spotify/i, defaultName: 'Spotify Premium', category: 'Streaming' },
    { match: /youtube\s*prem/i, defaultName: 'YouTube Premium', category: 'Streaming' },
    { match: /nord\s*vpn/i, defaultName: 'NordVPN', category: 'VPN & Security' },
    { match: /surfshark/i, defaultName: 'Surfshark VPN', category: 'VPN & Security' },
    { match: /express\s*vpn/i, defaultName: 'ExpressVPN', category: 'VPN & Security' },
    { match: /midjourney/i, defaultName: 'Midjourney', category: 'AI Tools' },
    { match: /cursor/i, defaultName: 'Cursor Pro', category: 'Developer Tools' },
    { match: /grammarly/i, defaultName: 'Grammarly Premium', category: 'Tools' },
    { match: /tradingview/i, defaultName: 'TradingView Pro', category: 'Tools' },
    { match: /disney/i, defaultName: 'Disney+', category: 'Streaming' },
    { match: /crunchyroll/i, defaultName: 'Crunchyroll', category: 'Streaming' },
    { match: /apple\s*music/i, defaultName: 'Apple Music', category: 'Streaming' },
    { match: /adobe|photoshop|illustrator/i, defaultName: 'Adobe Creative Cloud', category: 'Design' },
    { match: /gemini/i, defaultName: 'Gemini Advanced', category: 'AI Tools' },
  ];

  for (const line of lines) {
    const priceMatch = line.match(/(?:\$|usd|rs\.?|price[:\s]*\$?)\s*([0-9]+(?:\.[0-9]+)?)/i) ||
                       line.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:\$|usd)/i);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[1]);
    if (isNaN(price) || price <= 0) continue;

    let duration = '1 Month';
    if (/lifetime/i.test(line)) duration = 'Lifetime';
    else if (/1\s*year|yearly|12\s*m(?:onths?)?/i.test(line)) duration = '1 Year';
    else if (/6\s*m(?:onths?)?/i.test(line)) duration = '6 Months';
    else if (/3\s*m(?:onths?)?/i.test(line)) duration = '3 Months';
    else if (/1\s*m(?:onth)?|monthly/i.test(line)) duration = '1 Month';
    else if (/30\s*days?/i.test(line)) duration = '30 Days';

    let warranty = '25 Days';
    const warMatch = line.match(/([0-9]+\s*(?:days?|d|months?|m|years?|y))\s*(?:warranty|replacement)/i) ||
                     line.match(/warranty[:\s]*([0-9]+\s*(?:days?|d|months?)|full)/i);
    if (warMatch) {
      warranty = warMatch[1].trim();
    } else if (/full\s*warranty|replacement/i.test(line)) {
      warranty = duration + ' Full';
    } else if (/no\s*warranty/i.test(line)) {
      warranty = 'No Warranty';
    }

    let productName = '';
    let category = 'General';
    for (const kp of knownProducts) {
      if (kp.match.test(line)) {
        productName = kp.defaultName;
        category = kp.category;
        break;
      }
    }

    if (!productName) {
      let cleanLine = line.replace(/^[\s•\-\*\>🔹👉✅🔥🍿👑⚡⭐💎✔️]+/g, '').trim();
      const parts = cleanLine.split(/[-—:|=@$]/);
      if (parts[0] && parts[0].trim().length > 2) {
        productName = parts[0].trim();
      } else {
        productName = 'Digital Service';
      }
    }

    let plan = '';
    if (/private|personal/i.test(line)) plan = 'Private';
    else if (/shared|profile|screen/i.test(line)) plan = 'Shared';

    const fullProductName = plan ? `${productName} (${plan})` : productName;

    results.push({
      product_name: fullProductName,
      category,
      price,
      duration,
      warranty,
      raw_line: line
    });
  }

  return results;
}

// Scrape Telegram Public Channel
app.post('/api/telegram/scrape-channel', async (req, res) => {
  try {
    const { channelUrl } = req.body;
    if (!channelUrl) return res.status(400).json({ error: 'چینل کا لنک یا یوزر نیم درج کرنا لازمی ہے' });

    let username = channelUrl.trim();
    username = username.replace(/^https?:\/\/(?:www\.)?t\.me\/(?:s\/)?/, '');
    username = username.replace(/^@/, '');
    username = username.split('/')[0].split('?')[0];

    if (!username) return res.status(400).json({ error: 'غلط ٹیلیگرام یوزر نیم' });

    const targetUrl = `https://t.me/s/${username}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `ٹیلیگرام سے رابطہ نہ ہو سکا (Status: ${response.status})۔ کیا چینل پبلک ہے؟` });
    }

    const html = await response.text();

    let channelTitle = username;
    const titleMatch = html.match(/<div class="tgme_channel_info_header_title"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i);
    if (titleMatch) {
      channelTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const messageRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    const allExtractedItems = [];
    let messagesCount = 0;

    while ((match = messageRegex.exec(html)) !== null) {
      messagesCount++;
      const messageHtml = match[1];
      const parsedItems = parseMultiProductText(messageHtml);
      if (parsedItems.length > 0) {
        allExtractedItems.push(...parsedItems);
      }
    }

    res.json({
      success: true,
      channelName: username,
      channelTitle: channelTitle || username,
      channelUrl: `https://t.me/${username}`,
      messagesScanned: messagesCount,
      totalItemsFound: allExtractedItems.length,
      items: allExtractedItems
    });
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: 'اسکریپنگ کے دوران ایرر: ' + error.message });
  }
});

// Bulk Multi-Product Raw Text Parser
app.post('/api/telegram/parse-bulk-text', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'ٹیکسٹ درج کریں' });

    const items = parseMultiProductText(text);
    res.json({
      success: true,
      totalItemsFound: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save Bulk Offers in One Transaction
app.post('/api/offers/bulk', (req, res) => {
  try {
    const { vendor_id, vendor_name, platform, identifier, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'کم از کم ایک پراڈکٹ منتخب کرنا ضروری ہے' });
    }

    let vId = vendor_id ? Number(vendor_id) : null;

    if (!vId) {
      const vName = (vendor_name || 'Telegram Store').trim();
      let vendor = db.prepare('SELECT id FROM vendors WHERE LOWER(name) = LOWER(?)').get(vName);
      if (!vendor) {
        const vRes = db.prepare("INSERT INTO vendors (name, trust_status, trust_score) VALUES (?, 'Untested', 65)").run(vName);
        vId = vRes.lastInsertRowid;
        if (identifier) {
          db.prepare("INSERT INTO vendor_platforms (vendor_id, platform, identifier, is_primary) VALUES (?, ?, ?, 1)")
            .run(vId, platform || 'Telegram', identifier.trim());
        }
      } else {
        vId = vendor.id;
      }
    }

    let insertedCount = 0;
    const findProduct = db.prepare('SELECT id FROM products WHERE LOWER(name) = LOWER(?)');
    const insertProduct = db.prepare('INSERT INTO products (name, category) VALUES (?, ?)');
    const insertOffer = db.prepare(`
      INSERT INTO product_offers (vendor_id, product_id, price, currency, duration, warranty, availability, delivery_method, description, last_checked)
      VALUES (?, ?, ?, 'USD', ?, ?, 'Available', 'Direct Login', ?, datetime('now'))
    `);

    for (const item of items) {
      if (!item.product_name || !item.price) continue;

      let pr = findProduct.get(item.product_name.trim());
      let prId;
      if (!pr) {
        const prRes = insertProduct.run(item.product_name.trim(), item.category || 'General');
        prId = prRes.lastInsertRowid;
      } else {
        prId = pr.id;
      }

      insertOffer.run(
        vId,
        prId,
        Number(item.price),
        item.duration || '1 Month',
        item.warranty || '25 Days',
        item.raw_line || ''
      );
      insertedCount++;
    }

    res.json({
      success: true,
      message: `${insertedCount} پراڈکٹس کامیابی سے محفوظ کر لی گئیں`,
      insertedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
//                   BUSINESS & RESELLER SUITE API ROUTES
// =========================================================================

// 26. Customers API
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT c.*,
             COUNT(cs.id) as total_orders,
             COALESCE(SUM(cs.sale_price), 0) as total_spent,
             COALESCE(SUM(cs.profit), 0) as total_profit
      FROM customers c
      LEFT JOIN customer_sales cs ON c.id = cs.customer_id
      GROUP BY c.id
      ORDER BY total_profit DESC, c.name ASC
    `).all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, contact, platform, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer name is required' });
    const result = db.prepare('INSERT INTO customers (name, contact, platform, notes) VALUES (?, ?, ?, ?)')
      .run(name.trim(), contact || '', platform || 'WhatsApp', notes || '');
    res.json({ id: result.lastInsertRowid, message: 'Customer added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 27. Customer Sales API
app.get('/api/customer-sales', (req, res) => {
  try {
    const sales = db.prepare(`
      SELECT cs.*,
             v.name as vendor_real_name,
             (SELECT identifier FROM vendor_platforms WHERE vendor_id = cs.vendor_id AND is_primary = 1 LIMIT 1) as vendor_primary_contact,
             (SELECT platform FROM vendor_platforms WHERE vendor_id = cs.vendor_id AND is_primary = 1 LIMIT 1) as vendor_primary_platform
      FROM customer_sales cs
      LEFT JOIN vendors v ON cs.vendor_id = v.id
      ORDER BY cs.sale_date DESC
    `).all();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-sales', (req, res) => {
  try {
    const {
      customer_id, customer_name, customer_contact,
      product_id, product_name,
      vendor_id, vendor_name, purchase_id,
      cost_price, sale_price, duration, warranty_days,
      credentials, notes, stock_id,
      payment_status, amount_paid, pending_amount, payment_method, payment_proof_trx
    } = req.body;

    if (!customer_name || !product_name || sale_price === undefined) {
      return res.status(400).json({ error: 'Customer name, product and sale price are required' });
    }

    const cost = Number(cost_price || 0);
    const sale = Number(sale_price);
    const profit = sale - cost;
    const days = Number(warranty_days || 25);
    const payStatus = payment_status || 'Paid';
    const paid = amount_paid !== undefined ? Number(amount_paid) : (payStatus === 'Paid' ? sale : 0);
    const pending = pending_amount !== undefined ? Number(pending_amount) : Math.max(0, sale - paid);
    const method = payment_method || 'JazzCash';
    const trx = payment_proof_trx || '';

    let cId = customer_id ? Number(customer_id) : null;
    if (!cId) {
      let cust = db.prepare('SELECT id FROM customers WHERE LOWER(name) = LOWER(?)').get(customer_name.trim());
      if (!cust) {
        const cRes = db.prepare('INSERT INTO customers (name, contact, platform) VALUES (?, ?, ?)').run(customer_name.trim(), customer_contact || '', 'WhatsApp');
        cId = cRes.lastInsertRowid;
      } else {
        cId = cust.id;
      }
    }

    const result = db.prepare(`
      INSERT INTO customer_sales (
        customer_id, customer_name, customer_contact,
        product_id, product_name, vendor_id, vendor_name, purchase_id,
        cost_price, sale_price, profit, duration, warranty_days,
        warranty_expiry, status, credentials, original_credentials,
        payment_status, amount_paid, pending_amount, payment_method, payment_proof_trx, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+' || ? || ' days'), 'Active', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cId, customer_name.trim(), customer_contact || '',
      product_id, product_name, vendor_id || null, vendor_name || '', purchase_id || null,
      cost, sale, profit, duration || '1 Month', days, days,
      credentials || '', credentials || '',
      payStatus, paid, pending, method, trx, notes || ''
    );

    const saleId = result.lastInsertRowid;

    if (stock_id) {
      db.prepare("UPDATE stock_inventory SET status = 'Sold', sold_to_customer_id = ?, sold_to_sale_id = ?, sold_at = datetime('now') WHERE id = ?")
        .run(cId, saleId, stock_id);
    }

    res.json({ id: saleId, profit, message: `فروخت کامیابی سے درج ہو گئی! خالص منافع: $${profit.toFixed(2)}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 28. Customer Renewals & Expiry Engine
app.get('/api/customer-sales/renewals', (req, res) => {
  try {
    const expiringSales = db.prepare(`
      SELECT cs.*,
             CAST((julianday(cs.warranty_expiry) - julianday('now')) AS INTEGER) as days_left,
             v.name as vendor_real_name
      FROM customer_sales cs
      LEFT JOIN vendors v ON cs.vendor_id = v.id
      WHERE cs.status IN ('Active', 'Replaced')
        AND cs.warranty_expiry IS NOT NULL
        AND (julianday(cs.warranty_expiry) - julianday('now')) <= 5
      ORDER BY days_left ASC
    `).all();

    const formatted = expiringSales.map(sale => {
      const days = sale.days_left;
      let urgency = days <= 0 ? 'Expired' : (days <= 1 ? 'Tomorrow' : `${days} Days Left`);
      let reminderMessage = `السلام علیکم ${sale.customer_name} بھائی!
امید ہے آپ خیریت سے ہوں گے۔
آپ کا پریمیم اکاؤنٹ: *${sale.product_name} (${sale.duration || '1 Month'})*
کی میعاد ${days <= 0 ? 'ختم ہو چکی ہے' : `${days} دن میں ختم ہو رہی ہے`}۔

کیا آپ اسے اگلے ماہ کے لیے رینیو (Renew) کروانا چاہتے ہیں تاکہ آپ کی سروس اور ڈیٹا بغیر کسی تعطل کے جاری رہے؟
شکریہ!`;

      return {
        ...sale,
        days_left: days,
        urgency,
        reminderMessage
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-sales/:id/renew', (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const sale = db.prepare('SELECT * FROM customer_sales WHERE id = ?').get(saleId);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const days = sale.warranty_days || 25;
    db.prepare(`
      UPDATE customer_sales
      SET warranty_expiry = datetime(COALESCE(warranty_expiry, 'now'), '+' || ? || ' days'),
          renewal_status = 'Renewed',
          status = 'Active'
      WHERE id = ?
    `).run(days, saleId);

    res.json({
      success: true,
      message: `${sale.customer_name} کا اکاؤنٹ اگلے ${days} دن کے لیے کامیابی سے رینیو کر دیا گیا!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 29. Customer Udhaar & Debt Ledger API
app.get('/api/customer-sales/udhaar', (req, res) => {
  try {
    const debts = db.prepare(`
      SELECT cs.*,
             c.name as real_cust_name, c.contact as real_cust_contact, c.platform as cust_platform
      FROM customer_sales cs
      LEFT JOIN customers c ON cs.customer_id = c.id
      WHERE cs.pending_amount > 0 OR cs.payment_status != 'Paid'
      ORDER BY cs.pending_amount DESC, cs.sale_date DESC
    `).all();

    const totalUdhaar = debts.reduce((sum, d) => sum + (Number(d.pending_amount) || 0), 0);

    const formatted = debts.map(d => {
      const msg = `محترم ${d.customer_name} صاحب!
امید ہے آپ بخیر ہوں گے۔
آپ کے آرڈر: *${d.product_name}* کی خریداری کی بقایا رقم:
*بقایا رقم: $${Number(d.pending_amount).toFixed(2)}* واجب الادا ہے۔

براہ کرم بذریعہ ${d.payment_method || 'JazzCash / Easypaisa / Binance'} ارسال فرما دیں۔
شکریہ!`;

      return {
        ...d,
        reminderMessage: msg
      };
    });

    res.json({
      totalUdhaar,
      count: debts.length,
      debts: formatted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customer-sales/:id/payment', (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const { payment_status, amount_paid, pending_amount, payment_proof_trx, payment_method } = req.body;

    const sale = db.prepare('SELECT * FROM customer_sales WHERE id = ?').get(saleId);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    db.prepare(`
      UPDATE customer_sales
      SET payment_status = ?,
          amount_paid = ?,
          pending_amount = ?,
          payment_proof_trx = COALESCE(?, payment_proof_trx),
          payment_method = COALESCE(?, payment_method)
      WHERE id = ?
    `).run(
      payment_status || 'Paid',
      Number(amount_paid !== undefined ? amount_paid : sale.sale_price),
      Number(pending_amount !== undefined ? pending_amount : 0),
      payment_proof_trx || '',
      payment_method || sale.payment_method,
      saleId
    );

    res.json({ success: true, message: 'ادائیگی کا ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 30. Low Stock Alert API
app.get('/api/stock-inventory/low-stock', (req, res) => {
  try {
    const products = db.prepare('SELECT id, name, category FROM products').all();
    const lowStock = [];

    for (const prod of products) {
      const inStock = db.prepare("SELECT COUNT(*) as count FROM stock_inventory WHERE product_id = ? AND status = 'In Stock'").get(prod.id).count;
      if (inStock <= 1) {
        const bestOffer = db.prepare(`
          SELECT po.*, v.name as vendor_name, vp.platform, vp.identifier
          FROM product_offers po
          JOIN vendors v ON po.vendor_id = v.id
          LEFT JOIN vendor_platforms vp ON v.id = vp.vendor_id AND vp.is_primary = 1
          WHERE po.product_id = ?
          ORDER BY po.price ASC LIMIT 1
        `).get(prod.id);

        lowStock.push({
          product_id: prod.id,
          product_name: prod.name,
          category: prod.category,
          in_stock_count: inStock,
          cheapest_vendor: bestOffer ? bestOffer.vendor_name : 'No vendor',
          cheapest_price: bestOffer ? bestOffer.price : null,
          vendor_identifier: bestOffer ? bestOffer.identifier : '',
          vendor_platform: bestOffer ? bestOffer.platform : 'Telegram'
        });
      }
    }

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 31. Vendor Warranty Speed & Trust Scorecard API
app.get('/api/vendors/:id/warranty-scorecard', (req, res) => {
  try {
    const vId = Number(req.params.id);
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(vId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const totalSales = db.prepare('SELECT COUNT(*) as count FROM customer_sales WHERE vendor_id = ?').get(vId).count;
    const totalPurchases = db.prepare('SELECT COUNT(*) as count FROM purchases WHERE vendor_id = ?').get(vId).count;
    const replacementsClaimed = db.prepare(`
      SELECT COUNT(*) as count FROM sale_replacement_chain src
      JOIN customer_sales cs ON src.sale_id = cs.id
      WHERE cs.vendor_id = ?
    `).get(vId).count;

    const totalAccounts = Math.max(totalSales + totalPurchases, 1);
    const faultRate = Math.min(100, Math.round((replacementsClaimed / totalAccounts) * 100));

    let speedRating = '⚡ تیز ترین (Ultra Fast)';
    let speedColor = 'emerald';
    if (faultRate > 50) {
      speedRating = '⚠️ خراب کوالٹی (High Fault Rate)';
      speedColor = 'rose';
    } else if (faultRate > 25) {
      speedRating = '⏳ مناسب (Average Reliability)';
      speedColor = 'amber';
    }

    res.json({
      vendor_id: vId,
      vendor_name: vendor.name,
      trust_status: vendor.trust_status,
      trust_score: vendor.trust_score,
      total_accounts_handled: totalAccounts,
      replacements_claimed: replacementsClaimed,
      fault_rate_percent: faultRate,
      speed_rating: speedRating,
      speed_color: speedColor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 32. 1-Click Digital Receipt & Safety Rules API
app.get('/api/customer-sales/:id/receipt', (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const sale = db.prepare(`
      SELECT cs.*,
             pr.safety_guidelines, pr.category as product_category
      FROM customer_sales cs
      JOIN products pr ON cs.product_id = pr.id
      WHERE cs.id = ?
    `).get(saleId);

    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const invoiceNo = `INV-${sale.id.toString().padStart(4, '0')}`;
    const defaultGuidelines = sale.safety_guidelines || 'پاس ورڈ یا ای میل تبدیل نہ کریں، اکاؤنٹ کو مجاز ڈیوائسز پر ہی استعمال کریں تاکہ وارنٹی برقرار رہے۔';

    const formattedWhatsAppText = `🧾 *OFFICIAL ORDER RECEIPT & WARRANTY CARD*
━━━━━━━━━━━━━━━━━━━━
🆔 *Invoice:* ${invoiceNo}
📅 *Date:* ${sale.sale_date}
👤 *Customer:* ${sale.customer_name}

📦 *Service:* ${sale.product_name}
⏳ *Duration:* ${sale.duration || '1 Month'}
🛡️ *Warranty Valid Till:* ${sale.warranty_expiry ? sale.warranty_expiry.slice(0, 10) : `${sale.warranty_days} Days`}

🔐 *LOGIN CREDENTIALS:*
\`${sale.credentials || 'Provided separately'}\`

💰 *PAYMENT DETAILS:*
• Total: $${Number(sale.sale_price).toFixed(2)}
• Paid: $${Number(sale.amount_paid || sale.sale_price).toFixed(2)} (${sale.payment_method || 'JazzCash'})
${sale.pending_amount > 0 ? `• ⚠️ Pending Balance: $${Number(sale.pending_amount).toFixed(2)}\n` : '• Status: FULLY PAID ✓\n'}
⚠️ *SAFETY RULES / احتیاطی اصول:*
${defaultGuidelines}

🌟 *100% Replacement Warranty Guarantee!*
For any support or query, contact us anytime. Thank you for your business!`;

    res.json({
      invoiceNo,
      sale,
      safetyGuidelines: defaultGuidelines,
      formattedWhatsAppText
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Auto-fetch exact vendor product offer
app.get('/api/vendor-product-offer', (req, res) => {
  try {
    const { vendor_id, product_id } = req.query;
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    let offer = null;
    if (vendor_id) {
      offer = db.prepare(`
        SELECT po.*, v.name as vendor_name, v.trust_status, v.trust_score
        FROM product_offers po
        JOIN vendors v ON po.vendor_id = v.id
        WHERE po.product_id = ? AND po.vendor_id = ?
        ORDER BY po.price ASC LIMIT 1
      `).get(Number(product_id), Number(vendor_id));
    }

    if (!offer) {
      offer = db.prepare(`
        SELECT po.*, v.name as vendor_name, v.trust_status, v.trust_score
        FROM product_offers po
        JOIN vendors v ON po.vendor_id = v.id
        WHERE po.product_id = ?
        ORDER BY po.price ASC LIMIT 1
      `).get(Number(product_id));
    }

    res.json(offer || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Replacement Chain API for Customer Sales
app.get('/api/customer-sales/:id/replacements', (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const sale = db.prepare('SELECT * FROM customer_sales WHERE id = ?').get(saleId);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const replacements = db.prepare(`
      SELECT * FROM sale_replacement_chain 
      WHERE sale_id = ? 
      ORDER BY replacement_number ASC
    `).all(saleId);

    res.json({
      sale,
      original_credentials: sale.original_credentials || sale.credentials,
      current_credentials: sale.credentials,
      replacement_count: replacements.length,
      replacements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-sales/:id/replacements', (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const { new_credentials, issue_reason, vendor_notes } = req.body;
    if (!new_credentials || !new_credentials.trim()) {
      return res.status(400).json({ error: 'نئی ریپلیسمنٹ اسناد درج کرنا ضروری ہے' });
    }

    const sale = db.prepare('SELECT * FROM customer_sales WHERE id = ?').get(saleId);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    // Count existing replacements
    const count = db.prepare('SELECT COUNT(*) as cnt FROM sale_replacement_chain WHERE sale_id = ?').get(saleId).cnt;
    const replacementNumber = count + 1;
    const previousCreds = sale.credentials || '';

    // If original_credentials not set yet, set it now
    if (!sale.original_credentials && previousCreds) {
      db.prepare('UPDATE customer_sales SET original_credentials = ? WHERE id = ?').run(previousCreds, saleId);
    }

    // Insert into chain
    db.prepare(`
      INSERT INTO sale_replacement_chain (
        sale_id, replacement_number, previous_credentials, new_credentials, issue_reason, vendor_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).run(
      saleId,
      replacementNumber,
      previousCreds,
      new_credentials.trim(),
      issue_reason || 'اکاؤنٹ بند ہو گیا',
      vendor_notes || ''
    );

    // Update customer_sales current credentials and status
    db.prepare(`
      UPDATE customer_sales 
      SET credentials = ?, status = 'Replaced' 
      WHERE id = ?
    `).run(new_credentials.trim(), saleId);

    res.json({
      success: true,
      replacementNumber,
      message: `ریپلیسمنٹ #${replacementNumber} کامیابی کے ساتھ چین میں شامل ہو گئی!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 28. 1-Click Warranty Claim Message Generator (Chain-Aware)
app.get('/api/customer-sales/:id/claim-message', (req, res) => {
  try {
    const sale = db.prepare(`
      SELECT cs.*, v.name as vendor_real_name,
             vp.platform, vp.identifier
      FROM customer_sales cs
      LEFT JOIN vendors v ON cs.vendor_id = v.id
      LEFT JOIN vendor_platforms vp ON cs.vendor_id = vp.vendor_id AND vp.is_primary = 1
      WHERE cs.id = ?
    `).get(req.params.id);

    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const replacements = db.prepare(`
      SELECT * FROM sale_replacement_chain WHERE sale_id = ? ORDER BY replacement_number ASC
    `).all(req.params.id);

    const vendorName = sale.vendor_name || sale.vendor_real_name || 'Vendor';
    const handle = sale.identifier || '';
    const platform = sale.platform || 'Telegram';
    const repCount = replacements.length;

    let chainSummary = '';
    if (repCount > 0) {
      chainSummary = `\n⚠️ REPLACEMENT ATTEMPT #${repCount + 1}\n(Note: This order previously had ${repCount} replacement(s) that also failed):\n`;
      chainSummary += `• Initial Account: ${sale.original_credentials || 'Initial login'}\n`;
      replacements.forEach(r => {
        chainSummary += `• Replacement #${r.replacement_number} (${r.issue_date?.slice(0, 10)}): ${r.new_credentials}\n`;
      });
    }

    const messageText = `Hello ${handle ? handle : vendorName},
Regarding Order / Purchase: ${sale.product_name} (${sale.duration || '1 Month'})
Purchased on: ${sale.sale_date}
Warranty: ${sale.warranty_days} Days
Current Account Credentials: ${sale.credentials || 'Login details provided'}
${chainSummary}
Issue: Account stopped working during valid warranty period.
Please check and provide a stable replacement account as per warranty terms. Thank you!`;

    let chatUrl = '';
    if (platform === 'Telegram' && handle) {
      chatUrl = `https://t.me/${handle.replace('@', '')}`;
    } else if (platform === 'WhatsApp' && handle) {
      const cleanNumber = handle.replace(/[^0-9]/g, '');
      chatUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
    }

    res.json({
      vendorName,
      platform,
      identifier: handle,
      chatUrl,
      messageText,
      sale,
      replacements,
      replacementCount: repCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 29. Stock Inventory Vault API
app.get('/api/stock-inventory', (req, res) => {
  try {
    const stock = db.prepare(`
      SELECT s.*, pr.name as product_real_name, v.name as vendor_real_name
      FROM stock_inventory s
      LEFT JOIN products pr ON s.product_id = pr.id
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.status ASC, s.added_at DESC
    `).all();

    const productCounts = db.prepare(`
      SELECT product_name, COUNT(*) as in_stock_count
      FROM stock_inventory
      WHERE status = 'In Stock'
      GROUP BY product_name
    `).all();

    res.json({ stock, productCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stock-inventory/bulk', (req, res) => {
  try {
    const { product_id, product_name, vendor_id, credentials_text, duration, cost_price } = req.body;
    if (!credentials_text || !product_name) {
      return res.status(400).json({ error: 'Product name and credentials text are required' });
    }

    const lines = credentials_text.split('\n').map(l => l.trim()).filter(Boolean);
    let inserted = 0;
    const insert = db.prepare(`
      INSERT INTO stock_inventory (product_id, product_name, vendor_id, credentials, duration, cost_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'In Stock')
    `);

    for (const line of lines) {
      insert.run(product_id || 1, product_name, vendor_id || null, line, duration || '1 Month', Number(cost_price || 0));
      inserted++;
    }

    res.json({ success: true, count: inserted, message: `شاندار! ${inserted} اکاؤنٹس اسٹاک والٹ میں شامل کر دیے گئے!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/stock-inventory/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM stock_inventory WHERE id = ?').run(req.params.id);
    res.json({ message: 'اسٹاک آئٹم ڈیلیٹ ہو گئی' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 30. Auto Customer Price List Generator
app.post('/api/customer-price-list/generate', (req, res) => {
  try {
    const { marginType, marginValue, headerText, footerText, currency, pkrRate } = req.body;
    const isPercent = marginType === 'percent' || marginType === 'percentage';
    const val = Number(marginValue ?? 1.50);
    const rate = Number(pkrRate || 280);
    const isPkr = (currency || '').toUpperCase() === 'PKR';

    const products = db.prepare(`
      SELECT pr.id, pr.name, pr.category,
             MIN(po.price) as lowest_cost,
             po.duration, po.warranty
      FROM products pr
      JOIN product_offers po ON pr.id = po.product_id
      WHERE po.availability = 'Available'
      GROUP BY pr.id
      ORDER BY pr.category ASC, pr.name ASC
    `).all();

    let message = (headerText || "🔥 TODAY'S FRESH DIGITAL ACCOUNTS & RATES 🔥\n⚡ Instant Delivery • Full Warranty Guaranteed\n") + "\n";
    
    let currentCategory = '';
    const generatedItems = [];

    for (const p of products) {
      if (!p.lowest_cost) continue;

      let sellingPriceUsd = 0;
      if (isPercent) {
        sellingPriceUsd = p.lowest_cost * (1 + val / 100);
      } else {
        sellingPriceUsd = p.lowest_cost + val;
      }
      sellingPriceUsd = Math.round(sellingPriceUsd * 100) / 100;

      let displayPrice = `$${sellingPriceUsd.toFixed(2)}`;
      let finalPrice = sellingPriceUsd;
      if (isPkr) {
        finalPrice = Math.round(sellingPriceUsd * rate);
        displayPrice = `Rs. ${finalPrice.toLocaleString()}`;
      }

      if (p.category !== currentCategory) {
        currentCategory = p.category;
        let catEmoji = '📦';
        if (/ai/i.test(currentCategory)) catEmoji = '🤖';
        else if (/video/i.test(currentCategory)) catEmoji = '🎬';
        else if (/streaming|ott/i.test(currentCategory)) catEmoji = '🍿';
        else if (/design/i.test(currentCategory)) catEmoji = '🎨';
        else if (/vpn/i.test(currentCategory)) catEmoji = '🛡️';

        message += `\n${catEmoji} ${currentCategory.toUpperCase()}:\n`;
      }

      message += `• ${p.name} (${p.duration || '1 Month'}) — ${displayPrice} (${p.warranty || 'Full Warranty'})\n`;

      generatedItems.push({
        id: p.id,
        name: p.name,
        category: p.category,
        costPrice: p.lowest_cost,
        sellingPrice: finalPrice,
        currency: isPkr ? 'PKR' : 'USD',
        duration: p.duration,
        warranty: p.warranty
      });
    }

    message += "\n" + (footerText || "📩 DM to order now: @YourStoreHandle\n💳 Payment: Binance / USDT / JazzCash / Easypaisa\n🌟 100% Replacement Warranty on all products!");

    res.json({
      success: true,
      messageText: message,
      items: generatedItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Vendora Server is running locally!`);
    console.log(`📡 Local API: http://localhost:${PORT}`);
    console.log(`📁 Database: ${DB_PATH}`);
    console.log(`💾 Backups: ${BACKUPS_DIR}`);
    console.log(`=======================================================`);
  });
}

export default app;
