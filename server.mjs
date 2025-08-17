import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { BitqueryServer } from '@bitquery/tradingview-sdk/server';
import WebSocket from 'ws';

global.WebSocket = WebSocket;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });


const WEB_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const WS_PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8081;

// Start Bitquery WebSocket server
const bitqueryServer = new BitqueryServer({
  port: WS_PORT,
  apiKey: process.env.BITQUERY_OAUTH_TOKEN ,
});
bitqueryServer.init();

const server = express();
server.use(express.static(path.join(__dirname, 'public')));
server.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

const httpServer = http.createServer(server);

httpServer.listen(WEB_PORT, (err) => {
  if (err) throw err;
  console.log(`> Web ready on http://localhost:${WEB_PORT}`);
  console.log(`> WS ready on ws://localhost:${WS_PORT}`);
});


