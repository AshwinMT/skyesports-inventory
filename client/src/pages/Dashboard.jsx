import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Users, Wrench, AlertTriangle, ArrowRightLeft, Clock, MapPin, Database } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard').then(res => setStats(res.data)).catch(()=>{});
  }, []);

  if (!stats) return <div style={{ color: 'var(--accent)', padding: 40, display: 'flex', justifyContent: 'center' }}>Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <h1 className="desktop-only" style={{ fontFamily: 'Rajdhani', fontSize: 28, marginBottom: 24 }}>System Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="glass-panel stat-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Package size={100} /></div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>TOTAL ASSETS</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 42, fontWeight: 700, color: 'var(--accent)' }}>{stats.total_assets}</div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><AlertTriangle size={100} /></div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>IN USE</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 42, fontWeight: 700, color: 'var(--danger)' }}>{stats.in_use}</div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Wrench size={100} /></div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>MAINTENANCE</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 42, fontWeight: 700, color: 'var(--accent-secondary)' }}>{stats.maintenance}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Categories Distribution */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 24, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} /> Assets by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.categories?.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                    <span>{c.name}</span>
                    <span style={{ color: 'var(--accent)' }}>{c.count}</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--bg-secondary)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.count / Math.max(stats.total_assets, 1)) * 100}%`, background: c.color, height: '100%' }}></div>
                  </div>
                </div>
              </div>
            ))}
            {stats.categories?.length === 0 && <span style={{color: 'var(--text-secondary)', fontSize: 14}}>No categories found.</span>}
          </div>
        </div>

        {/* Locations */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 24, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} /> Distribution by Location
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.locations?.map((l, idx) => (
              <div key={l.name || idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                    <span>{l.name}</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{l.count} items</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--bg-secondary)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(l.count / Math.max(stats.total_assets, 1)) * 100}%`, background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent))', height: '100%' }}></div>
                  </div>
                </div>
              </div>
            ))}
            {stats.locations?.length === 0 && <span style={{color: 'var(--text-secondary)', fontSize: 14}}>No locations configured.</span>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: 24, gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 16, marginBottom: 24, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> Recent Activity
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Time</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>User</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Action</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Asset</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activity?.map((act, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px', fontSize: 13, whiteSpace: 'nowrap' }}>{new Date(act.created_at).toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: 14 }}>{act.user_name || 'System'}</td>
                    <td style={{ padding: '16px', fontSize: 14 }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5,
                        background: act.action === 'CREATED' ? 'rgba(52, 211, 153, 0.2)' : act.action === 'UPDATED' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                        color: act.action === 'CREATED' ? 'var(--success)' : act.action === 'UPDATED' ? 'var(--accent)' : 'var(--accent-secondary)'
                      }}>
                        {act.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: 'var(--text-secondary)' }}>{act.asset_name || 'Item #' + act.asset_id}</td>
                  </tr>
                ))}
                {(!stats.recent_activity || stats.recent_activity.length === 0) && (
                  <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
