'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EventContextType {
  eventId: string | null;
  eventCode: string | null;
  eventName: string | null;
  setEventData: (id: string | null, code: string | null, name: string | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventCode, setEventCode] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);

  const setEventData = (id: string | null, code: string | null, name: string | null) => {
    setEventId(id);
    setEventCode(code);
    setEventName(name);
    
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
  };

  // Load from sessionStorage on mount
  useEffect(() => {
    const storedId = sessionStorage.getItem('evynte_event_id');
    const storedCode = sessionStorage.getItem('evynte_event_code');
    const storedName = sessionStorage.getItem('evynte_event_name');
    
    if (storedId) setEventId(storedId);
    if (storedCode) setEventCode(storedCode);
    if (storedName) setEventName(storedName);
  }, []);

  return (
    <EventContext.Provider value={{ eventId, eventCode, eventName, setEventData }}>
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
