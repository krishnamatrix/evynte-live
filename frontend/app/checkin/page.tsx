'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck } from 'lucide-react';
import styles from '../../styles/PlaceholderPage.module.css';

export default function CheckInPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Check-In</h1>
      </div>
      <div className={styles.content}>
        <UserCheck size={64} className={styles.icon} />
        <h2>Coming Soon</h2>
        <p>Check in to sessions and events</p>
      </div>
    </div>
  );
}
