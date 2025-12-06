'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Clock, MapPin, Trash2, GraduationCap, Mic2 } from 'lucide-react';
import styles from '@/styles/PlaceholderPage.module.css';

const mockBookmarks = [
  {
    id: 1,
    type: 'session',
    title: 'The Future of AI in Healthcare',
    speaker: 'Dr. Sarah Chen',
    time: '10:00 AM - 11:00 AM',
    venue: 'Main Hall A',
    icon: Mic2,
    color: '#8b5cf6'
  },
  {
    id: 2,
    type: 'workshop',
    title: 'Hands-on Machine Learning',
    instructor: 'Dr. Sarah Chen',
    time: '9:00 AM - 12:00 PM',
    venue: 'Workshop Room 1',
    icon: GraduationCap,
    color: '#FFA726'
  },
  {
    id: 3,
    type: 'session',
    title: 'Web3 and Decentralized Future',
    speaker: 'Marcus Johnson',
    time: '11:30 AM - 12:30 PM',
    venue: 'Tech Arena',
    icon: Mic2,
    color: '#8b5cf6'
  },
  {
    id: 4,
    type: 'workshop',
    title: 'API Design Best Practices',
    instructor: 'Emma Rodriguez',
    time: '10:00 AM - 1:00 PM',
    venue: 'Workshop Room 3',
    icon: GraduationCap,
    color: '#FFA726'
  }
];

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(mockBookmarks);

  const removeBookmark = (id: number) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

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
        <h1 className={styles.title}>My Bookmarks</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {bookmarks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <Bookmark size={48} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: '15px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No Bookmarks Yet</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Save sessions and workshops to access them quickly
            </p>
          </div>
        ) : (
          bookmarks.map((bookmark) => {
            const Icon = bookmark.icon;
            return (
              <div
                key={bookmark.id}
                style={{
                  background: 'rgba(30, 27, 75, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '15px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: bookmark.color + '33',
                    border: `2px solid ${bookmark.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color={bookmark.color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{
                        margin: 0,
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: '15px',
                        fontWeight: '600',
                        flex: 1,
                        paddingRight: '10px'
                      }}>
                        {bookmark.title}
                      </h4>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        style={{
                          background: 'rgba(239, 83, 80, 0.2)',
                          border: '1px solid rgba(239, 83, 80, 0.3)',
                          borderRadius: '6px',
                          padding: '6px',
                          color: '#EF5350',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p style={{
                      margin: '0 0 8px 0',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '13px'
                    }}>
                      {bookmark.type === 'session' ? bookmark.speaker : bookmark.instructor}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="rgba(255, 255, 255, 0.6)" />
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                          {bookmark.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="rgba(255, 255, 255, 0.6)" />
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                          {bookmark.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
