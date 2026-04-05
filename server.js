const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const db = require('./server/db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client', 'dist'))); // Serve Vite React output

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./server/routes/auth.routes');
const assetsRoutes = require('./server/routes/assets.routes');
const checkoutsRoutes = require('./server/routes/checkouts.routes');
const employeesRoutes = require('./server/routes/employees.routes');
const configRoutes = require('./server/routes/config.routes');
const uploadRoutes = require('./server/routes/upload.routes');
const usersRoutes = require('./server/routes/users.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/checkouts', checkoutsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', configRoutes);

// Fallback for missing React routes (client-side routing)
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html')));

async function boot() {
  await db.init();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

boot();
