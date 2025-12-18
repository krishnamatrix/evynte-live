'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import styles from '@/styles/IframePage.module.css';

export default function ProceedingsPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Proceedings</h1>
      </div>
      <div className={styles.iframeWrapper}>
        <iframe
          src="/assets/2025 IEEE INDICON - Conference Proceeding_new.pdf"
          className={styles.iframe}
          title="Event Proceedings"
        />
      </div>
    </div>
  );
}
