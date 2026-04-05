const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'skyesports_secret_2025_inv';

function makeAuth(db) {
  return function(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try { 
      req.user = jwt.verify(token, JWT_SECRET); 
      next(); 
    }
    catch { res.status(401).json({ error: 'Invalid token' }); }
  };
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

function logAction(db, req, action, resource, resourceId, details) {
  try { 
    db.prepare('INSERT INTO audit_log (user_id,action,resource,resource_id,details,ip_address) VALUES (?,?,?,?,?,?)').run(
      req.user?.id || null, 
      action, 
      resource, 
      String(resourceId), 
      JSON.stringify(details), 
      req.ip || ''
    ); 
  } catch(e) {}
}

module.exports = { makeAuth, adminOnly, logAction, JWT_SECRET };
