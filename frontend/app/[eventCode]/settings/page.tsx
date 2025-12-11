'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowLeftIcon, GearIcon } from '@phosphor-icons/react';
import styles from '@/styles/PlaceholderPage.module.css';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className={styles.title}>Settings</h1>
      </div>
      <div className={styles.content}>
        <GearIcon size={64} className={styles.icon} />
        <h2>Coming Soon</h2>
        <p>Manage your preferences</p>
      </div>
    </div>
  );
}
