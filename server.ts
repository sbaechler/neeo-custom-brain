import Bonjour from 'bonjour-service';
import { serve } from 'bun';
import { join } from 'path';

console.log("Starting NEEO Brain Emulator...");

// 1. mDNS Broadcast
const bonjour = new Bonjour();

// Get current date formatted as YYYY-M-D for the 'upd' TXT record
const today = new Date();
const updDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const brainId = "NEEO-f0174939";

bonjour.publish({ 
  name: 'NEEO Wohnzimmer', 
  host: `${brainId}.local`,
  type: 'neeo', 
  port: 3000,
  probe: false,
  txt: {
    upd: updDate,
    rel: "0.53.9-20180424-02ae61b-0810-163048",
    reg: "EU",
    hon: brainId
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
  probe: false,
  fetch(req, server) {
    const url = new URL(req.url);
    console.log(`[Remote -> API:3000] ${req.method} ${url.pathname}`);
    console.log("Headers:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Check if the remote is trying to open a WebSocket
    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
      if (server.upgrade(req, { data: { source: 'remote' } })) return;
    }
    
    // Emulate systeminfo needed for discovery/pairing
    if (url.pathname === '/systeminfo' || url.pathname === '/v1/systeminfo') {
      return Response.json({
        hardwareRegion: "EU",
        touchButtonPressed: true,
        hardwareRevision: 5,
        hardwareType: "NEEO",
        isProLicensed: false,
        licenseDescriptionRemote: "NEEO Remote",
        user: "custom@brain.local",
        version: "0.53.9-02ae61b",
        firmwareVersion: "0.53.9-20180424-02ae61b-0810-163048",
        hostname: brainId,
        ip: localIp,
        lanip: localIp,
        wlanip: localIp,
        "wlanregion": "EU",
        activeHandles: { activeHandlesCount: 0 },
        temperature: "35.0",
  "tr2version": "0.53.8",
  "totalmem": 1053401088,
  "freemem": 594673664,
  "wlancountry": "DE",
  "wlaninfo": [
    "RSSI=-45",
    "LINKSPEED=72",
    "NOISE=9999",
    "FREQUENCY=2437"
  ],
  "uptime": 7085,
  "loadavgShort": 0.16552734375,
  "loadavgMid": 0.107421875,
  "loadavgLong": 0.07177734375,
      });
    }

    // Emulate checkAirkey needed for recovery mode pairing
    // The real brain compares the host header with the currentIp and returns a 302 if it doesn't match.
    if (url.pathname === '/projects/checkAirkey') {
      return new Response("NOT_THE_BRAIN_YOU_ARE_LOOKING_FOR", { status: 200 });
    }


    // Serve the TR2 GUI XML file
    if (url.pathname === '/projects/home/tr2/gui_xml') {
      const xmlPath = join(process.cwd(), 'data', 'gui_xml.xml');
      const xmlFile = Bun.file(xmlPath);
      return new Response(xmlFile, {
        headers: {
          'Content-Type': 'application/xml',
          'Access-Control-Allow-Origin': '*'
        }
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
    console.log(`[Remote -> API:3200] ${req.method} ${url.pathname}`);
    console.log("Headers:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // WebSocket endpoint for our Svelte App
    if (url.pathname === '/ws') {
      if (server.upgrade(req, { data: { source: 'frontend' } })) return;
      return new Response("Upgrade failed", { status: 400 });
    }
    
    let path = url.pathname;
    
    // Remote typically asks for /intro/index.html, /cordova.js, /eui/index.html etc.
    if (path === '/' || path === '/eui' || path === '/eui/') {
      path = '/index.html';
    } else if (path.startsWith('/eui/')) {
      path = path.substring(4);
    }
    
    let filePath = join(process.cwd(), 'frontend', 'dist', path);
    let file = Bun.file(filePath);
    
    // Serve exact file if it exists (e.g., /intro/app.js)
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Fallback for SPA routing if it's an HTML/UI route
    if (!path.includes('.')) {
      filePath = join(process.cwd(), 'frontend', 'dist', 'index.html');
      file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
    }
    
    return new Response(`File not found: ${path}`, { status: 404 });
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
// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\nShutting down... Unpublishing mDNS.");
  bonjour.unpublishAll(() => {
    bonjour.destroy();
    console.log("mDNS unpublished. Goodbye!");
    process.exit(0);
  });
});
