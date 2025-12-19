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
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px',
        background: 'rgba(30, 27, 75, 0.6)',
        zIndex: 10
      }}>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <Download size={20} weight="bold" />
          Download PDF
        </button>
      </div>
      <div className={styles.iframeWrapper} style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <iframe
          src={pdfUrl}
          className={styles.iframe}
          title="Proceedings PDF"
          style={{ overflow: 'auto', position: 'relative', height: 'auto', minHeight: '100%' }}
        />
      </div>
    </div>
  );
}
