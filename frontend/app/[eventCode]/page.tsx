'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeScreen from '@/components/HomeScreen';

export default function EventLandingPage() {

  return (
    <HomeScreen
      eventName="IEEE INDICON 2025"
      eventDate="December 18-20, 2025"
    />
  );
}
