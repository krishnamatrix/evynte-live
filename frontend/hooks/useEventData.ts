import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  [key: string]: any;
}

export interface Event {
  id?: string;
  name: string;
  date: string;
  code?: string;
  description?: string;
  venue?: string;
  organizerEmail?: string;
}

export function useEventData() {
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Get data from sessionStorage
    const userStr = sessionStorage.getItem('evynte_user');
    const eventStr = sessionStorage.getItem('evynte_event');

    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    if (eventStr) {
      try {
        setEvent(JSON.parse(eventStr));
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    }
  }, []);

  return { user, event };
}
