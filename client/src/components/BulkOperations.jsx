import React from 'react';
import { Upload, FileDown, AlertTriangle } from 'lucide-react';

export default function BulkOperations({ onUploadComplete }) {
  // In a real implementation we would parse the CSV/Excel file using readAsText or the `xlsx` browser package here, 
  // then map the headers to the asset table columns, and send them to the backend in chunks.
  
  return (
    <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
      <h3 style={{ fontSize: 18, marginBottom: 16 }}>Bulk Import / Export</h3>
      
      <div style={{ padding: 32, border: '2px dashed var(--border-subtle)', borderRadius: 12, marginBottom: 24, background: 'rgba(0,0,0,0.2)' }}>
        <Upload size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
        <h4 style={{ marginBottom: 8 }}>Drag & Drop Excel / CSV</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          Ensure your columns match: Name, Brand, Category, Quantity etc.
        </p>
        <button className="primary-btn" style={{ fontSize: 13 }}>Browse Files</button>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileDown size={14} /> Download Template
        </button>
        <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileDown size={14} /> Export All Current
        </button>
      </div>
      
      <div style={{ marginTop: 24, padding: 16, background: 'rgba(248, 113, 113, 0.1)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left' }}>
         <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
         <div>
           <strong style={{ color: 'var(--danger)', fontSize: 13, display: 'block', marginBottom: 4 }}>Note on Bulk Import</strong>
           <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Importing will automatically generate Asset IDs and Barcodes if left blank. Large files (500+ rows) might take a few moments to process fully.</span>
         </div>
      </div>
    </div>
  );
}
