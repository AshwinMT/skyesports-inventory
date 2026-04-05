const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { makeAuth, JWT_SECRET } = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

const router = express.Router();
const auth = makeAuth(db);

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username=? AND is_active=1').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  db.prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").run(user.id);
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name, email: user.email } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', auth, (req, res) => {
  res.json(db.prepare('SELECT id,username,role,full_name,email,created_at,last_login FROM users WHERE id=?').get(req.user.id));
});

module.exports = router;
