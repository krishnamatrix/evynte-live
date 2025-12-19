'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Download } from '@phosphor-icons/react';
import styles from '@/styles/IframePage.module.css';

export default function ProceedingsPage() {
  const router = useRouter();
  const pdfUrl = "/assets/2025 IEEE INDICON - Conference Proceeding_highest_compressed.pdf";
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + pdfUrl)}&embedded=true`;

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
      <div style={{
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        background: 'rgba(15, 12, 41, 0.4)'
      }}><object
          data={pdfUrl}
          type="application/pdf"
          style={{ 
            width: '100%',
            height: '100%',
            minHeight: '100vh',
            border: 'none',
            display: 'block'
          }}
        >
          <iframe
            src={googleDocsUrl}
            title="Proceedings PDF"
            style={{ 
              width: '100%',
              height: '100%',
              minHeight: '100vh',
              border: 'none',
              display: 'block'
            }}
          />
        </object>
      </div>
    </div>
  );
}
