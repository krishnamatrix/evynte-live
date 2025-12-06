'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Download, Share2 } from 'lucide-react';
import styles from '@/styles/PlaceholderPage.module.css';

export default function QRCodePage() {
  const router = useRouter();

  const attendeeData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Tech Innovations',
    attendeeId: 'ATT-2025-1234'
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>My QR Code</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 27, 75, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center',
          maxWidth: '350px',
          width: '100%'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            background: 'white',
            borderRadius: '16px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <QrCode size={160} color="#0f0c29" />
          </div>

          <h3 style={{
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {attendeeData.name}
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 4px 0',
            fontSize: '14px'
          }}>
            {attendeeData.company}
          </p>
          <p style={{
            color: 'rgba(139, 92, 246, 0.9)',
            margin: '0',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {attendeeData.attendeeId}
          </p>
        </div>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '13px',
          textAlign: 'center',
          maxWidth: '300px',
          lineHeight: '1.6'
        }}>
          Use this QR code for check-ins, networking, and accessing personalized content
        </p>

        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '350px' }}>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}>
            <Download size={18} />
            Download
          </button>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}>
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
