import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Events API
export const eventAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Messages API
export const messageAPI = {
  getByEvent: (eventId, userId) => 
    api.get(`/messages/event/${eventId}`, { params: { userId } }),
  getPending: (eventId) => 
    api.get(`/messages/event/${eventId}/pending`),
  updateAnswer: (messageId, data) => 
    api.put(`/messages/${messageId}/answer`, data),
};

export default api;
