'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { useEvent } from '@/contexts/EventContext';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Certificate from '@/components/Certificate';
import styles from '@/styles/PlaceholderPage.module.css';

export default function CertificatePage() {
  const router = useRouter();
  const { eventId } = useEvent();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

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
        <h1 className={styles.title}>Certificate</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {eventId && userId ? (
          <Certificate eventId={eventId} userId={userId} />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
