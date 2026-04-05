const express = require('express');
const db = require('../db/database');
const { makeAuth, adminOnly } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

const router = express.Router();
const auth = makeAuth(db);

// Users
router.get('/users', auth, adminOnly, (req, res) => res.json(db.prepare('SELECT id,username,role,full_name,email,created_at,last_login,is_active FROM users ORDER BY created_at DESC').all()));
router.post('/users', auth, adminOnly, (req, res) => {
  const { username, password, role, full_name, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const r = db.prepare('INSERT INTO users (username,password,role,full_name,email) VALUES (?,?,?,?,?)')
      .run(username, bcrypt.hashSync(password, 10), role || 'assistant', full_name || '', email || '');
    res.json({ id: r.lastInsertRowid });
  } catch(e) { res.status(400).json({ error: 'Username already exists' }); }
});
router.put('/users/:id', auth, adminOnly, (req, res) => {
  const { full_name, email, role, is_active, password } = req.body;
  if (password) {
    db.prepare('UPDATE users SET full_name=?,email=?,role=?,is_active=?,password=? WHERE id=?').run(full_name||'',email||'',role,is_active??1,bcrypt.hashSync(password,10),req.params.id);
  } else {
    db.prepare('UPDATE users SET full_name=?,email=?,role=?,is_active=? WHERE id=?').run(full_name||'',email||'',role,is_active??1,req.params.id);
  }
  res.json({ message: 'Updated' });
});
router.delete('/users/:id', auth, adminOnly, (req, res) => {
  if (req.params.id == req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('UPDATE users SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Deactivated' });
});

// Categories
router.get('/categories', auth, (req, res) => res.json(db.prepare("SELECT c.*,(SELECT COUNT(*) FROM assets a WHERE a.category_id=c.id) as asset_count FROM categories c ORDER BY c.name").all()));
router.post('/categories', auth, adminOnly, (req, res) => {
  const r = db.prepare('INSERT INTO categories (name,icon,color,description) VALUES (?,?,?,?)').run(req.body.name,req.body.icon||'📦',req.body.color||'#6366f1',req.body.description||'');
  res.json({ id: r.lastInsertRowid });
});

// Locations
router.get('/locations', auth, (req, res) => res.json(db.prepare("SELECT l.*,(SELECT COUNT(*) FROM assets a WHERE a.location_id=l.id) as asset_count FROM locations l ORDER BY l.name").all()));
router.post('/locations', auth, adminOnly, (req, res) => {
  const r = db.prepare('INSERT INTO locations (name,type,description,address) VALUES (?,?,?,?)').run(req.body.name,req.body.type||'storage',req.body.description||'',req.body.address||'');
  res.json({ id: r.lastInsertRowid });
});

// Dashboard metrics
router.get('/dashboard', auth, (req,res) => {
  res.json({
    total_assets: db.prepare('SELECT COUNT(*) as c FROM assets').get()?.c||0,
    available: db.prepare("SELECT COUNT(*) as c FROM assets WHERE status='available'").get()?.c||0,
    in_use: db.prepare("SELECT COUNT(*) as c FROM assets WHERE status='in-use'").get()?.c||0,
    maintenance: db.prepare("SELECT COUNT(*) as c FROM assets WHERE status='maintenance'").get()?.c||0,
    total_value: db.prepare("SELECT COALESCE(SUM(purchase_price),0) as v FROM assets WHERE status!='retired'").get()?.v||0,
    categories: db.prepare("SELECT c.name,c.icon,c.color,(SELECT COUNT(*) FROM assets a WHERE a.category_id=c.id) as count FROM categories c ORDER BY count DESC").all(),
    locations: db.prepare("SELECT l.name,l.type,(SELECT COUNT(*) FROM assets a WHERE a.location_id=l.id) as count FROM locations l ORDER BY count DESC").all(),
    recent_activity: db.prepare("SELECT h.*, a.name as asset_name, u.full_name as user_name FROM asset_history h LEFT JOIN assets a ON h.asset_id = a.id LEFT JOIN users u ON h.changed_by = u.id ORDER BY h.created_at DESC LIMIT 10").all()
  });
});

module.exports = router;
