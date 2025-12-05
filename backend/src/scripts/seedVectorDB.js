import { Event } from '../models/Event.js';
import { Message } from '../models/Message.js';
import { generateEmbedding, storeQAPair } from '../services/aiService.js';

/**
 * Seed script to populate vector database with existing Q&A pairs
 * Run this after setting up events and getting some organizer responses
 */

const seedVectorDB = async () => {
  try {
    console.log('Starting vector DB seeding...');

    // Find all answered general questions that aren't in vector DB yet
    const answeredQuestions = await Message.findUnsavedAnswers();

    console.log(`Found ${answeredQuestions.length} questions to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const message of answeredQuestions) {
      try {
        console.log(`Processing: "${message.question.substring(0, 50)}..."`);

        const vectorId = await storeQAPair(
          message.question,
          message.answer,
          message.event_id,
          message.id
        );

        // Update message to mark as saved
        await Message.update(message.id, {
          savedToVectorDB: true,
          vectorDBId: vectorId
        });

        successCount++;
        console.log(`✓ Stored successfully (${successCount}/${answeredQuestions.length})`);

      } catch (error) {
        errorCount++;
        console.error(`✗ Error processing message ${message.id}:`, error.message);
      }
    }

    console.log('\n=== Seeding Complete ===');
    console.log(`Successfully stored: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total processed: ${answeredQuestions.length}`);

  } catch (error) {
    console.error('Fatal error during seeding:', error);
  }
};

/**
 * Add sample Q&A pairs for testing
 */
export const addSampleQA = async (eventId) => {
  const sampleQAs = [
    {
      question: "What time does the event start?",
      answer: "The event starts at 9:00 AM EST. Please arrive 15 minutes early for registration."
    },
    {
      question: "Is there parking available?",
      answer: "Yes, free parking is available in the main parking lot. Additional overflow parking is available in Lot B."
    },
    {
      question: "Will lunch be provided?",
      answer: "Yes, lunch will be provided for all attendees. We have vegetarian and gluten-free options available."
    },
    {
      question: "Can I bring a guest?",
      answer: "Each ticket allows for one attendee. If you'd like to bring a guest, please purchase an additional ticket."
    },
    {
      question: "What is the dress code?",
      answer: "Business casual attire is recommended for this event."
    }
  ];

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.error('Event not found');
      return;
    }

    console.log(`Adding ${sampleQAs.length} sample Q&A pairs for event: ${event.name}`);

    for (const qa of sampleQAs) {
      const message = await Message.create({
        eventId,
        userId: 'sample-user',
        userName: 'Sample User',
        userEmail: 'sample@example.com',
        question: qa.question,
        answer: qa.answer,
        questionType: 'general',
        responseSource: 'organizer',
        status: 'answered',
        answeredBy: 'System',
        answeredAt: new Date().toISOString()
      });

      const vectorId = await storeQAPair(
        qa.question,
        qa.answer,
        eventId,
        message.id
      );

      await Message.update(message.id, {
        savedToVectorDB: true,
        vectorDBId: vectorId
      });

      console.log(`✓ Added: "${qa.question}"`);
    }

    console.log('\nSample Q&A pairs added successfully!');

  } catch (error) {
    console.error('Error adding sample Q&A:', error);
  }
};

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { connectDB } = await import('../config/database.js');
  const dotenv = await import('dotenv');
  
  dotenv.config();

  await connectDB();
  await seedVectorDB();

  process.exit(0);
}

export default seedVectorDB;
