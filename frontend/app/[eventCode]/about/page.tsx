'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabaseClient';
import { useEvent } from '@/contexts/EventContext';
import styles from '@/styles/PlaceholderPage.module.css';

export default function AboutPage() {
  const router = useRouter();
  const { eventCode } = useEvent();
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventName, setEventName] = useState<string>('Event');
  const [venueInfo, setVenueInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDescription();
  }, [eventCode]);

  const fetchEventDescription = async () => {
    try {
      // Fetch event description and venue from events table
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          event_name, 
          event_description,
          event_venues (*)
        `)
        .eq('event_code', eventCode)
        .single();

      if (eventError) {
        console.error('Error fetching event:', eventError);
      } else if (eventData) {
        setEventName(eventData.event_name || 'Event');
        setEventDescription(eventData.event_description || '');
        // event_venues is an array, take the first item if available
        const venues = eventData.event_venues;
        if (Array.isArray(venues) && venues.length > 0) {
          setVenueInfo(venues[0]);
        }
      }
    } catch (err) {
      console.error('Error loading event description:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>About</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Loading...
        </div>
      </div>
    );
  }

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
        <h1 className={styles.title}>About {eventName}</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {eventDescription ? (
          <div
            style={{
              background: 'rgba(30, 27, 75, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              marginBottom: '20px'
            }}
            dangerouslySetInnerHTML={{ __html: eventDescription }}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '20px'
          }}>
            No event description available
          </div>
        )}

        {venueInfo && (
          <div
            style={{
              background: 'rgba(30, 27, 75, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white'
            }}
          >
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: 'rgba(255, 255, 255, 0.95)'
            }}>
              Venue Information
            </h2>
            
            {venueInfo.venue_name && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'rgba(139, 92, 246, 0.9)' }}>Venue:</strong>
                <div style={{ marginTop: '5px' }}>{venueInfo.venue_name}</div>
              </div>
            )}
            
            {(venueInfo.venue_address || venueInfo.venue_city || venueInfo.venue_state || venueInfo.venue_country) && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'rgba(139, 92, 246, 0.9)' }}>Address:</strong>
                <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                  {venueInfo.venue_address && <div>{venueInfo.venue_address}</div>}
                  {(venueInfo.venue_city || venueInfo.venue_state || venueInfo.venue_country) && (
                    <div>
                      {[venueInfo.venue_city, venueInfo.venue_state, venueInfo.venue_country]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {venueInfo.venue_zipcode && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'rgba(139, 92, 246, 0.9)' }}>Zip Code:</strong>
                <div style={{ marginTop: '5px' }}>{venueInfo.venue_zipcode}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
