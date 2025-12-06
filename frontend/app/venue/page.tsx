'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation, Coffee, Utensils, Info, Wifi, Users } from 'lucide-react';
import styles from '@/styles/PlaceholderPage.module.css';

const venueLocations = [
  { id: 1, name: 'Main Hall A', type: 'conference', icon: Users, floor: 1, color: '#8b5cf6' },
  { id: 2, name: 'Main Hall B', type: 'conference', icon: Users, floor: 1, color: '#8b5cf6' },
  { id: 3, name: 'Tech Arena', type: 'conference', icon: Users, floor: 2, color: '#3b82f6' },
  { id: 4, name: 'Innovation Hub', type: 'conference', icon: Users, floor: 2, color: '#3b82f6' },
  { id: 5, name: 'Workshop Room 1', type: 'workshop', icon: MapPin, floor: 1, color: '#FFA726' },
  { id: 6, name: 'Workshop Room 2', type: 'workshop', icon: MapPin, floor: 1, color: '#FFA726' },
  { id: 7, name: 'Workshop Room 3', type: 'workshop', icon: MapPin, floor: 2, color: '#FFA726' },
  { id: 8, name: 'Cafeteria', type: 'food', icon: Utensils, floor: 1, color: '#4CAF50' },
  { id: 9, name: 'Coffee Lounge', type: 'coffee', icon: Coffee, floor: 2, color: '#66BB6A' },
  { id: 10, name: 'Information Desk', type: 'info', icon: Info, floor: 1, color: '#42A5F5' },
  { id: 11, name: 'Networking Area', type: 'networking', icon: Wifi, floor: 2, color: '#AB47BC' }
];

export default function VenuePage() {
  const router = useRouter();
  const [selectedFloor, setSelectedFloor] = useState(1);

  const filteredLocations = venueLocations.filter(loc => loc.floor === selectedFloor);

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
        <h1 className={styles.title}>Venue Map</h1>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto' }}>
        {/* Floor Selector */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSelectedFloor(1)}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedFloor === 1 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                : 'rgba(30, 27, 75, 0.6)',
              border: `1px solid ${selectedFloor === 1 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Floor 1
          </button>
          <button
            onClick={() => setSelectedFloor(2)}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedFloor === 2 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                : 'rgba(30, 27, 75, 0.6)',
              border: `1px solid ${selectedFloor === 2 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`,
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Floor 2
          </button>
        </div>

        {/* Map Placeholder */}
        <div style={{
          background: 'rgba(30, 27, 75, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <Navigation size={48} color="rgba(139, 92, 246, 0.8)" style={{ margin: '0 auto 15px' }} />
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 8px 0' }}>
            Floor {selectedFloor} Map
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
            Interactive map coming soon
          </p>
        </div>

        {/* Locations List */}
        <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 10px 0', fontSize: '16px' }}>
          Locations on Floor {selectedFloor}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredLocations.map((location) => {
            const Icon = location.icon;
            return (
              <div
                key={location.id}
                style={{
                  background: 'rgba(30, 27, 75, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: location.color + '33',
                  border: `2px solid ${location.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} color={location.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: 0, 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}>
                    {location.name}
                  </h4>
                  <p style={{ 
                    margin: '2px 0 0 0', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {location.type}
                  </p>
                </div>
                <Navigation size={18} color="rgba(139, 92, 246, 0.6)" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
