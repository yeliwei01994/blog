import { createServer as createHttpServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { createMessage, listMessages, type MessageQueryClient } from './messages.js';

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(body));
}

export function createServer(db: MessageQueryClient): Server {
  return createHttpServer(async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method === 'GET' && request.url === '/api/messages') {
      try {
        sendJson(response, 200, await listMessages(db));
      } catch {
        sendJson(response, 500, { error: 'Unable to load messages' });
      }
      return;
    }

    if (request.method === 'POST' && request.url === '/api/messages') {
      let body = '';
      request.on('data', (chunk) => { body += chunk; });
      request.on('end', async () => {
        try {
          const input = JSON.parse(body) as { name?: string; message?: string };
          const name = input.name?.trim();
          const message = input.message?.trim();
          if (!name || !message || name.length > 80 || message.length > 2000) {
            sendJson(response, 400, { error: 'Name and message are required' });
            return;
          }
          sendJson(response, 201, await createMessage(db, name, message));
        } catch {
          sendJson(response, 400, { error: 'Invalid request' });
        }
      });
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });
}

if (process.argv[1]?.endsWith('server.ts')) {
  const { pool } = await import('./db.js');
  const port = Number(process.env.PORT ?? 3000);
  createServer(pool).listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
