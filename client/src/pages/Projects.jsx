import React, { useState } from 'react';
import { FolderKanban, Plus, Calendar } from 'lucide-react';

export default function Projects() {
  const [projects] = useState([
    { id: 1, name: 'BGMi Pro Series Lan', status: 'upcoming', assets: 42, start: '2026-05-10', end: '2026-05-20' },
    { id: 2, name: 'Valorant Challengers SA', status: 'active', assets: 120, start: '2026-04-01', end: '2026-04-30' },
  ]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Rajdhani', fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderKanban /> Project Allocations
        </h1>
        <button className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {projects.map(p => (
          <div key={p.id} className="glass-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ 
                  padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
                  background: p.status === 'active' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: p.status === 'active' ? 'var(--success)' : 'var(--accent)'
              }}>
                {p.status}
              </span>
              <strong style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.assets} Assets Assigned</strong>
            </div>
            
            <h3 style={{ fontSize: 20, fontFamily: 'Rajdhani', marginBottom: 16 }}>{p.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
               <Calendar size={14} /> {p.start} to {p.end}
            </div>

            <button style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer' }}>
               Manage Allocation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
