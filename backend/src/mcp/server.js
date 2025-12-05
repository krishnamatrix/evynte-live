import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { evynteAPI } from '../services/evynteAPI.js';

/**
 * MCP Server that exposes Evynte platform APIs as tools
 * These tools can be called by the LLM to perform actions
 */

const server = new Server(
  {
    name: 'evynte-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: List all events
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_events',
        description: 'List all events in the Evynte platform. Optionally filter by status (upcoming, past, active).',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['upcoming', 'past', 'active', 'all'],
              description: 'Filter events by status',
              default: 'all'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of events to return',
              default: 10
            }
          }
        }
      },
      {
        name: 'get_event_details',
        description: 'Get detailed information about a specific event including attendees, tickets, and revenue.',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The unique identifier of the event'
            }
          },
          required: ['eventId']
        }
      },
      {
        name: 'list_attendees',
        description: 'List all attendees for a specific event with their ticket and payment status.',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The unique identifier of the event'
            },
            status: {
              type: 'string',
              enum: ['confirmed', 'pending', 'cancelled', 'all'],
              description: 'Filter attendees by registration status',
              default: 'all'
            }
          },
          required: ['eventId']
        }
      },
      {
        name: 'get_invoice',
        description: 'Get invoice details for a specific transaction or attendee.',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'The unique identifier of the invoice'
            }
          },
          required: ['invoiceId']
        }
      },
      {
        name: 'resend_invoice',
        description: 'Resend an invoice email to an attendee. Returns confirmation of email sent.',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'The unique identifier of the invoice to resend'
            },
            email: {
              type: 'string',
              description: 'Optional: Override email address to send to'
            }
          },
          required: ['invoiceId']
        }
      },
      {
        name: 'download_invoice',
        description: 'Generate and return a download URL for an invoice PDF.',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'The unique identifier of the invoice'
            },
            format: {
              type: 'string',
              enum: ['pdf', 'excel'],
              description: 'Format of the invoice file',
              default: 'pdf'
            }
          },
          required: ['invoiceId']
        }
      },
      {
        name: 'search_attendees',
        description: 'Search for attendees across all events by name, email, or other criteria.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (name, email, phone, etc.)'
            },
            eventId: {
              type: 'string',
              description: 'Optional: Limit search to specific event'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_event_stats',
        description: 'Get statistics and analytics for an event (sales, attendance, revenue, etc.).',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The unique identifier of the event'
            }
          },
          required: ['eventId']
        }
      },
      {
        name: 'create_ticket',
        description: 'Create a new ticket/registration for an attendee.',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The event to register for'
            },
            attendee: {
              type: 'object',
              description: 'Attendee information',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' }
              },
              required: ['name', 'email']
            },
            ticketType: {
              type: 'string',
              description: 'Type of ticket (general, vip, early-bird, etc.)'
            }
          },
          required: ['eventId', 'attendee']
        }
      },
      {
        name: 'cancel_ticket',
        description: 'Cancel a ticket and process refund if applicable.',
        inputSchema: {
          type: 'object',
          properties: {
            ticketId: {
              type: 'string',
              description: 'The unique identifier of the ticket to cancel'
            },
            reason: {
              type: 'string',
              description: 'Reason for cancellation'
            },
            processRefund: {
              type: 'boolean',
              description: 'Whether to process a refund',
              default: true
            }
          },
          required: ['ticketId']
        }
      }
    ]
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle the request properly - check if params exists
  if (!request || !request.params) {
    throw new Error('Invalid request format');
  }
  
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_events': {
        const events = await evynteAPI.listEvents(args.status, args.limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2)
            }
          ]
        };
      }

      case 'get_event_details': {
        const event = await evynteAPI.getEventDetails(args.eventId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(event, null, 2)
            }
          ]
        };
      }

      case 'list_attendees': {
        const attendees = await evynteAPI.listAttendees(args.eventId, args.status);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(attendees, null, 2)
            }
          ]
        };
      }

      case 'get_invoice': {
        const invoice = await evynteAPI.getInvoice(args.invoiceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2)
            }
          ]
        };
      }

      case 'resend_invoice': {
        const result = await evynteAPI.resendInvoice(args.invoiceId, args.email);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'download_invoice': {
        const downloadUrl = await evynteAPI.downloadInvoice(args.invoiceId, args.format);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ downloadUrl }, null, 2)
            }
          ]
        };
      }

      case 'search_attendees': {
        const results = await evynteAPI.searchAttendees(args.query, args.eventId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'get_event_stats': {
        const stats = await evynteAPI.getEventStats(args.eventId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        };
      }

      case 'create_ticket': {
        const ticket = await evynteAPI.createTicket(args.eventId, args.attendee, args.ticketType);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ticket, null, 2)
            }
          ]
        };
      }

      case 'cancel_ticket': {
        const result = await evynteAPI.cancelTicket(args.ticketId, args.reason, args.processRefund);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
export async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP Server started successfully');
}

export default server;
