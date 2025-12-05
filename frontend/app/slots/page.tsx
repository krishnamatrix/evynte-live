'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import styles from '../../styles/PlaceholderPage.module.css';

export default function SlotsPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Time Slots</h1>
      </div>
      <div className={styles.content}>
        <Clock size={64} className={styles.icon} />
        <h2>Coming Soon</h2>
        <p>Book your time slots here</p>
      </div>
    </div>
  );
}
