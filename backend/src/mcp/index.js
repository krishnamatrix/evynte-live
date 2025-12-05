#!/usr/bin/env node
import 'dotenv/config';
import { startMCPServer } from './server.js';

// Start the MCP server
startMCPServer().catch(console.error);
