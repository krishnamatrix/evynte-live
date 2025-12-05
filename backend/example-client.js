#!/usr/bin/env node

/**
 * Example Socket.IO client for testing AI chat
 * Run: node example-client.js
 */

import { io } from 'socket.io-client';
import readline from 'readline';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const socket = io(BACKEND_URL);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let conversationHistory = [];
let isProcessing = false;

// Mock user data
const user = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com'
};

const event = {
  id: 'test-event-456',
  name: 'Test Event'
};

console.log('🤖 Evynte AI Chat Client');
console.log('========================\n');

// Socket event handlers
socket.on('connect', () => {
  console.log('✅ Connected to backend\n');
  
  // Join event
  socket.emit('join-event', {
    eventId: event.id,
    userId: user.id,
    userName: user.name
  });
  
  // Check health
  socket.emit('ai-health-check');
});

socket.on('ai-health-status', (status) => {
  console.log('🏥 Health Status:');
  console.log(`   Ollama: ${status.ollama ? '✅' : '❌'}`);
  console.log(`   Evynte API: ${status.evynte ? '✅' : '⚠️'}`);
  console.log(`   Overall: ${status.overall ? '✅ Ready' : '⚠️ Partial'}\n`);
  
  if (!status.ollama) {
    console.log('⚠️  Ollama is not running. Start it with: ollama serve\n');
  }
  
  if (!status.evynte) {
    console.log('⚠️  Evynte API not configured. Tool execution will fail.\n');
  }
  
  prompt();
});

socket.on('ai-chat-status', (data) => {
  if (data.status === 'processing') {
    process.stdout.write('\n🤔 ' + data.message + '\n');
  } else if (data.status === 'executing_tools') {
    process.stdout.write(`🔧 ${data.message}`);
    if (data.tools) {
      process.stdout.write(` [${data.tools.join(', ')}]`);
    }
    process.stdout.write('\n');
  }
});

socket.on('ai-chat-stream', (data) => {
  if (data.type === 'content') {
    process.stdout.write(data.content);
  } else if (data.type === 'final_content') {
    process.stdout.write('\n\n💡 Final response:\n');
    process.stdout.write(data.content);
  }
});

socket.on('ai-chat-tools', (data) => {
  console.log('\n📊 Tool Results:');
  data.results.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.tool}: ${result.summary}`);
  });
});

socket.on('ai-chat-complete', (data) => {
  console.log('\n\n✅ Complete!\n');
  
  // Update conversation history
  conversationHistory.push({ role: 'assistant', content: data.fullResponse });
  
  isProcessing = false;
  prompt();
});

socket.on('ai-chat-error', (data) => {
  console.log(`\n❌ Error: ${data.message}`);
  if (data.error) {
    console.log(`   Details: ${data.error}`);
  }
  console.log('');
  
  isProcessing = false;
  prompt();
});

socket.on('disconnect', () => {
  console.log('\n❌ Disconnected from backend\n');
  process.exit(0);
});

// Prompt for user input
function prompt() {
  if (isProcessing) return;
  
  rl.question('You: ', (message) => {
    if (!message.trim()) {
      prompt();
      return;
    }
    
    // Handle special commands
    if (message.trim() === '/exit' || message.trim() === '/quit') {
      console.log('\n👋 Goodbye!\n');
      socket.close();
      process.exit(0);
    }
    
    if (message.trim() === '/clear') {
      console.clear();
      conversationHistory = [];
      console.log('🧹 Conversation history cleared\n');
      prompt();
      return;
    }
    
    if (message.trim() === '/health') {
      socket.emit('ai-health-check');
      return;
    }
    
    if (message.trim() === '/history') {
      console.log('\n📜 Conversation History:');
      conversationHistory.forEach((msg, i) => {
        console.log(`${i + 1}. [${msg.role}] ${msg.content.substring(0, 100)}...`);
      });
      console.log('');
      prompt();
      return;
    }
    
    if (message.trim() === '/help') {
      showHelp();
      prompt();
      return;
    }
    
    // Send message to AI
    isProcessing = true;
    conversationHistory.push({ role: 'user', content: message });
    
    console.log('\n🤖 AI: ');
    
    socket.emit('ai-chat', {
      eventId: event.id,
      userId: user.id,
      userName: user.name,
      message: message,
      conversationHistory: conversationHistory.slice(-10) // Last 10 messages for context
    });
  });
}

function showHelp() {
  console.log('\n📖 Commands:');
  console.log('   /exit, /quit   - Exit the chat');
  console.log('   /clear         - Clear conversation history');
  console.log('   /health        - Check service health');
  console.log('   /history       - Show conversation history');
  console.log('   /help          - Show this help');
  console.log('\n💡 Example queries:');
  console.log('   - Hello, what can you do?');
  console.log('   - Show me all upcoming events');
  console.log('   - Get details for event EVT-123');
  console.log('   - Resend invoice INV-456');
  console.log('   - Search for attendees named John');
  console.log('');
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!\n');
  socket.close();
  process.exit(0);
});

// Show help on start
setTimeout(() => {
  if (!isProcessing) {
    showHelp();
  }
}, 2000);
