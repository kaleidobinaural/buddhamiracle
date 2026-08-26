import * as React from 'react';

interface ReceiptEmailProps {
  donorName: string;
  amount: number;
  message: string;
  date: string;
}

export const ReceiptEmail: React.FC<Readonly<ReceiptEmailProps>> = ({
  donorName,
  amount,
  message,
  date,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#050505', color: '#ffffff', padding: '40px', textAlign: 'center' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#111111', border: '1px solid #D4A017', borderRadius: '8px', padding: '40px' }}>
      <h1 style={{ color: '#D4A017', fontSize: '28px', margin: '0 0 20px', fontFamily: 'serif' }}>Temple of Light</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#cccccc' }}>
        Dear {donorName},<br /><br />
        Your devotion has been etched into the Eternal Foundation. We humbly thank you for your generous contribution.
      </p>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '4px', margin: '30px 0', borderLeft: '4px solid #D4A017', textAlign: 'left' }}>
        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#888888' }}><strong>Date:</strong> {date}</p>
        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#888888' }}><strong>Devotion Amount:</strong> {amount.toLocaleString()} Soul Points</p>
        <p style={{ margin: '0', fontSize: '14px', color: '#dddddd', fontStyle: 'italic' }}>"{message || 'May peace be with all beings.'}"</p>
      </div>

      <p style={{ fontSize: '14px', color: '#888888', marginTop: '40px' }}>
        May your path be illuminated by wisdom and your heart remain at peace.<br />
        — The Keepers of the Sanctuary
      </p>
    </div>
  </div>
);

export default ReceiptEmail;
