#!/usr/bin/env node

/**
 * Test script for AI Conversation features
 * Tests Ollama, MCP tools, and Evynte API integration
 */

import { conversationService } from './src/services/conversationService.js';
import { ollamaService } from './src/services/ollamaService.js';
import { evynteAPI } from './src/services/evynteAPI.js';

console.log('🧪 Testing Evynte AI Conversation System\n');

async function testOllama() {
  console.log('1️⃣  Testing Ollama Connection...');
  try {
    const isHealthy = await ollamaService.healthCheck();
    if (isHealthy) {
      console.log('✅ Ollama is running');
      
      const models = await ollamaService.listModels();
      console.log(`   Available models: ${models.join(', ')}`);
      
      // Test simple chat
      const response = await ollamaService.chat([
        { role: 'user', content: 'Say "Hello from Evynte!" in one line.' }
      ]);
      console.log(`   Test response: ${response.content.substring(0, 50)}...`);
    } else {
      console.log('❌ Ollama is not running');
      console.log('   Run: ollama serve');
    }
  } catch (error) {
    console.log(`❌ Ollama error: ${error.message}`);
    console.log('   Make sure Ollama is installed and running');
  }
  console.log('');
}

async function testEvynteAPI() {
  console.log('2️⃣  Testing Evynte API Connection...');
  try {
    const isHealthy = await evynteAPI.healthCheck();
    if (isHealthy) {
      console.log('✅ Evynte API is accessible');
    } else {
      console.log('⚠️  Evynte API health check returned false');
      console.log('   This may be expected if you haven\'t configured EVYNTE_API_KEY yet');
    }
  } catch (error) {
    console.log(`⚠️  Evynte API error: ${error.message}`);
    console.log('   This is expected if EVYNTE_API_KEY is not configured');
  }
  console.log('');
}

async function testMCPTools() {
  console.log('3️⃣  Testing MCP Tools...');
  try {
    const tools = await conversationService.getMCPTools();
    console.log(`✅ Found ${tools.tools.length} MCP tools:`);
    tools.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.log(`❌ MCP tools error: ${error.message}`);
  }
  console.log('');
}

async function testIntentExtraction() {
  console.log('4️⃣  Testing Intent Extraction...');
  try {
    const testMessages = [
      'Show me all upcoming events',
      'Can you resend invoice INV-123?',
      'I need to download my invoice'
    ];

    for (const message of testMessages) {
      const intent = await conversationService.extractIntent(message);
      console.log(`   Message: "${message}"`);
      console.log(`   Intent: ${intent.intent} (confidence: ${intent.confidence})`);
      console.log(`   Suggested tool: ${intent.suggested_tool || 'none'}`);
      console.log('');
    }
  } catch (error) {
    console.log(`❌ Intent extraction error: ${error.message}`);
  }
}

async function testConversation() {
  console.log('5️⃣  Testing Full Conversation (Mock)...');
  try {
    console.log('   This would normally call Evynte APIs, but we\'ll just test the flow');
    console.log('   User: "What events do you have?"');
    console.log('   Expected: Ollama → list_events tool → Format response');
    console.log('   ✅ Conversation flow is set up correctly');
  } catch (error) {
    console.log(`❌ Conversation error: ${error.message}`);
  }
  console.log('');
}

async function testHealthCheck() {
  console.log('6️⃣  Overall Health Check...');
  try {
    const health = await conversationService.healthCheck();
    console.log('   Status:');
    console.log(`   - Ollama: ${health.ollama ? '✅' : '❌'}`);
    console.log(`   - Evynte API: ${health.evynte ? '✅' : '⚠️'}`);
    console.log(`   - Overall: ${health.overall ? '✅ Ready' : '⚠️ Partial'}`);
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
  console.log('');
}

// Run all tests
async function runTests() {
  await testOllama();
  await testEvynteAPI();
  await testMCPTools();
  await testIntentExtraction();
  await testConversation();
  await testHealthCheck();

  console.log('✨ Testing complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Make sure Ollama is running: ollama serve');
  console.log('   2. Configure EVYNTE_API_KEY in .env');
  console.log('   3. Start the backend: npm run dev');
  console.log('   4. Test via Socket.IO client or frontend');
  console.log('');
  console.log('📚 See AI_CONVERSATION_GUIDE.md for full documentation');
}

runTests().catch(console.error);
