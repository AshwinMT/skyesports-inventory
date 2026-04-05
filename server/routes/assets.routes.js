const express = require('express');
const db = require('../db/database');
const { makeAuth, adminOnly, logAction } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();
const auth = makeAuth(db);

const assetSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    asset_id: z.string().optional().or(z.literal('')),
    description: z.string().optional(),
    category_id: z.number().nullable().optional(),
    location_id: z.number().nullable().optional(),
    status: z.enum(['available', 'in-use', 'maintenance', 'retired', 'lost']).optional(),
    condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor']).optional(),
    serial_number: z.string().optional(),
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    purchase_price: z.coerce.number().optional().nullable(),
    current_value: z.coerce.number().optional().nullable(),
    barcode: z.string().optional(),
    notes: z.string().optional(),
    tags: z.string().optional(),
    is_consumable: z.boolean().or(z.number()).optional(),
    quantity: z.coerce.number().min(1).optional(),
    assigned_to: z.number().nullable().optional(),
    assigned_to_employee_id: z.number().nullable().optional(),
    invoice_url: z.string().optional()
  })
}).passthrough();

// Dashboard quick-scan
router.get('/barcode/:code', auth, (req, res) => {
  const c = req.params.code;
  const asset = db.prepare("SELECT a.*,c.name as category_name,c.icon as category_icon,c.color as category_color,l.name as location_name FROM assets a LEFT JOIN categories c ON a.category_id=c.id LEFT JOIN locations l ON a.location_id=l.id WHERE a.barcode=? OR a.asset_id=? OR a.serial_number=?").get(c,c,c);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

router.get('/', auth, (req, res) => {
  const { search, category, location, status, condition, page=1, limit=20 } = req.query;
  let where = ['1=1'], params = [];
  
  if (search) { 
    where.push('(a.name LIKE ? OR a.asset_id LIKE ? OR a.serial_number LIKE ? OR a.model LIKE ? OR a.manufacturer LIKE ? OR a.barcode LIKE ?)'); 
    const s = `%${search}%`; 
    params.push(s,s,s,s,s,s); 
  }
  if (category) { where.push('a.category_id=?'); params.push(category); }
  if (location) { where.push('a.location_id=?'); params.push(location); }
  if (status) { where.push('a.status=?'); params.push(status); }
  if (condition) { where.push('a.condition=?'); params.push(condition); }
  
  const w = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) as c FROM assets a WHERE ${w}`).get(...params)?.c||0;
  const offset = (parseInt(page)-1)*parseInt(limit);
  const assets = db.prepare(`SELECT a.*,c.name as category_name,c.icon as category_icon,c.color as category_color,l.name as location_name, u.full_name as assigned_to_name, e.full_name as assigned_to_employee_name FROM assets a LEFT JOIN categories c ON a.category_id=c.id LEFT JOIN locations l ON a.location_id=l.id LEFT JOIN users u ON a.assigned_to=u.id LEFT JOIN employees e ON a.assigned_to_employee_id=e.id WHERE ${w} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`).all(...params,parseInt(limit),offset);
  
  res.json({ assets, total, page: parseInt(page), pages: Math.ceil(total/parseInt(limit)) });
});

router.get('/:id', auth, (req, res) => {
  const id = req.params.id;
  const asset = db.prepare("SELECT a.*,c.name as category_name,c.icon as category_icon,c.color as category_color,l.name as location_name,u.full_name as assigned_to_name, e.full_name as assigned_to_employee_name, u2.full_name as created_by_name FROM assets a LEFT JOIN categories c ON a.category_id=c.id LEFT JOIN locations l ON a.location_id=l.id LEFT JOIN users u ON a.assigned_to=u.id LEFT JOIN employees e ON a.assigned_to_employee_id=e.id LEFT JOIN users u2 ON a.created_by=u2.id WHERE a.id=? OR a.asset_id=? OR a.barcode=?").get(id,id,id);
  if (!asset) return res.status(404).json({ error: 'Not found' });
  asset.history = db.prepare("SELECT h.*,u.full_name as changed_by_name FROM asset_history h LEFT JOIN users u ON h.changed_by=u.id WHERE h.asset_id=? ORDER BY h.created_at DESC LIMIT 20").all(asset.id);
  asset.checkouts = db.prepare("SELECT co.*,u.full_name as checked_out_by_name, e.full_name as checked_out_employee_name FROM checkouts co LEFT JOIN users u ON co.checked_out_by=u.id LEFT JOIN employees e ON co.checked_out_to_employee=e.id WHERE co.asset_id=? ORDER BY co.created_at DESC LIMIT 10").all(asset.id);
  res.json(asset);
});

router.post('/', auth, validate(assetSchema), (req, res) => {
  const d = req.body;
  const n = (db.prepare('SELECT COUNT(*) as c FROM assets').get()?.c||0) + 1;
  const asset_id = d.asset_id || `SKY-${String(n).padStart(4,'0')}`;
  const barcode = d.barcode || `SKY${Date.now()}`;
  const is_consumable = d.is_consumable ? 1 : 0;
  
  try {
    const r = db.prepare('INSERT INTO assets (asset_id,name,description,category_id,location_id,status,condition,serial_number,model,manufacturer,purchase_price,barcode,qr_code,notes,tags,assigned_to,assigned_to_employee_id,is_consumable,quantity,invoice_url,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(asset_id, d.name, d.description||'', d.category_id||null, d.location_id||null, d.status||'available', d.condition||'good', d.serial_number||'', d.model||'', d.manufacturer||'', d.purchase_price||null, barcode, asset_id, d.notes||'', d.tags||'', d.assigned_to||null, d.assigned_to_employee_id||null, is_consumable, d.quantity || 1, d.invoice_url||null, req.user.id);
      
    db.prepare('INSERT INTO asset_history (asset_id,action,new_value,changed_by,notes) VALUES (?,?,?,?,?)')
      .run(r.lastInsertRowid, 'CREATED', JSON.stringify({ name: d.name, quantity: d.quantity }), req.user.id, 'Asset created');
    
    logAction(db, req, 'CREATE_ASSET', 'assets', r.lastInsertRowid, { asset_id, name: d.name });
    res.json({ id: r.lastInsertRowid, asset_id, barcode });
  } catch(e) { 
    res.status(400).json({ error: e.message }); 
  }
});

router.put('/:id', auth, validate(assetSchema), (req, res) => {
  const old = db.prepare('SELECT * FROM assets WHERE id=?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  const d = req.body;
  const is_consumable = d.is_consumable ? 1 : 0;
  
  db.prepare("UPDATE assets SET name=?,description=?,category_id=?,location_id=?,status=?,condition=?,serial_number=?,model=?,manufacturer=?,purchase_price=?,notes=?,tags=?,assigned_to=?,assigned_to_employee_id=?,is_consumable=?,quantity=?,invoice_url=?,updated_at=datetime('now') WHERE id=?")
    .run(d.name, d.description||'', d.category_id||null, d.location_id||null, d.status||old.status, d.condition||old.condition, d.serial_number||'', d.model||'', d.manufacturer||'', d.purchase_price||null, d.notes||'', d.tags||'', d.assigned_to||null, d.assigned_to_employee_id||null, is_consumable, d.quantity || 1, d.invoice_url||null, req.params.id);
    
  db.prepare('INSERT INTO asset_history (asset_id,action,old_value,new_value,changed_by) VALUES (?,?,?,?,?)')
    .run(req.params.id, 'UPDATED', JSON.stringify(old), JSON.stringify(d), req.user.id);
    
  logAction(db, req, 'UPDATE_ASSET', 'assets', req.params.id, d);
  res.json({ message: 'Updated' });
});

// Global "Search Everywhere"
router.get('/search/global', auth, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ assets: [], employees: [], users: [] });
  const term = `%${q}%`;
  
  const assets = db.prepare("SELECT id, asset_id, name, 'asset' as type FROM assets WHERE name LIKE ? OR asset_id LIKE ? OR serial_number LIKE ? LIMIT 5").all(term, term, term);
  const employees = db.prepare("SELECT id, full_name as name, 'employee' as type FROM employees WHERE full_name LIKE ? OR department LIKE ? LIMIT 5").all(term, term);
  const users = db.prepare("SELECT id, full_name as name, 'user' as type FROM users WHERE full_name LIKE ? OR username LIKE ? LIMIT 5").all(term, term);
  
  res.json({ assets, employees, users });
});

// Excel Export
router.get('/export/excel', auth, (req, res) => {
  const XLSX = require('xlsx');
  const data = db.prepare("SELECT a.*, c.name as category, l.name as location FROM assets a LEFT JOIN categories c ON a.category_id=c.id LEFT JOIN locations l ON a.location_id=l.id").all();
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Category Quick Add
router.post('/categories', auth, (req, res) => {
  const { name, icon, color } = req.body;
  const r = db.prepare("INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)").run(name, icon || '📦', color || '#6366f1');
  res.json({ id: r.lastInsertRowid, name });
});

module.exports = router;
