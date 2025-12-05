'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Mail, Globe } from 'lucide-react';
import styles from '@/styles/AboutPage.module.css';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>About INDICON 2025</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.logoSection}>
          <div className={styles.eventLogo}>INDICON 2025</div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Event Overview</h2>
          <p className={styles.text}>
            INDICON is the flagship annual international conference of the IEEE India Council. INDICON has been the most prestigious conference conceptualized by IEEE India Council in the field of Computer Science and Engineering, Electrical Engineering & Electronics and Communication Engineering, in general. This has been a metamorphic version of the Annual Convention and Exhibitions (ACE) which was the annual meeting of the IEEE India Council. During ACE2003 it was decided to completely restructure it in form of a conference where the India Council would formally meet also. It was renamed as INDICON.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Details</h2>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <Calendar className={styles.icon} size={20} />
              <div>
                <div className={styles.detailLabel}>Date</div>
                <div className={styles.detailValue}>December 18, 2025 - December 20, 2025</div>
              </div>
            </div>
            <div className={styles.detailItem}>
              <MapPin className={styles.icon} size={20} />
              <div>
                <div className={styles.detailLabel}>Location</div>
                <div className={styles.detailValue}><b>International Institute of Information Technology</b>

                  26/C, Electronics City, Hosur Road

                  Bangalore, Karnataka, India - 560100</div>
              </div>
            </div>
            <div className={styles.detailItem}>
              <Users className={styles.icon} size={20} />
              <div>
                <div className={styles.detailLabel}>Organizer</div>
                <div className={styles.detailValue}>IEEE Bangalore Section</div>
              </div>
            </div>
            <div className={styles.detailItem}>
              <Mail className={styles.icon} size={20} />
              <div>
                <div className={styles.detailLabel}>Contact</div>
                <div className={styles.detailValue}>indicon2025@ieeebangalore.org</div>
              </div>
            </div>
            <div className={styles.detailItem}>
              <Globe className={styles.icon} size={20} />
              <div>
                <div className={styles.detailLabel}>Website</div>
                <div className={styles.detailValue}>
                  <a href="https://www.evynte.com/event/indicon2025/preview" target="_blank" rel="noopener noreferrer">
                    evynte.com/event/indicon2025
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Conference Themes</h2>
          <ul className={styles.themeList}>
            <li>Photonics, Quantum Technologies, and Optical Intelligence</li>
            <li>Sensors, Remote Sensing, and Intelligent Perception Systems</li>
            <li>Software Engineering, Machine Learning, and Distributed Secure Systems.</li>
            <li>Robotics, Automation, Instrumentation, and Intelligent Control Systems</li>
            <li>Electronic Devices, Circuits, VLSI, and Embedded Systems</li>
            <li>Advanced Signal and Image Processing</li>
            <li>Biomedical Engineering, Wearable Systems, and Healthcare Technologies</li>
            <li>Next-Generation Communication Systems, Networking, and IoT</li>
            <li>Power Electronics and Power Systems, Smart Grids, and Industrial Automation</li>
            <li>Intelligent Mobility, Vehicular Systems, and Transportation Technologies</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Who Should Attend</h2>
          <p className={styles.text}>
            INDICON welcomes researchers, academicians, industry professionals, PhD scholars,
            postgraduate and undergraduate students working in various domains of electrical,
            electronics, computer science, and related engineering fields.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>What to Expect</h2>
          <ul className={styles.featureList}>
            <li>
              <strong>Keynote Speeches</strong> - Insights from renowned experts and thought leaders
            </li>
            <li>
              <strong>Technical Sessions</strong> - Present and discuss cutting-edge research
            </li>
            <li>
              <strong>Networking</strong> - Connect with peers from academia and industry
            </li>
            <li>
              <strong>Workshops</strong> - Hands-on learning experiences
            </li>
            <li>
              <strong>Exhibitions</strong> - Explore latest technologies and innovations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
