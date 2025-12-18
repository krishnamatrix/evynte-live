'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import styles from '@/styles/IframePage.module.css';
import { useEvent } from '@/contexts/EventContext';

export default function QuizPage() {
  const router = useRouter();
  const { eventCode } = useEvent();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Quiz</h1>
      </div>
      <div className={styles.iframeWrapper}>
        <iframe
          src='http://evynti.up.railway.app/quiz/launch/INDICON2025Q1'
          className={styles.iframe}
          title="Event Quiz"
        />
      </div>
    </div>
  );
}
