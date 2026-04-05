import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, FileDown, FileUp, MoreVertical, MapPin, QrCode } from 'lucide-react';
import AddAssetModal from '../components/AddAssetModal';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, statusFilter]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (searchTerm) qs.append('search', searchTerm);
      if (statusFilter) qs.append('status', statusFilter);
      const res = await axios.get('/api/assets?' + qs.toString());
      setAssets(res.data.assets);
    } catch {}
    setLoading(false);
  };

  const handleExport = () => {
    window.open('/api/assets/export/excel', '_blank');
  };

  const handleImport = () => {
    // We'll show a simple file browser or a modal in the next step
    alert("Please select an .xlsx file using the 'Import' button on the next update. Template download is coming!");
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <h1 style={{ fontFamily: 'Rajdhani', fontSize: 28, margin: 0 }}>Inventory Hub</h1>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="glass-panel" onClick={handleImport} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <Plus size={16} /> <span className="desktop-only">Import</span>
          </button>
          <button className="glass-panel" onClick={handleExport} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <FileDown size={16} /> <span className="desktop-only">Export</span>
          </button>
          <button className="primary-btn" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> New Asset
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input className="glass-input" placeholder="Search by name, generic, or serial..." style={{ paddingLeft: 40 }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="glass-input" style={{ width: 'auto', minWidth: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="lost">Lost</option>
        </select>
        <button className="glass-panel" style={{ padding: '0 16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Asset List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--accent)' }}>Fetching Database...</div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="desktop-only" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Asset ID</th>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Details (Brand/Model)</th>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Location</th>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Status</th>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Availability</th>
                    <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '16px' }}><code style={{ color: 'var(--accent)', background: 'rgba(56,189,248,0.1)', padding: '4px 8px', borderRadius: 4 }}>{a.asset_id}</code></td>
                      <td style={{ padding: '16px' }}>
                        <strong style={{ display: 'block', fontSize: 15 }}>{a.name}</strong>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.manufacturer} {a.model} {a.serial_number ? `| SN: ${a.serial_number}` : ''}</span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{a.location_name || '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase',
                          background: a.status === 'available' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                          color: a.status === 'available' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {a.is_consumable ? <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{a.quantity} in stock</span> : '1 unit'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                         <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column' }}>
              {assets.map(a => (
                <div key={a.id} style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <code style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: 4 }}>{a.asset_id}</code>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
                      background: a.status === 'available' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                      color: a.status === 'available' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {a.status}
                    </span>
                  </div>
                  <strong style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>{a.name}</strong>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {a.manufacturer} {a.model} {a.serial_number ? `| SN: ${a.serial_number}` : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                      <MapPin size={12} /> {a.location_name || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: a.is_consumable ? 'var(--accent-secondary)' : 'auto' }}>
                      {a.is_consumable ? `${a.quantity} in stock` : 'Single'}
                    </div>
                  </div>
                  <button style={{ position: 'absolute', right: 16, top: 40, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 8, color: 'var(--text-secondary)' }}>
                    <QrCode size={18} />
                  </button>
                </div>
              ))}
            </div>

            {assets.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No assets match your search.</div>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddAssetModal onClose={() => setShowAdd(false)} onSaved={fetchAssets} />}
    </div>
  );
}
