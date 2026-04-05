import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LayoutDashboard, Database, FolderKanban, Users, ShieldAlert, MapPin, ScanLine, Settings, LogOut, User, Search } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Scanner from './pages/Scanner';
import Projects from './pages/Projects';
import UsersPage from './pages/Users';
import AuditLog from './pages/AuditLog';
import './App.css';

const NavigationLinks = () => {
  const activeStyle = { background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' };
  const baseStyle = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 8, marginBottom: 4, transition: 'all 0.2s' };
  
  return (
    <>
      <NavLink to="/" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <LayoutDashboard size={20} /> <span className="nav-text">Dashboard</span>
      </NavLink>
      <NavLink to="/assets" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <Database size={20} /> <span className="nav-text">Assets</span>
      </NavLink>
      <NavLink to="/projects" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <FolderKanban size={20} /> <span className="nav-text">Projects</span>
      </NavLink>
      <NavLink to="/locations" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <MapPin size={20} /> <span className="nav-text">Locations</span>
      </NavLink>
      <NavLink to="/users" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <Users size={20} /> <span className="nav-text">Users</span>
      </NavLink>
      <NavLink to="/audit" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <ShieldAlert size={20} /> <span className="nav-text">Audit Log</span>
      </NavLink>
      <NavLink to="/settings" style={({ isActive }) => isActive ? { ...baseStyle, ...activeStyle } : baseStyle}>
        <Settings size={20} /> <span className="nav-text">Settings</span>
      </NavLink>
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = React.useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  const navigate = useNavigate();

  if (loading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',color:'var(--accent)'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 2) { setSearchResults(null); return; }
    try {
      const res = await axios.get(`/api/search/global?q=${val}`);
      setSearchResults(res.data);
    } catch {}
  };

  const handleResultClick = (id, type) => {
    setSearchQuery('');
    setSearchResults(null);
    if (type === 'asset') navigate(`/assets/${id}`);
    if (type === 'employee') navigate(`/users?tab=employees&id=${id}`);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className="sidebar desktop-only">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <img src="/logo.png" alt="Skyesports Logo" style={{ height: 40 }} />
        </div>
        <div style={{flex:1,padding:16, overflowY:'auto'}}>
          <p style={{fontSize:11, letterSpacing: 1, color:'rgba(255,255,255,0.3)', marginBottom:16, fontWeight: 600}}>MAIN MENU</p>
          <NavigationLinks />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        <div className="topbar">
          <div className="mobile-only">
            <img src="/logo.png" alt="Skyesports Logo" style={{ height: 32 }} />
          </div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              className="glass-input top-search desktop-only" 
              placeholder="Search everywhere..." 
              style={{ paddingLeft: 40 }} 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            
            {searchResults && (
              <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 1000, padding: 8, maxHeight: 400, overflowY: 'auto' }}>
                {searchResults.assets.map(a => (
                  <div key={a.id} className="search-result-item" onClick={() => handleResultClick(a.id, 'asset')}>
                    <Database size={14} /> <span>{a.name} ({a.asset_id})</span>
                  </div>
                ))}
                {searchResults.employees.map(e => (
                  <div key={e.id} className="search-result-item" onClick={() => handleResultClick(e.id, 'employee')}>
                    <Users size={14} /> <span>{e.name}</span>
                  </div>
                ))}
                {!searchResults.assets.length && !searchResults.employees.length && (
                  <div style={{ padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>No results found</div>
                )}
              </div>
            )}
          </div>

          <div style={{flex:1}}></div>
          <div style={{display:'flex',alignItems:'center',gap:12, position: 'relative'}}>
            <span className="desktop-only" style={{fontSize:14}}>{user.full_name || user.username}</span>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{width:32,height:32,background:'linear-gradient(135deg, var(--accent-secondary), var(--accent))',borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:14, cursor: 'pointer'}}>
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </div>

            {showProfileMenu && (
              <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 220, zIndex: 1000, padding: 8 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 8 }}>
                   <div style={{ fontSize: 14, fontWeight: 'bold' }}>{user.full_name}</div>
                   <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.role?.toUpperCase()}</div>
                </div>
                <button className="menu-item" onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}>
                  <User size={16} /> My Profile
                </button>
                <button className="menu-item" onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}>
                  <Settings size={16} /> System Settings
                </button>
                <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={logout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="content-area">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="bottom-nav mobile-only">
          <NavLink to="/" className={({isActive}) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <LayoutDashboard size={24} />
          </NavLink>
          <NavLink to="/assets" className={({isActive}) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <Database size={24} />
          </NavLink>
          <NavLink to="/scan" className="bottom-nav-item scan-btn-wrapper">
            <div className="scan-btn">
              <ScanLine size={28} color="white" />
            </div>
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <FolderKanban size={24} />
          </NavLink>
          <NavLink to="/more" className={({isActive}) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            {/* We will route /more to a mobile menu page later, or it can toggle a modal */}
            <Users size={24} />
          </NavLink>
        </div>

        {/* Floating Action Scanner Button (Tablet/Desktop usually don't need this if they have bottom nav, but good for quick access) */}
        <NavLink to="/scan" className="fab desktop-only">
          <ScanLine size={24} />
        </NavLink>
      </div>
    </div>
  );
};

// Dummy placeholders until we build them
const Locations = () => <div style={{padding: 24}}><h1>Locations (Coming Soon)</h1></div>;
const SettingsPage = () => <div style={{padding: 24}}><h1>System Settings</h1></div>;
const MoreMobileMenu = () => <div style={{padding: 24}}><h1>More Menu (Coming Soon)</h1><UsersPage/><AuditLog/></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/more" element={<ProtectedRoute><MoreMobileMenu /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
