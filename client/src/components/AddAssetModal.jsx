import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Upload, X, Save, Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';

export default function AddAssetModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ 
    name: '', brand: '', model: '', serial_number: '', 
    is_consumable: false, quantity: 1, 
    category_id: '', location_id: '',
    status: 'available', condition: 'good',
    purchase_price: '', employee_id: '' 
  });
  
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCategoryAdd, setShowCategoryAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [bulkSerials, setBulkSerials] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [emp, cat, loc] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/categories'),
        axios.get('/api/locations')
      ]);
      setEmployees(emp.data);
      setCategories(cat.data);
      setLocations(loc.data);
    } catch {}
  };

  const save = async () => {
    if (!form.name) return alert("Asset name is required.");
    try {
      const payload = {
        ...form,
        manufacturer: form.brand,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        location_id: form.location_id ? parseInt(form.location_id) : null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        assigned_to_employee_id: form.employee_id ? parseInt(form.employee_id): null,
        bulk_serials: form.is_consumable ? bulkSerials.split('\n').filter(s => s.trim()) : [],
        media: attachments
      };

      await axios.post('/api/assets', payload);
      onSaved();
      onClose();
    } catch (e) {
      alert("Error saving: " + e.message);
    }
  };

  const handleQuickAddCategory = async () => {
    if (!newCatName) return;
    try {
       const res = await axios.post('/api/assets/categories', { name: newCatName });
       setCategories([...categories, res.data]);
       setForm({ ...form, category_id: res.data.id });
       setNewCatName('');
       setShowCategoryAdd(false);
    } catch (e) { alert("Failed to add category"); }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch(e) {
      alert("Camera access denied.");
      setIsCameraActive(false);
    }
  };
  
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      uploadFiles([file]);
    }, 'image/jpeg');
  };

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      const res = await axios.post('/api/upload', formData);
      setAttachments([...attachments, ...res.data.files]);
    } catch (e) { alert("Upload failed"); }
    setUploading(false);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, overflowY: 'auto' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: 850, margin: '20px auto', padding: 32 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: 24, display:'flex', alignItems:'center', gap:8 }}>
             Asset Intelligence Entry
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Asset Name *</label>
            <input className="glass-input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="e.g. Sony Cine Camera" />
          </div>

          <div style={{ position: 'relative' }}>
            <label className="field-label">Category</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="glass-input" value={form.category_id} onChange={e=>setForm({...form, category_id: e.target.value})}>
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button 
                onClick={() => setShowCategoryAdd(!showCategoryAdd)}
                style={{ padding: '0 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--accent)', cursor: 'pointer' }}>
                <Plus size={18} />
              </button>
            </div>
            {showCategoryAdd && (
              <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 10, padding: 12 }}>
                <input className="glass-input" value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="New Name..." style={{ marginBottom: 8 }} />
                <button onClick={handleQuickAddCategory} className="primary-btn" style={{ width: '100%', fontSize: 12 }}>Create Category</button>
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Location</label>
            <select className="glass-input" value={form.location_id} onChange={e=>setForm({...form, location_id: e.target.value})}>
              <option value="">None</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label">Tracking Mode</label>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8 }}>
               <button 
                onClick={()=>setForm({...form, is_consumable: false, quantity: 1})}
                style={{ flex: 1, padding: 8, fontSize: 11, borderRadius: 6, cursor: 'pointer', border: 'none', 
                         background: !form.is_consumable ? 'var(--accent)' : 'transparent', 
                         color: !form.is_consumable ? 'black' : 'white' }}>Unique Unit</button>
               <button 
                onClick={()=>setForm({...form, is_consumable: true})}
                style={{ flex: 1, padding: 8, fontSize: 11, borderRadius: 6, cursor: 'pointer', border: 'none',
                         background: form.is_consumable ? 'var(--accent-secondary)' : 'transparent',
                         color: form.is_consumable ? 'black' : 'white' }}>Bulk / Qty</button>
            </div>
          </div>

          {form.is_consumable ? (
            <div style={{ gridColumn: 'span 2' }}>
              <label className="field-label">Quantity</label>
              <input type="number" className="glass-input" value={form.quantity} onChange={e=>setForm({...form, quantity: parseInt(e.target.value)})} min="1" />
            </div>
          ) : (
            <div>
              <label className="field-label">Unit Serial Number</label>
              <input className="glass-input" value={form.serial_number} onChange={e=>setForm({...form, serial_number: e.target.value})} placeholder="S/N..." />
            </div>
          )}

          {form.is_consumable && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Multiple Serial Numbers (One per line)</label>
              <textarea 
                className="glass-input" 
                rows="3" 
                value={bulkSerials} 
                onChange={e=>setBulkSerials(e.target.value)} 
                placeholder="Serial #1&#10;Serial #2&#10;..."
                style={{ resize: 'vertical' }}
              />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }}></div>

          <div>
             <label className="field-label">Brand</label>
             <input className="glass-input" value={form.brand} onChange={e=>setForm({...form, brand: e.target.value})} />
          </div>
          <div>
             <label className="field-label">Model</label>
             <input className="glass-input" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} />
          </div>
          <div>
             <label className="field-label">Valuation ($)</label>
             <input type="number" className="glass-input" value={form.purchase_price} onChange={e=>setForm({...form, purchase_price: e.target.value})} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Multimedia Evidence & Attachments</label>
            <div className="glass-panel" style={{ padding: 20, border: '1px dashed var(--border-subtle)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
                {attachments.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', height: 80, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                    {file.type === 'image' ? (
                      <img src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><FileText size={24} /></div>
                    )}
                    <button 
                      onClick={() => removeAttachment(idx)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.8)', borderRadius: 4, border: 'none', padding: 2, color: 'white', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ height: 80, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>
                  <Plus size={20} />
                  <span style={{ fontSize: 10, marginTop: 4 }}>Add Files</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={startCamera}
                  style={{ display: 'flex', flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white', cursor: 'pointer' }}>
                  <ImageIcon size={16} /> Use Camera
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={e => uploadFiles(e.target.files)} 
                />
              </div>

              {isCameraActive && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 12, background: '#000' }}></video>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button onClick={takePhoto} className="primary-btn" style={{ flex: 1 }}>
                       <Camera size={18} style={{ marginRight: 8 }} /> Capture Frame
                    </button>
                    <button onClick={() => { stopCamera(); setIsCameraActive(false); }} style={{ padding: '0 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 8 }}>Stop</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: 'right', borderTop: '1px solid var(--border-subtle)', paddingTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={save} className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 32px' }}><Save size={18} /> Save Complete Asset</button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
