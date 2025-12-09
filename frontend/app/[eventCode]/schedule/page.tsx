'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import styles from '@/styles/IframePage.module.css';
import { useEvent } from '@/contexts/EventContext';

export default function SchedulePage() {
  const router = useRouter();
  const { eventCode } = useEvent();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Schedule</h1>
      </div>
      <div className={styles.iframeWrapper}>
        <iframe
          src={`${process.env.NEXT_PUBLIC_SITE_URL}/event/${eventCode || 'indicon2025'}/schedule`}
          className={styles.iframe}
          title="Event Schedule"
        />
      </div>
    </div>
  );
}
