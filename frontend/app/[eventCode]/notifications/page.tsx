'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';
import styles from '../../styles/PlaceholderPage.module.css';

const mockNotifications = [
  {
    id: 1,
    type: 'urgent',
    title: 'Venue Change',
    message: 'AI Workshop moved to Main Hall B',
    time: '5 mins ago',
    icon: AlertCircle,
    color: '#EF5350'
  },
  {
    id: 2,
    type: 'info',
    title: 'Lunch Break',
    message: 'Lunch service now available in Cafeteria',
    time: '30 mins ago',
    icon: Info,
    color: '#42A5F5'
  },
  {
    id: 3,
    type: 'success',
    title: 'Workshop Confirmed',
    message: 'Your registration for "Smart Contracts" is confirmed',
    time: '1 hour ago',
    icon: CheckCircle,
    color: '#4CAF50'
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Session Starting Soon',
    message: 'Quantum Computing session starts in 15 minutes',
    time: '2 hours ago',
    icon: Clock,
    color: '#FFA726'
  },
  {
    id: 5,
    type: 'info',
    title: 'Networking Event',
    message: 'Evening networking at Coffee Lounge - 6 PM',
    time: '3 hours ago',
    icon: Info,
    color: '#AB47BC'
  }
];

export default function NotificationsPage() {
  const router = useRouter();

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
        <h1 className={styles.title}>Updates & Notifications</h1>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              style={{
                background: 'rgba(30, 27, 75, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                gap: '12px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: notification.color + '33',
                border: `2px solid ${notification.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={20} color={notification.color} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ 
                    margin: 0, 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}>
                    {notification.title}
                  </h4>
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255, 255, 255, 0.5)',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px'
                  }}>
                    {notification.time}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {notification.message}
                </p>
              </div>
            </div>
          );
        })}

        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '14px'
        }}>
          <Bell size={32} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: '10px' }} />
          <p style={{ margin: 0 }}>You're all caught up!</p>
        </div>
      </div>
    </div>
  );
}
