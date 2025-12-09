'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/PlaceholderPage.module.css';

export default function VenueMapPage() {
  const router = useRouter();
  const { eventCode } = useParams();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueMapContent();
  }, [eventCode]);

  const fetchVenueMapContent = async () => {
    try {
      // Fetch event to get event_id
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('event_code', eventCode)
        .single();

      if (eventError || !eventData) {
        console.error('Error fetching event:', eventError);
        setLoading(false);
        return;
      }

      // Fetch venue map HTML from live settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('event_live_settings')
        .select('venue_map_html')
        .eq('event_id', eventData.id)
        .single();

      if (settingsError) {
        console.error('Error fetching venue map content:', settingsError);
      } else if (settingsData?.venue_map_html) {
        setHtmlContent(settingsData.venue_map_html);
      }
    } catch (err) {
      console.error('Error loading venue map:', err);
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
          <h1 className={styles.title}>Venue Map</h1>
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
        <h1 className={styles.title}>Venue Map</h1>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {htmlContent ? (
          <div
            style={{
              background: 'rgba(30, 27, 75, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            No venue map content available
          </div>
        )}
      </div>
    </div>
  );
}
