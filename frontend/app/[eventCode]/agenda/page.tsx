'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import styles from '@/styles/IframePage.module.css';

export default function AgendaPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Event Slots</h1>
      </div>
      <div className={styles.iframeWrapper}>
        <iframe
          src="https://www.evynte.com/event/indicon2025/slots"
          className={styles.iframe}
          title="Event Slots"
        />
      </div>
    </div>
  );
}
