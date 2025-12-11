'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useEvent } from '@/contexts/EventContext';
import styles from '@/styles/PlaceholderPage.module.css';

export default function VenueMapPage() {
  const router = useRouter();
  const { venueInfo, eventName } = useEvent();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);
  console.log('Venue Info:', venueInfo);
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>Venue Map</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Loading...
        </div>
      </div>
    );
  }

  const hasLocation = venueInfo?.venue_latitude && venueInfo?.venue_longitude;
  const lat = venueInfo?.venue_latitude || 0;
  const lng = venueInfo?.venue_longitude || 0;
  const zoom = 15;

  // OpenStreetMap tile URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

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

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {hasLocation ? (
          <>
            {venueInfo?.venue_name && (
              <div
                style={{
                  background: 'rgba(30, 27, 75, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  color: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <MapPin size={20} style={{ color: '#8b5cf6' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                    {venueInfo.venue_name}
                  </h2>
                </div>
                {(venueInfo.venue_address || venueInfo.venue_city) && (
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    {venueInfo.venue_address && <span>{venueInfo.venue_address}<br /></span>}
                    {[venueInfo.venue_city, venueInfo.venue_state, venueInfo.venue_country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                background: 'rgba(30, 27, 75, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '20px',
                padding: '20px',
                flex: 1,
                minHeight: '500px'
              }}
            >
              <iframe
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  borderRadius: '12px',
                  minHeight: '450px'
                }}
                src={mapUrl}
                title="Venue Location Map"
              />
              <div style={{ 
                marginTop: '15px', 
                textAlign: 'center',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#8b5cf6',
                    textDecoration: 'underline'
                  }}
                >
                  View on OpenStreetMap
                </a>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'rgba(30, 27, 75, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '20px'
          }}>
            <MapPin size={48} style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '20px' }} />
            <p>Venue location not available</p>
          </div>
        )}
      </div>
    </div>
  );
}
