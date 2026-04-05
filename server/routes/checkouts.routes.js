const express = require('express');
const db = require('../db/database');
const { makeAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { z } = require('zod');

const router = express.Router();
const auth = makeAuth(db);

const checkoutSchema = z.object({
  body: z.object({
    asset_id: z.number(),
    event_name: z.string().optional(),
    location: z.string().optional(),
    quantity: z.number().min(1).default(1),
    expected_return: z.string().optional().nullable(),
    assigned_to_employee_id: z.number().optional().nullable(),
  })
}).passthrough();

router.get('/', auth, (req, res) => {
  let where = ['1=1'], params = [];
  if (req.query.status) { where.push('co.status=?'); params.push(req.query.status); }
  
  res.json(db.prepare(`
    SELECT co.*, a.name as asset_name, a.asset_id as asset_code, 
           u.full_name as user_name, u2.full_name as approved_by_name,
           e.full_name as employee_name
    FROM checkouts co 
    LEFT JOIN assets a ON co.asset_id=a.id 
    LEFT JOIN users u ON co.checked_out_by=u.id 
    LEFT JOIN employees e ON co.checked_out_to_employee=e.id
    LEFT JOIN users u2 ON co.approved_by=u2.id 
    WHERE ${where.join(' AND ')} 
    ORDER BY co.created_at DESC LIMIT 100
  `).all(...params));
});

router.post('/', auth, validate(checkoutSchema), (req, res) => {
  const { asset_id, event_name, location, expected_return, quantity, assigned_to_employee_id } = req.body;
  const asset = db.prepare('SELECT * FROM assets WHERE id=?').get(asset_id);
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.is_consumable) {
    if (asset.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }
    // Reduce quantity
    db.prepare('UPDATE assets SET quantity = quantity - ?, updated_at=datetime("now") WHERE id=?').run(quantity, asset_id);
  } else {
    if (asset.status === 'in-use') return res.status(400).json({ error: 'Asset already checked out' });
    db.prepare("UPDATE assets SET status='in-use', assigned_to=?, assigned_to_employee_id=?, updated_at=datetime('now') WHERE id=?")
      .run(req.user.id, assigned_to_employee_id || null, asset_id);
  }
  
  const r = db.prepare("INSERT INTO checkouts (asset_id, checked_out_by, checked_out_to_employee, event_name, location, expected_return, quantity, status) VALUES (?,?,?,?,?,?,?,'active')")
    .run(asset_id, req.user.id, assigned_to_employee_id || null, event_name || '', location || '', expected_return || null, quantity);
    
  db.prepare('INSERT INTO asset_history (asset_id,action,new_value,changed_by,notes) VALUES (?,?,?,?,?)')
    .run(asset_id, 'CHECKED_OUT', JSON.stringify({ event_name, location, quantity }), req.user.id, `For: ${event_name || 'Event'} (Qty: ${quantity})`);
    
  res.json({ id: r.lastInsertRowid });
});

router.post('/:id/return', auth, (req, res) => {
  const { return_condition, return_notes, returned_quantity } = req.body; // Can support partial returns for consumables
  const co = db.prepare('SELECT * FROM checkouts WHERE id=?').get(req.params.id);
  if (!co) return res.status(404).json({ error: 'Not found' });
  
  const asset = db.prepare('SELECT * FROM assets WHERE id=?').get(co.asset_id);
  const qtyToReturn = returned_quantity || co.quantity;

  if (asset.is_consumable) {
    db.prepare('UPDATE assets SET quantity = quantity + ?, updated_at=datetime("now") WHERE id=?').run(qtyToReturn, co.asset_id);
  } else {
    db.prepare("UPDATE assets SET status='available', assigned_to=NULL, assigned_to_employee_id=NULL, condition=?, updated_at=datetime('now') WHERE id=?")
      .run(return_condition || 'good', co.asset_id);
  }
  
  // If partial return, maybe we update checkout quantity instead of marking returned. For now we mark returned.
  db.prepare("UPDATE checkouts SET status='returned',actual_return=datetime('now'),return_condition=?,return_notes=? WHERE id=?")
    .run(return_condition || 'good', return_notes || '', req.params.id);
    
  db.prepare('INSERT INTO asset_history (asset_id,action,new_value,changed_by,notes) VALUES (?,?,?,?,?)')
    .run(co.asset_id, 'RETURNED', JSON.stringify({ return_condition, qtyReturned: qtyToReturn }), req.user.id, return_notes || '');
    
  res.json({ message: 'Returned' });
});

module.exports = router;
