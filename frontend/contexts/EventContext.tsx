'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VenueInfo {
  venue_name?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  venueMapHtml?: string;
}

interface EventContextType {
  eventId: string | null;
  eventCode: string | null;
  eventName: string | null;
  venueInfo: VenueInfo | null;
  setEventData: (id: string | null, code: string | null, name: string | null, venue?: VenueInfo | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventCode, setEventCode] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [venueInfo, setVenueInfo] = useState<VenueInfo | null>(null);

  const setEventData = (id: string | null, code: string | null, name: string | null, venue: VenueInfo | null = null) => {
    setEventId(id);
    setEventCode(code);
    setEventName(name);
    setVenueInfo(venue);
    
    // Store in sessionStorage for persistence
    if (id) {
      sessionStorage.setItem('evynte_event_id', id);
    }
    if (code) {
      sessionStorage.setItem('evynte_event_code', code);
    }
    if (name) {
      sessionStorage.setItem('evynte_event_name', name);
    }
    if (venue) {
      sessionStorage.setItem('evynte_venue_info', JSON.stringify(venue));
    }
  };

  // Load from sessionStorage on mount
  useEffect(() => {
    const storedId = sessionStorage.getItem('evynte_event_id');
    const storedCode = sessionStorage.getItem('evynte_event_code');
    const storedName = sessionStorage.getItem('evynte_event_name');
    const storedVenue = sessionStorage.getItem('evynte_venue_info');
    
    if (storedId) setEventId(storedId);
    if (storedCode) setEventCode(storedCode);
    if (storedName) setEventName(storedName);
    if (storedVenue) {
      try {
        setVenueInfo(JSON.parse(storedVenue));
      } catch (e) {
        console.error('Error parsing venue info:', e);
      }
    }
  }, []);

  return (
    <EventContext.Provider value={{ eventId, eventCode, eventName, venueInfo, setEventData }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
