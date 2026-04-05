const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'inventory.db');

class DatabaseManager {
  constructor() {
    this.db = null;
    this._timer = null;
  }

  async init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      this.db = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      this.db = new SQL.Database();
    }

    // Persist on clean exit
    process.on('exit', () => this.persist());
    process.on('SIGINT', () => { this.persist(); process.exit(0); });
    process.on('SIGTERM', () => { this.persist(); process.exit(0); });
    
    // Create necessary schema
    this.createSchema();
  }

  save() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => this.persist(), 800);
  }

  persist() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      if (!fs.existsSync(path.dirname(DB_PATH))) {
          fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      }
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }

  exec(sql) {
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const s of stmts) {
      try { this.db.run(s); } catch(e) { /* ignore CREATE IF NOT EXISTS errors */ }
    }
    this.save();
    return this;
  }

  prepare(sql) {
    const self = this;
    return {
      run(...args) {
        const params = args.flat();
        self.db.run(sql, params);
        const r = self.db.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = r[0]?.values?.[0]?.[0] ?? null;
        self.save();
        return { lastInsertRowid, changes: 1 };
      },
      get(...args) {
        const params = args.flat();
        const stmt = self.db.prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return row;
      },
      all(...args) {
        const params = args.flat();
        const stmt = self.db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      }
    };
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self.db.run('BEGIN');
      try {
        fn(...args);
        self.db.run('COMMIT');
        self.save();
      } catch (e) {
        self.db.run('ROLLBACK');
        throw e;
      }
    };
  }
  
  createSchema() {
     const schema = [
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'assistant', full_name TEXT, email TEXT, avatar TEXT, created_at DATETIME DEFAULT (datetime('now')), last_login DATETIME, is_active INTEGER DEFAULT 1)`,
      // NEW TABLE for employees
      `CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, email TEXT, department TEXT, phone TEXT, created_at DATETIME DEFAULT (datetime('now')), is_active INTEGER DEFAULT 1)`,
      `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, parent_id INTEGER, icon TEXT DEFAULT '📦', color TEXT DEFAULT '#6366f1', description TEXT, created_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT DEFAULT 'storage', description TEXT, address TEXT, created_at DATETIME DEFAULT (datetime('now')))`,
      // MODIFIED assets table
      `CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, category_id INTEGER, location_id INTEGER, status TEXT DEFAULT 'available', condition TEXT DEFAULT 'good', serial_number TEXT, model TEXT, manufacturer TEXT, purchase_date DATE, purchase_price REAL, current_value REAL, warranty_expiry DATE, barcode TEXT UNIQUE, qr_code TEXT, image TEXT, invoice_url TEXT, notes TEXT, tags TEXT, assigned_to INTEGER, assigned_to_employee_id INTEGER, is_consumable INTEGER DEFAULT 0, quantity INTEGER DEFAULT 1, created_by INTEGER, created_at DATETIME DEFAULT (datetime('now')), updated_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS asset_history (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER, action TEXT NOT NULL, old_value TEXT, new_value TEXT, changed_by INTEGER, notes TEXT, created_at DATETIME DEFAULT (datetime('now')))`,
      // MODIFIED checkouts table
      `CREATE TABLE IF NOT EXISTS checkouts (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER, checked_out_by INTEGER, checked_out_to_employee INTEGER, approved_by INTEGER, event_name TEXT, location TEXT, quantity INTEGER DEFAULT 1, checkout_date DATETIME DEFAULT (datetime('now')), expected_return DATETIME, actual_return DATETIME, return_condition TEXT, return_notes TEXT, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS maintenance (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER, type TEXT, title TEXT NOT NULL, description TEXT, scheduled_date DATE, completed_date DATE, cost REAL, performed_by TEXT, vendor TEXT, next_maintenance DATE, status TEXT DEFAULT 'scheduled', created_by INTEGER, created_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT NOT NULL, message TEXT, type TEXT DEFAULT 'info', is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT NOT NULL, resource TEXT, resource_id TEXT, details TEXT, ip_address TEXT, created_at DATETIME DEFAULT (datetime('now')))`,
      // NEW TABLES FOR V2.1
      `CREATE TABLE IF NOT EXISTS asset_serials (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, serial_number TEXT UNIQUE NOT NULL, status TEXT DEFAULT 'available', assigned_employee_id INTEGER, created_at DATETIME DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS asset_media (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, url TEXT NOT NULL, type TEXT DEFAULT 'image', created_at DATETIME DEFAULT (datetime('now')))`
    ];
    for (const stmt of schema) {
      try { this.db.run(stmt); } catch(e) { }
    }
    
    // Attempt schema migrations if they exist but don't have new columns
    try { this.db.run("ALTER TABLE assets ADD COLUMN quantity INTEGER DEFAULT 1"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN is_consumable INTEGER DEFAULT 0"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN invoice_url TEXT"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN assigned_to_employee_id INTEGER"); } catch(e) {}
    try { this.db.run("ALTER TABLE checkouts ADD COLUMN quantity INTEGER DEFAULT 1"); } catch(e) {}
    try { this.db.run("ALTER TABLE checkouts ADD COLUMN checked_out_to_employee INTEGER"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN brand TEXT"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN purchase_date DATE"); } catch(e) {}
    try { this.db.run("ALTER TABLE assets ADD COLUMN warranty_expiry DATE"); } catch(e) {}
    
    this.save();
  }
}

const dbManager = new DatabaseManager();

module.exports = dbManager;
