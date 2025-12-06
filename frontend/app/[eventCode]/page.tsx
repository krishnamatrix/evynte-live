'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import HomeScreen from '@/components/HomeScreen';
import { supabase } from '@/lib/supabaseClient';

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
}

export default function EventLandingPage() {
  const { eventCode } = useParams();
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

        // Fetch event data (you can add actual API call here)
        // For now using mock data
        const mockEvent: Event = {
          id: '77797ebf-a617-49f8-beb8-baec6ff21ec9',
          name: 'IEEE INDICON 2025',
          date: 'December 18-20, 2025',
          code: eventCode as string,
          description: 'IEEE International Conference on Innovations in Communications',
          venue: 'Bangalore, India',
          organizerEmail: 'indicon2025@ieeebangalore.org'
        };

        setEvent(mockEvent);
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
      eventName={event?.name || 'IEEE INDICON 2025'}
      eventDate={event?.date || 'December 18-20, 2025'}
      initialUser={user}
      initialEvent={event}
    />
  );
}
