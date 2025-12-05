import express from 'express';
import { Message } from '../models/Message.js';

const router = express.Router();

// Get messages for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, limit = 50 } = req.query;

    const messages = await Message.findByEvent(eventId, { 
      userId, 
      limit: parseInt(limit) 
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unanswered questions for an event (organizer view)
router.get('/event/:eventId/pending', async (req, res) => {
  try {
    const { eventId } = req.params;
    const messages = await Message.findPending(eventId);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update message answer (organizer response)
router.put('/:messageId/answer', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { answer, answeredBy } = req.body;

    const message = await Message.update(messageId, {
      answer,
      answeredBy,
      answeredAt: new Date().toISOString(),
      status: 'answered',
      responseSource: 'organizer'
    });

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
