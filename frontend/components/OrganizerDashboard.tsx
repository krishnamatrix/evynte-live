'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import styles from '../styles/OrganizerDashboard.module.css';

interface OrganizerDashboardProps {
  event?: {
    _id?: string;
    name?: string;
  };
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ event }) => {
  const router = useRouter();

  const contactEmail = 'indicon2025@ieeebangalore.org';

  return (
    <div className={styles.organizerDashboard}>
      <div className={styles.dashboardHeader}>
        <button 
          className={styles.backButton} 
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerInfo}>
          <h1>Organizer Contact</h1>
        </div>
      </div>

      <div className={styles.contactContent}>
        <div className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <Mail size={48} />
          </div>
          <h2 className={styles.contactTitle}>Contact Us</h2>
          <p className={styles.contactDescription}>
            For any questions or assistance, please reach out to our organizing team
          </p>
          <a href={`mailto:${contactEmail}`} className={styles.emailButton}>
            <Mail size={20} />
            <span>{contactEmail}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
