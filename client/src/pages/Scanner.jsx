import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Camera, CheckCircle, XCircle } from 'lucide-react';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only init scanner if we don't have a result yet to avoid re-rendering issues
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });
      
      scanner.render(
        (text) => {
          scanner.clear();
          setScanResult(text);
          fetchAssetFromScan(text);
        },
        (error) => {
          // Ignore frequent error callbacks from unreadable frames
        }
      );

      return () => {
        scanner.clear().catch(e => console.error(e));
      };
    }
  }, [scanResult]);

  const fetchAssetFromScan = async (code) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/assets/barcode/${code}`);
      setAssetDetails(res.data);
    } catch (err) {
      setAssetDetails({ error: 'Asset not found in database for code: ' + code });
    }
    setLoading(false);
  };

  const handleAction = async (action) => {
    if (!assetDetails || assetDetails.error) return;
    try {
      if (action === 'checkin') {
        await axios.put(`/api/assets/${assetDetails.id}`, { ...assetDetails, status: 'available' });
        alert('Successfully checked in!');
      } else {
        await axios.put(`/api/assets/${assetDetails.id}`, { ...assetDetails, status: 'in-use' });
        alert('Successfully checked out!');
      }
      setScanResult(null);
      setAssetDetails(null);
    } catch (e) {
      alert('Action failed: ' + e.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 80 }}>
      <h1 style={{ fontFamily: 'Rajdhani', fontSize: 24, marginBottom: 24 }}>Fast Scan</h1>
      
      {!scanResult ? (
        <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Position the QR code or Barcode inside the box to scan instantly.</p>
          <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}></div>
        </div>
      ) : (
        <div className="glass-panel animate-slide-up" style={{ padding: 32, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          {loading ? (
             <div style={{ color: 'var(--accent)' }}>Fetching details...</div>
          ) : assetDetails?.error ? (
             <div>
               <XCircle size={64} color="var(--danger)" style={{ marginBottom: 16 }} />
               <h2 style={{ fontSize: 20, marginBottom: 8 }}>Not Found</h2>
               <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{assetDetails.error}</p>
               <button className="primary-btn" onClick={() => { setScanResult(null); setAssetDetails(null); }}>Scan Again</button>
             </div>
          ) : (
             <div>
               <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 16 }} />
               <h2 style={{ fontSize: 24, marginBottom: 8, fontFamily: 'Rajdhani' }}>{assetDetails.name}</h2>
               <p style={{ color: 'var(--accent)' }}>{assetDetails.asset_id}</p>
               
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, margin: '24px 0', textAlign: 'left', display: 'grid', gap: 8 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                   <strong style={{ color: assetDetails.status === 'available' ? 'var(--success)' : 'var(--danger)' }}>{assetDetails.status.toUpperCase()}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                   <strong>{assetDetails.category_name || '-'}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                   <strong>{assetDetails.location_name || '-'}</strong>
                 </div>
               </div>

               <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                 {assetDetails.status !== 'available' ? (
                   <button className="primary-btn" style={{ background: 'var(--success)', color: 'black' }} onClick={() => handleAction('checkin')}>
                     Check-In Asset
                   </button>
                 ) : (
                   <button className="primary-btn" onClick={() => handleAction('checkout')}>
                     Check-Out Asset
                   </button>
                 )}
                 <button onClick={() => { setScanResult(null); setAssetDetails(null); }} style={{ padding: 12, background: 'transparent', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: 8 }}>
                   Cancel & Scan Again
                 </button>
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
