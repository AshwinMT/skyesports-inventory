import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, UserPlus, Shield, Trash2, Edit2, Search, Briefcase, Mail, Phone, Package, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Modal Form State
  const [form, setForm] = useState({
    username: '', full_name: '', email: '', password: '', role: 'viewer', 
    department: '', phone: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/users' : '/api/employees';
      const res = await axios.get(endpoint);
      setData(res.data);
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'users' ? '/api/users' : '/api/employees';
      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem.id}`, form);
      } else {
        await axios.post(endpoint, form);
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving data");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      username: item.username || '',
      full_name: item.full_name || '',
      email: item.email || '',
      password: '', // Don't show existing password
      role: item.role || 'viewer',
      department: item.department || '',
      phone: item.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this " + (activeTab === 'users' ? 'user' : 'employee') + "?")) return;
    try {
      const endpoint = activeTab === 'users' ? '/api/users' : '/api/employees';
      await axios.delete(`${endpoint}/${id}`);
      fetchData();
    } catch {}
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Rajdhani', fontSize: 28, marginBottom: 16 }}>Directory Hub</h1>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8 }}>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === 'users' ? 'var(--accent)' : 'transparent', color: activeTab === 'users' ? 'black' : 'white', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} /> System Users
            </button>
            <button 
              onClick={() => setActiveTab('employees')}
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === 'employees' ? 'var(--accent)' : 'transparent', color: activeTab === 'employees' ? 'black' : 'white', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={16} /> Employee Directory
            </button>
          </div>
        </div>
        
        {currentUser.role !== 'viewer' && (
          <button onClick={() => { setEditingItem(null); setForm({ username: '', full_name: '', email: '', password: '', role: 'viewer', department: '', phone: '' }); setShowModal(true); }} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} /> Add {activeTab === 'users' ? 'User' : 'Employee'}
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing records...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>NAME / IDENTITY</th>
                  <th style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>{activeTab === 'users' ? 'ROLE' : 'DEPARTMENT'}</th>
                  <th style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>CONTACT</th>
                  <th style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="table-row-hover">
                    <td style={{ padding: 16 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 14 }}>{item.full_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.username || `ID: EMP-${String(item.id).padStart(3,'0')}`}</div>
                    </td>
                    <td style={{ padding: 16 }}>
                      {activeTab === 'users' ? (
                        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', background: item.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(56, 189, 248, 0.1)', color: item.role === 'admin' ? 'var(--accent-secondary)' : 'var(--accent)', border: `1px solid ${item.role === 'admin' ? 'var(--accent-secondary)' : 'var(--accent)'}44` }}>
                          {item.role}
                        </span>
                      ) : (
                        <div style={{ fontSize: 13 }}>{item.department || 'N/A'}</div>
                      )}
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                           <Mail size={12} /> {item.email || 'No Email'}
                        </div>
                        {activeTab === 'employees' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                            <Phone size={12} /> {item.phone || 'No Phone'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                         <button onClick={() => handleEdit(item)} style={{ background: 'var(--bg-secondary)', border: 'none', padding: 8, borderRadius: 6, color: 'var(--accent)', cursor: 'pointer' }}><Edit2 size={14} /></button>
                         {currentUser.role === 'admin' && (
                           <button onClick={() => handleDelete(item.id)} style={{ background: 'var(--bg-secondary)', border: 'none', padding: 8, borderRadius: 6, color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.length && (
                  <tr><td colSpan="4" style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No {activeTab} found in directory.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <h2 style={{ fontFamily: 'Rajdhani', fontSize: 22 }}>{editingItem ? 'Update' : 'New'} {activeTab === 'users' ? 'System User' : 'Employee'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeTab === 'users' && (
                <div>
                  <label className="field-label">Username *</label>
                  <input className="glass-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} disabled={!!editingItem} required />
                </div>
              )}
              
              <div>
                <label className="field-label">Full Name *</label>
                <input className="glass-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
              </div>

              <div>
                <label className="field-label">Email Address</label>
                <input type="email" className="glass-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              {activeTab === 'users' ? (
                <>
                  <div>
                    <label className="field-label">Role</label>
                    <select className="glass-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="viewer">Viewer (Read Only)</option>
                      <option value="assistant">Assistant (Edit Access)</option>
                      <option value="admin">Admin (Full Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Password {editingItem ? '(Leave blank to stay same)' : '*'}</label>
                    <input type="password" className="glass-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} {...(!editingItem ? {required:true} : {})} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="field-label">Department / Team</label>
                    <input className="glass-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. Production, IT" />
                  </div>
                  <div>
                    <label className="field-label">Phone Number</label>
                    <input className="glass-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </>
              )}

              <button className="primary-btn" style={{ marginTop: 12 }}>Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
