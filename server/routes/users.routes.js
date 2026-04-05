const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { makeAuth, adminOnly, logAction } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();
const auth = makeAuth(db);

const userSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(4).optional(),
    role: z.enum(['admin', 'assistant', 'viewer']),
    full_name: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    is_active: z.coerce.number().optional()
  })
}).passthrough();

router.get('/', auth, (req, res) => {
  // If not admin, can only see basic info or themselves
  const users = db.prepare('SELECT id, username, role, full_name, email, is_active, created_at, last_login FROM users ORDER BY full_name').all();
  res.json(users);
});

router.post('/', auth, adminOnly, validate(userSchema), (req, res) => {
  const { username, password, role, full_name, email } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  
  const hash = bcrypt.hashSync(password, 10);
  try {
    const r = db.prepare('INSERT INTO users (username, password, role, full_name, email) VALUES (?,?,?,?,?)')
      .run(username, hash, role, full_name, email || null);
    logAction(db, req, 'CREATE_USER', 'users', r.lastInsertRowid, { username, role });
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

router.put('/:id', auth, validate(userSchema), (req, res) => {
  const targetId = parseInt(req.params.id);
  const currentUser = req.user;
  
  // Hierarchy check: Admin (all), Assistant (themselves or viewers), Viewer (none)
  if (currentUser.role === 'admin' || (currentUser.role === 'assistant' && currentUser.id === targetId)) {
    const { password, role, full_name, email, is_active } = req.body;
    let sql = 'UPDATE users SET role=?, full_name=?, email=?, is_active=?';
    let params = [role, full_name, email || null, is_active ?? 1];
    
    if (password) {
      sql += ', password=?';
      params.push(bcrypt.hashSync(password, 10));
    }
    
    sql += ' WHERE id=?';
    params.push(targetId);
    
    db.prepare(sql).run(...params);
    res.json({ message: 'Updated' });
  } else {
    res.status(403).json({ error: 'Permission denied' });
  }
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE users SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Deactivated' });
});

module.exports = router;
