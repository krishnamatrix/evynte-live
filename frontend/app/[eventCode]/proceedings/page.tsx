'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Download } from '@phosphor-icons/react';
import styles from '@/styles/IframePage.module.css';

export default function ProceedingsPage() {
  const router = useRouter();
  const pdfUrl = "/assets/2025 IEEE INDICON - Conference Proceeding_highest_compressed.pdf";

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = '2025_IEEE_INDICON_Proceedings.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          src={pdfUrl}
          className={styles.iframe}
          title="Proceedings PDF"
        />
      </div>
    </div>
  );
}
