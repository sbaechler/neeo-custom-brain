import Bonjour from 'bonjour-service';
import { serve } from 'bun';
import { join } from 'path';

console.log("Starting NEEO Brain Emulator...");

// 1. mDNS Broadcast
const bonjour = new Bonjour();

// Get current date formatted as YYYY-M-D for the 'upd' TXT record
const today = new Date();
const updDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

bonjour.publish({ 
  name: 'NEEO Custom Brain', 
  type: 'neeo', 
  port: 3000,
  txt: {
    upd: updDate,
    rel: "0.53.9-20180424-02ae61b-0810-163048",
    reg: "EU",
    hon: "NEEO-custom"
  }
});
console.log('[mDNS] _neeo._tcp published on port 3000');

// Connected clients
const frontendClients = new Set<any>();

function getLocalIp() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' !== iface.family || iface.internal !== false) continue;
      return iface.address;
    }
  }
  return '192.168.1.1';
}
const localIp = getLocalIp();

// 2. Port 3000: Brain API & Remote WebSocket
serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    console.log(`[Remote -> API:3000] ${req.method} ${url.pathname}`);
    
    // Check if the remote is trying to open a WebSocket
    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
      if (server.upgrade(req, { data: { source: 'remote' } })) return;
    }
    
    // Emulate systeminfo needed for discovery/pairing
    if (url.pathname.includes('/v1/systeminfo')) {
      return Response.json({
        hardwareRegion: "EU",
        touchButtonPressed: false,
        hardwareRevision: 5,
        hardwareType: "NEEO",
        isProLicensed: false,
        licenseDescriptionRemote: "NEEO Remote",
        user: "custom@brain.local",
        version: "0.53.9",
        hostname: "NEEO-simulator",
        ip: localIp,
        activeHandles: { activeHandlesCount: 0 },
        temperature: "35.0"
      });
    }

    // Capture everything else to avoid 404s
    return Response.json({ success: true, message: "Mocked response" });
  },
  websocket: {
    message(ws, message) {
      console.log(`[Remote WS] button event: ${message}`);
      
      // Relay to all Svelte frontend clients
      for (const client of frontendClients) {
        client.send(message);
      }
    },
    open(ws) {
      console.log('[Remote WS] NEEO remote connected');
    },
    close(ws) {
      console.log('[Remote WS] NEEO remote disconnected');
    }
  }
});

// 3. Port 3200: EUI Server & Frontend WebSocket
serve({
  port: 3200,
  async fetch(req, server) {
    const url = new URL(req.url);
    
    // WebSocket endpoint for our Svelte App
    if (url.pathname === '/ws') {
      if (server.upgrade(req, { data: { source: 'frontend' } })) return;
      return new Response("Upgrade failed", { status: 400 });
    }
    
    let path = url.pathname;
    
    if (path === '/' || path === '/eui' || path === '/eui/') {
      path = '/index.html';
    } else if (path.startsWith('/eui/')) {
      path = path.substring(4);
    }
    
    let filePath = join(process.cwd(), 'frontend', 'dist', path);
    let file = Bun.file(filePath);
    
    if (!(await file.exists())) {
      filePath = join(process.cwd(), 'frontend', 'dist', 'index.html');
      file = Bun.file(filePath);
    }
    
    return new Response(file);
  },
  websocket: {
    message(ws, message) {
      // Incoming from Svelte App
    },
    open(ws) {
      console.log('[Frontend WS] Svelte App connected to Brain WS');
      frontendClients.add(ws);
    },
    close(ws) {
      console.log('[Frontend WS] Svelte App disconnected');
      frontendClients.delete(ws);
    }
  }
});

console.log(`Brain API Simulator listening on http://${localIp}:3000`);
console.log(`EUI Web Interface listening on http://${localIp}:3200/eui/`);
