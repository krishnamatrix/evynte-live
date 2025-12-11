'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabaseClient';
import QRCode from 'qrcode';
import styles from '@/styles/PlaceholderPage.module.css';
import { useEvent } from '@/contexts/EventContext';

export default function QRCodePage() {
  const router = useRouter();
  const { eventCode } = useParams();
  const { eventId } = useEvent();
  const [user, setUser] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndGenerateQR();
  }, []);

  const checkUserAndGenerateQR = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${eventCode}`);
        return;
      }

      setUser(user);
      
      // Generate QR code with event_id and user_id as JSON
      const qrData = JSON.stringify({
        event_id: eventId,
        user_id: user.id
      });
      
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${user?.email || 'user'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>My QR Code</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Generating QR Code...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>My QR Code</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Please log in to view your QR code
        </div>
      </div>
    );
  }

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
          <h3 style={{
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            {user.user_metadata?.name || user.user_metadata?.full_name || 'User'}
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 20px 0',
            fontSize: '14px'
          }}>
            {user.email}<br></br>
            {user.id}
          </p>

          {qrCodeUrl && (
            <div style={{
              width: '250px',
              height: '250px',
              background: 'white',
              borderRadius: '16px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              padding: '10px'
            }}>
              <img src={qrCodeUrl} alt="User QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}

          <button
            onClick={handleDownload}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              marginBottom: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={20} />
            <span>Download QR Code</span>
          </button>

          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            padding: '15px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>📱 Show this QR code at kiosks for quick check-in</p>
            <p style={{ margin: '0' }}>🔒 This QR code is unique to your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
