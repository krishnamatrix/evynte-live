'use client';

import React from 'react';
import ChatInterface from '../../components/ChatInterface';

const mockUser = {
  userId: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'attendee'
};

const mockEvent = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Indicon 2025',
  description: 'Annual technology conference',
  startDate: new Date('2025-03-01'),
  endDate: new Date('2025-03-03'),
  settings: {
    aiEnabled: true,
    allowPersonalizedQuestions: true,
    allowGeneralQuestions: true
  }
};

export default function ChatPage() {
  return <ChatInterface event={mockEvent} user={mockUser} />;
}
