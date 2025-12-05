'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  Settings,
  Wifi,
  ClipboardList,
  Info
} from 'lucide-react';
import styles from '../styles/HomeScreen.module.css';

interface AppItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

interface HomeScreenProps {
  eventName?: string;
  eventDate?: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ eventName = "Event Name", eventDate = "Date" }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const activeAppItems: AppItem[] = [
    {
      id: 'agenda',
      name: 'Agenda',
      icon: ClipboardList,
      path: '/agenda',
      color: '#FF5722'
    },
    {
      id: 'schedule',
      name: 'Schedule',
      icon: Calendar,
      path: '/schedule',
      color: '#2196F3'
    },
    {
      id: 'organizers',
      name: 'Organizers',
      icon: Users,
      path: '/organizer',
      color: '#4CAF50'
    },
    {
      id: 'about',
      name: 'About',
      icon: Info,
      path: '/about',
      color: '#667eea'
    }
  ];

  const comingSoonItems = [
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageCircle,
      path: '/chat',
      color: '#4CAF50'
    },
    {
      id: 'networking',
      name: 'Networking',
      icon: Wifi,
      path: '/networking',
      color: '#9C27B0'
    },
    {
      id: 'checkin',
      name: 'Check-In',
      icon: UserCheck,
      path: '/checkin',
      color: '#00BCD4'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      path: '/settings',
      color: '#607D8B'
    }
  ];

  const handleNavigation = (path: string) => {
    if (navigating) return;
    
    setNavigating(true);
    // Small delay to show the tap animation
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/assets/evynte_logo.png" 
            alt="Evynte Logo" 
            width={150} 
            height={40}
            className={styles.logo}
            priority
          />
        </div>
        <h1 className={styles.eventName}>{eventName}</h1>
        <p className={styles.eventDate}>{eventDate}</p>
      </div>

      <div className={styles.appGrid}>
        {activeAppItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={styles.appItem}
              onClick={() => handleNavigation(item.path)}
              style={{ '--app-color': item.color } as React.CSSProperties}
            >
              <div className={styles.iconWrapper}>
                <Icon className={styles.icon} size={32} />
              </div>
              <span className={styles.appName}>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerText}>Coming Soon</span>
      </div>

      <div className={styles.appGrid}>
        {comingSoonItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.appItem} ${styles.appItemDisabled}`}
              onClick={() => handleNavigation(item.path)}
              style={{ '--app-color': item.color } as React.CSSProperties}
            >
              <div className={styles.iconWrapper}>
                <Icon className={styles.icon} size={32} />
              </div>
              <span className={styles.appName}>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <p>&nbsp;</p>
      </div>
    </div>
  );
};

export default HomeScreen;
