'use client';

import dynamic from 'next/dynamic';

const OrganizerDashboard = dynamic(
  () => import('../../../components/OrganizerDashboard'),
  { ssr: false }
);

const mockEvent = {
  _id: '507f1f77bcf86cd799439011',
  name: 'IEEE INDICON 2025'
};

export default function OrganizerPage() {
  return <OrganizerDashboard event={mockEvent} />;
}
