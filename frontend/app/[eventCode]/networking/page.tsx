'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, WifiHigh, WifiMediumIcon } from '@phosphor-icons/react';
import styles from '@/styles/PlaceholderPage.module.css';

export default function NetworkingPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Networking</h1>
      </div>
      <div className={styles.content}>
        <WifiMediumIcon size={64} className={styles.icon} />
        <h2>Coming Soon</h2>
        <p>Connect with other attendees</p>
      </div>
    </div>
  );
}
