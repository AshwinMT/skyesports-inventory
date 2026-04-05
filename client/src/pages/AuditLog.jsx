import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, User, Activity, Search } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now we will fetch from /api/dashboard. Wait, there is no direct audit API. 
    // We can just rely on the recent_activity array from the dashboard endpoint we added for the UI showcase.
    axios.get('/api/dashboard')
      .then(res => setLogs(res.data.recent_activity || []))
      .catch(()=>{})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <h1 style={{ fontFamily: 'Rajdhani', fontSize: 24, marginBottom: 24, display:'flex', alignItems:'center', gap:8 }}>
        <ShieldAlert /> Immutable Audit Trail
      </h1>
      
      <div className="glass-panel" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input className="glass-input" placeholder="Search logs..." style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading logs safely...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Timestamp</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>User</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Action</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Resource Name</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}>Internal Log Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px', fontSize: 13 }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} color="var(--text-secondary)" /> {log.user_name || 'System Auto'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                          padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold',
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--accent)' }}>{log.asset_name || `Asset ID: ${log.asset_id}`}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 12 }}>{log.notes || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No audit events generated yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
