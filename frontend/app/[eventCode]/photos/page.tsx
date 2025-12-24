'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import styles from '@/styles/IframePage.module.css';

export default function PhotosPage() {
  const router = useRouter();
  const { eventCode } = useParams();

  // Google Drive folder URLs for different events
  const photosUrls: Record<string, string> = {
    'indicon2025': 'https://drive.google.com/embeddedfolderview?id=1AstdmPvVmSgk8ZFFVqdPYUk1LVyPTOiM#list'
  };

  const photosUrl = photosUrls[eventCode as string] || '';

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
        <h1 className={styles.title}>Event Photos</h1>
      </div>

      <div className={styles.iframeWrapper}>
        {photosUrl ? (
          <iframe
            src={photosUrl}
            className={styles.iframe}
            title="Event Photos"
            allowFullScreen
          />
        ) : (
          <div className={styles.placeholder}>
            <p>Photos gallery not available for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}
