'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import HomeScreen from '@/components/HomeScreen';
import { supabase } from '@/lib/supabaseClient';
import { useEvent } from '@/contexts/EventContext';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    company?: string;
    [key: string]: any;
  };
}

interface Event {
  id?: string;
  name: string;
  date: string;
  code?: string;
  description?: string;
  venue?: string;
  organizerEmail?: string;
  event_venue?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: any;
  };
  liveSettings?: {
    [key: string]: 'active' | 'coming_soon' | 'disabled';
  };
  venueMapHtml?: string;
  travelInfoHtml?: string;
  hotelsNearbyHtml?: string;
}

export default function EventLandingPage() {
  const { eventCode } = useParams();
  const { setEventData } = useEvent();
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user from Supabase auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            user_metadata: authUser.user_metadata
          });
        }

        // Fetch event data from Supabase
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            event_venues (*)
          `)
          .eq('event_code', eventCode)
          .single();
        console.log('Fetched event data:', eventData, 'Error:', eventError);
        if (eventError) {
          console.error('Error fetching event:', eventError);
        } else if (eventData) {
          // Format the date if needed
          let formattedDate = 'TBA';
          if (eventData.event_start_date && eventData.event_end_date) {
            const startDate = new Date(eventData.event_start_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            });
            const endDate = new Date(eventData.event_end_date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            });
            formattedDate = `${startDate} - ${endDate}`;
          }

          // Fetch event live settings
          const { data: liveSettings, error: settingsError } = await supabase
            .from('event_live_settings')
            .select('*')
            .eq('event_id', eventData.id)
            .single();

          console.log('Fetched live settings:', liveSettings, 'Error:', settingsError);

          // Parse live settings into a usable format based on enabled and coming_soon flags
          let parsedSettings: { [key: string]: 'active' | 'coming_soon' | 'disabled' } = {};
          if (liveSettings && !settingsError) {
            // Helper function to determine status
            const getStatus = (enabled: boolean, comingSoon: boolean): 'active' | 'coming_soon' | 'disabled' => {
              if (enabled) return 'active';
              if (comingSoon) return 'coming_soon';
              return 'disabled';
            };

            parsedSettings = {
              qr: getStatus(liveSettings.my_qr_enabled, liveSettings.my_qr_coming_soon),
              agenda: getStatus(liveSettings.agenda_enabled, liveSettings.agenda_coming_soon),
              schedule: getStatus(liveSettings.schedule_enabled, liveSettings.schedule_coming_soon),
              photobooth: getStatus(liveSettings.photo_booth_enabled, liveSettings.photo_booth_coming_soon),
              organizers: getStatus(liveSettings.organizers_enabled, liveSettings.organizers_coming_soon),
              about: getStatus(liveSettings.about_enabled, liveSettings.about_coming_soon),
              networking: getStatus(liveSettings.networking_enabled, liveSettings.networking_coming_soon),
              chat: getStatus(liveSettings.chat_enabled, liveSettings.chat_coming_soon),
              venueMap: getStatus(liveSettings.venue_map_enabled, liveSettings.venue_map_coming_soon),
              travelInfo: getStatus(liveSettings.travel_info_enabled, liveSettings.travel_info_coming_soon),
              hotelsNearby: getStatus(liveSettings.hotels_nearby_enabled, liveSettings.hotels_nearby_coming_soon),
              notifications: getStatus(false, false), // Not in settings, default to disabled
              kiosksLive: getStatus(liveSettings.live_kiosk_scanning_enabled, liveSettings.live_kiosk_scanning_coming_soon),
            };
          }
          console.log('Parsed live settings:', parsedSettings);
          setEvent({
            id: eventData.id,
            name: eventData.event_name || 'Event',
            date: formattedDate,
            code: eventData.event_code,
            description: eventData.event_description,
            venue: eventData.event_venue?.name || eventData.event_venue?.city,
            organizerEmail: eventData.organizer_email,
            event_venue: eventData.event_venue,
            liveSettings: parsedSettings,
            venueMapHtml: liveSettings?.venue_map_html || '',
            travelInfoHtml: liveSettings?.travel_info_html || '',
            hotelsNearbyHtml: liveSettings?.hotels_nearby_html || ''
          });

          // Set event data in context for global access
          const venues = eventData.event_venues;
          const venueData = Array.isArray(venues) && venues.length > 0 ? {
            ...venues[0],
            venueMapHtml: liveSettings?.venue_map_html || ''
          } : null;
          console.log('Setting event data in context with venue:', venueData);
          
          setEventData(
            eventData.id,
            eventData.event_code,
            eventData.event_name || 'Event',
            venueData
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [eventCode]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <HomeScreen
      eventName={event?.name || 'Event'}
      eventDate={event?.date || 'TBA'}
      initialUser={user}
      initialEvent={event}
    />
  );
}
