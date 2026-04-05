import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gamepad2 } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('pass');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: 420, padding: 40, textAlign: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <img src="/logo.png" alt="Skyesports Logo" style={{ height: 120, marginBottom: 24 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>INVENTORY MANAGEMENT</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>USERNAME</label>
            <input type="text" className="glass-input" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>PASSWORD</label>
            <input type="password" className="glass-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
          
          <button type="submit" className="primary-btn" style={{ marginTop: 8 }}>SIGN IN</button>
        </form>
      </div>
    </div>
  );
}
