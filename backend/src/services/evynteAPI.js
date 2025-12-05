import axios from 'axios';

/**
 * Evynte Platform API Client
 * Handles all interactions with the Evynte platform APIs
 */

const evynteClient = axios.create({
  baseURL: process.env.EVYNTE_API_URL || 'https://api.evynte.com',
  headers: {
    'Authorization': `Bearer ${process.env.EVYNTE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Error handler
evynteClient.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;
    console.error(`Evynte API Error [${status}]:`, message);
    throw new Error(`Evynte API Error: ${message}`);
  }
);

export const evynteAPI = {
  /**
   * List all events with optional filtering
   */
  async listEvents(status = 'all', limit = 10) {
    try {
      const params = { limit };
      if (status !== 'all') {
        params.status = status;
      }
      
      const response = await evynteClient.get('/events', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }
  },

  /**
   * Get detailed information about a specific event
   */
  async getEventDetails(eventId) {
    try {
      const response = await evynteClient.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get event details: ${error.message}`);
    }
  },

  /**
   * List attendees for an event
   */
  async listAttendees(eventId, status = 'all') {
    try {
      const params = {};
      if (status !== 'all') {
        params.status = status;
      }
      
      const response = await evynteClient.get(`/events/${eventId}/attendees`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list attendees: ${error.message}`);
    }
  },

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId) {
    try {
      const response = await evynteClient.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  },

  /**
   * Resend invoice email
   */
  async resendInvoice(invoiceId, email = null) {
    try {
      const data = {};
      if (email) {
        data.email = email;
      }
      
      const response = await evynteClient.post(`/invoices/${invoiceId}/resend`, data);
      return {
        success: true,
        message: 'Invoice sent successfully',
        sentTo: response.data.sentTo || email,
        invoiceId
      };
    } catch (error) {
      throw new Error(`Failed to resend invoice: ${error.message}`);
    }
  },

  /**
   * Get invoice download URL
   */
  async downloadInvoice(invoiceId, format = 'pdf') {
    try {
      const response = await evynteClient.get(`/invoices/${invoiceId}/download`, {
        params: { format },
        responseType: 'json'
      });
      
      // Return the download URL from the API
      return response.data.downloadUrl || response.data.url;
    } catch (error) {
      throw new Error(`Failed to get invoice download URL: ${error.message}`);
    }
  },

  /**
   * Search for attendees across events
   */
  async searchAttendees(query, eventId = null) {
    try {
      const params = { query };
      if (eventId) {
        params.eventId = eventId;
      }
      
      const response = await evynteClient.get('/attendees/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search attendees: ${error.message}`);
    }
  },

  /**
   * Get event statistics and analytics
   */
  async getEventStats(eventId) {
    try {
      const response = await evynteClient.get(`/events/${eventId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get event stats: ${error.message}`);
    }
  },

  /**
   * Create a new ticket/registration
   */
  async createTicket(eventId, attendee, ticketType = 'general') {
    try {
      const response = await evynteClient.post(`/events/${eventId}/tickets`, {
        attendee,
        ticketType
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  },

  /**
   * Cancel a ticket and optionally process refund
   */
  async cancelTicket(ticketId, reason = '', processRefund = true) {
    try {
      const response = await evynteClient.post(`/tickets/${ticketId}/cancel`, {
        reason,
        processRefund
      });
      return {
        success: true,
        message: 'Ticket cancelled successfully',
        ticketId,
        refundProcessed: processRefund,
        ...response.data
      };
    } catch (error) {
      throw new Error(`Failed to cancel ticket: ${error.message}`);
    }
  },

  /**
   * Health check for Evynte API
   */
  async healthCheck() {
    try {
      const response = await evynteClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Evynte API health check failed:', error.message);
      return false;
    }
  }
};

export default evynteAPI;
