# 🎮 Skyesports Inventory Management System v2.0

Full-featured broadcast equipment inventory system for esports production.

---

## 🚀 SETUP (3 steps)

### Step 1 — Install Node.js
Download and install from: **https://nodejs.org** (choose the LTS version)

### Step 2 — Run the server

**Windows:** Double-click `START_SERVER.bat`

**Mac / Linux:** Open Terminal in this folder, run:
```
bash start_server.sh
```

### Step 3 — Open in browser
The app opens automatically, or go to: **http://localhost:3000**

**Login:** `admin` / `pass`

---

## 📱 Use on phones, tablets, and other PCs

When the server starts, it shows a **Network URL** like:
```
http://192.168.1.100:3000
```
Open this URL on **any device on the same WiFi** — phones, tablets, laptops.
The app is fully mobile-responsive.

---

## ✅ Why This Version Works Without Issues

This version uses **sql.js** instead of better-sqlite3.
- **No C++ compiler needed** — works on Windows without Visual Studio
- **No node-gyp errors** — pure JavaScript/WebAssembly
- **Works on all platforms** — Windows, Mac, Linux

---

## 📦 What's Included

| Feature | Details |
|---------|---------|
| **Login & Roles** | Admin, Assistant, Viewer · JWT auth |
| **Asset Management** | Full CRUD · Auto IDs (SKY-0001) · Barcodes · QR codes |
| **QR/Barcode Scanning** | Camera scan on mobile · USB barcode scanner support |
| **Checkout System** | Check out to events · Track returns · Overdue alerts |
| **Maintenance** | Schedule & track repairs, calibrations, inspections |
| **12 Equipment Categories** | Cameras, Switchers, Audio, PCs, Encoders, Lighting… |
| **Import/Export** | Excel export (Google Sheets compatible) · CSV import |
| **Dashboard** | Live stats, bar charts, activity feed |
| **Audit Log** | Every action logged with user + timestamp |
| **Bulk QR Print** | Print QR label sheets for physical tagging |
| **12 Sample Assets** | Sony, Blackmagic, Elgato, Rode gear pre-loaded |

---

## 💾 Data & Backup

Your data is stored in `data/inventory.db`
- **Export to Excel** regularly from the Import/Export page
- **Backup** = copy the `data/` folder
- To move to a new PC: copy the whole folder, run `npm install` again

---

## 🌐 Expose to Internet (Future)

For web access outside your office:
1. Set a static local IP on your server PC (Windows: network adapter settings)
2. Forward port 3000 on your router to that local IP
3. Access via your public IP or point a domain to it

Change the JWT secret before going public:
Open `server.js` line 7 and replace the secret string.

---

## 🆘 Troubleshooting

**"node is not recognized"** → Install Node.js from https://nodejs.org

**npm install fails** → Check your internet connection and try again

**Port 3000 in use** → Set environment variable `PORT=3001` or edit server.js line 6

**Can't access from phone** → Make sure phone and PC are on same WiFi network
