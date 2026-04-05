const express = require('express');
const db = require('../db/database');
const { makeAuth, adminOnly, logAction } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();
const auth = makeAuth(db);

const employeeSchema = z.object({
  body: z.object({
    full_name: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    department: z.string().optional(),
    phone: z.string().optional()
  })
}).passthrough();

router.get('/', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM employees WHERE is_active=1 ORDER BY full_name').all());
});

router.post('/', auth, adminOnly, validate(employeeSchema), (req, res) => {
  const { full_name, email, department, phone } = req.body;
  const r = db.prepare('INSERT INTO employees (full_name, email, department, phone) VALUES (?,?,?,?)')
    .run(full_name, email || null, department || null, phone || null);
  logAction(db, req, 'CREATE_EMPLOYEE', 'employees', r.lastInsertRowid, { full_name });
  res.json({ id: r.lastInsertRowid });
});

router.put('/:id', auth, adminOnly, validate(employeeSchema), (req, res) => {
  const { full_name, email, department, phone } = req.body;
  db.prepare('UPDATE employees SET full_name=?, email=?, department=?, phone=? WHERE id=?')
    .run(full_name, email || null, department || null, phone || null, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE employees SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Deactivated' });
});

module.exports = router;
