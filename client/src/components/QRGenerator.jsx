import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRGenerator({ value, label }) {
  return (
    <div style={{ textAlign: 'center', background: 'white', padding: 16, borderRadius: 8, display: 'inline-block' }}>
      <QRCodeSVG value={value || 'skyesports-empty'} size={128} level="H" includeMargin={true} />
      {label && <div style={{ color: 'black', fontSize: 12, fontWeight: 'bold', marginTop: 8, fontFamily: 'monospace' }}>{label}</div>}
    </div>
  );
}
