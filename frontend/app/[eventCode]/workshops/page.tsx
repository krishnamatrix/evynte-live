'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/PlaceholderPage.module.css';

const mockWorkshops = [
  {
    id: 1,
    title: 'Hands-on Machine Learning',
    instructor: 'Dr. Sarah Chen',
    description: 'Build and train your first neural network. Bring your laptop!',
    time: '9:00 AM - 12:00 PM',
    venue: 'Workshop Room 1',
    seats: 30,
    registered: 24,
    level: 'Intermediate',
    tags: ['AI', 'Python', 'Practical']
  },
  {
    id: 2,
    title: 'Smart Contract Development',
    instructor: 'Marcus Johnson',
    description: 'Learn to write and deploy smart contracts on Ethereum.',
    time: '1:00 PM - 4:00 PM',
    venue: 'Workshop Room 2',
    seats: 25,
    registered: 19,
    level: 'Advanced',
    tags: ['Blockchain', 'Solidity', 'Web3']
  },
  {
    id: 3,
    title: 'API Design Best Practices',
    instructor: 'Emma Rodriguez',
    description: 'Design RESTful and GraphQL APIs that scale.',
    time: '10:00 AM - 1:00 PM',
    venue: 'Workshop Room 3',
    seats: 40,
    registered: 35,
    level: 'Beginner',
    tags: ['API', 'Backend', 'Design']
  },
  {
    id: 4,
    title: 'Kubernetes Essentials',
    instructor: 'David Park',
    description: 'Container orchestration from basics to production.',
    time: '2:00 PM - 5:00 PM',
    venue: 'Workshop Room 1',
    seats: 20,
    registered: 20,
    level: 'Intermediate',
    tags: ['DevOps', 'Cloud', 'Kubernetes']
  }
];

export default function WorkshopsPage() {
  const router = useRouter();
  const [registeredWorkshops, setRegisteredWorkshops] = useState<number[]>([]);

  const toggleRegistration = (workshopId: number) => {
    setRegisteredWorkshops(prev =>
      prev.includes(workshopId)
        ? prev.filter(id => id !== workshopId)
        : [...prev, workshopId]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FFA726';
      case 'Advanced': return '#EF5350';
      default: return '#9E9E9E';
    }
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
        <h1 className={styles.title}>Workshops</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {mockWorkshops.map((workshop) => {
          const isFull = workshop.registered >= workshop.seats;
          const isRegistered = registeredWorkshops.includes(workshop.id);

          return (
            <div
              key={workshop.id}
              style={{
                background: 'rgba(30, 27, 75, 0.6)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isRegistered ? 'rgba(76, 175, 80, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{
                    margin: 0,
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flex: 1
                  }}>
                    {workshop.title}
                  </h3>
                  <GraduationCap size={24} color="rgba(139, 92, 246, 0.8)" />
                </div>

                <p style={{
                  margin: '5px 0',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px'
                }}>
                  by {workshop.instructor}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: getLevelColor(workshop.level) + '33',
                    border: `1px solid ${getLevelColor(workshop.level)}66`,
                    color: getLevelColor(workshop.level),
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {workshop.level}
                  </span>
                  {workshop.tags.map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                {workshop.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {workshop.time}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {workshop.venue}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color={isFull ? '#EF5350' : 'rgba(255, 255, 255, 0.6)'} />
                  <span style={{ fontSize: '13px', color: isFull ? '#EF5350' : 'rgba(255, 255, 255, 0.7)' }}>
                    {workshop.registered} / {workshop.seats} seats
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleRegistration(workshop.id)}
                disabled={isFull && !isRegistered}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isRegistered
                    ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                    : isFull
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isFull && !isRegistered ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isFull && !isRegistered ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isRegistered && <CheckCircle2 size={18} />}
                {isRegistered ? 'Registered' : isFull ? 'Full' : 'Register'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
