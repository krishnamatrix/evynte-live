'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic2, MapPin, Clock, Linkedin, Twitter, Globe } from 'lucide-react';
import styles from '@/styles/PlaceholderPage.module.css';

const mockSpeakers = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    title: 'Chief AI Researcher',
    company: 'TechCorp AI',
    bio: 'Leading expert in machine learning and neural networks with 15+ years of experience.',
    image: '👩‍💻',
    session: 'The Future of AI in Healthcare',
    time: '10:00 AM - 11:00 AM',
    venue: 'Main Hall A',
    social: {
      linkedin: '#',
      twitter: '#',
      website: '#'
    }
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    title: 'Blockchain Architect',
    company: 'CryptoVentures',
    bio: 'Pioneer in decentralized systems and smart contract development.',
    image: '👨‍💼',
    session: 'Web3 and Decentralized Future',
    time: '11:30 AM - 12:30 PM',
    venue: 'Tech Arena',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    id: 3,
    name: 'Prof. Aisha Patel',
    title: 'Quantum Computing Lead',
    company: 'QuantumLab Institute',
    bio: 'Researcher focused on quantum algorithms and their practical applications.',
    image: '👩‍🔬',
    session: 'Quantum Computing Basics',
    time: '2:00 PM - 3:00 PM',
    venue: 'Innovation Hub',
    social: {
      linkedin: '#',
      website: '#'
    }
  },
  {
    id: 4,
    name: 'David Park',
    title: 'Cloud Solutions Architect',
    company: 'CloudScale Systems',
    bio: 'Expert in scalable cloud infrastructure and distributed systems.',
    image: '👨‍💻',
    session: 'Scaling Applications in Cloud',
    time: '3:30 PM - 4:30 PM',
    venue: 'Main Hall B',
    social: {
      linkedin: '#',
      twitter: '#',
      website: '#'
    }
  }
];

export default function SpeakersPage() {
  const router = useRouter();
  const [selectedSpeaker, setSelectedSpeaker] = useState<number | null>(null);

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
        <h1 className={styles.title}>Speakers</h1>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {mockSpeakers.map((speaker) => (
          <div
            key={speaker.id}
            onClick={() => setSelectedSpeaker(selectedSpeaker === speaker.id ? null : speaker.id)}
            style={{
              background: 'rgba(30, 27, 75, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedSpeaker === speaker.id 
                ? '0 8px 32px rgba(139, 92, 246, 0.4)' 
                : '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{
                fontSize: '48px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: '50%',
                flexShrink: 0
              }}>
                {speaker.image}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 5px 0', 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {speaker.name}
                </h3>
                <p style={{ 
                  margin: '0 0 3px 0', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px'
                }}>
                  {speaker.title}
                </p>
                <p style={{ 
                  margin: '0', 
                  color: 'rgba(139, 92, 246, 0.9)',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {speaker.company}
                </p>
              </div>
              
              <Mic2 size={24} color="rgba(139, 92, 246, 0.8)" />
            </div>

            {selectedSpeaker === speaker.id && (
              <div style={{ 
                marginTop: '15px', 
                paddingTop: '15px', 
                borderTop: '1px solid rgba(139, 92, 246, 0.3)' 
              }}>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  marginBottom: '15px'
                }}>
                  {speaker.bio}
                </p>

                <div style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}>
                    Session: {speaker.session}
                  </h4>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="rgba(255, 255, 255, 0.7)" />
                      <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {speaker.time}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} color="rgba(255, 255, 255, 0.7)" />
                      <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {speaker.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {speaker.social.linkedin && (
                    <button style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}>
                      <Linkedin size={16} />
                      LinkedIn
                    </button>
                  )}
                  {speaker.social.twitter && (
                    <button style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}>
                      <Twitter size={16} />
                      Twitter
                    </button>
                  )}
                  {speaker.social.website && (
                    <button style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}>
                      <Globe size={16} />
                      Website
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
