import Bonjour from 'bonjour-service';
import { serve } from 'bun';
import { join } from 'path';
import fs from 'fs';

console.log("Starting NEEO Brain Emulator...");

const REAL_BRAIN_IP = "192.168.178.61";
const LOG_DIR = join(process.cwd(), 'proxy_logs');

// Clear logs on restart
if (fs.existsSync(LOG_DIR)) {
  fs.rmSync(LOG_DIR, { recursive: true, force: true });
}
fs.mkdirSync(LOG_DIR, { recursive: true });

// 1. mDNS Broadcast
const bonjour = new Bonjour();
const today = new Date();
const updDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const brainId = "NEEO-f0174939";

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
bonjour.publish({ 
  name: 'NEEO Wohnzimmer', 
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

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Accept,X-Requested-With,Origin,X-NEEO-Secure',
  'Access-Control-Allow-Credentials': 'true'
};

function withCors(headers: Record<string, string> = {}) {
  return { ...CORS_HEADERS, ...headers };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patchCapturedGuiXml(xml: string, requestHost: string | null) {
  const host = requestHost || `${brainId}.local:3000`;
  const baseUrl = `http://${host}`;

  return xml
    .replace(/192\.168\.178\.61/g, localIp)
    .replace(/192\.168\.1\.177:3000/g, host)
    .replace(/v1&#x2F;imagecache&#x2F;getresized&#x2F;100&#x2F;80&#x2F;http%3A%2F%2F(?:\d{1,3}\.){3}\d{1,3}%3A3000%2Fv1%2Fimagecache%2Fdefault%2Ffavorite%2F/g, `v1&#x2F;imagecache&#x2F;getresized&#x2F;100&#x2F;80&#x2F;${encodeURIComponent(`${baseUrl}/v1/imagecache/default/favorite/`)}`)
    .replace(new RegExp(escapeRegExp(`http://${brainId}.local:3000`), 'g'), baseUrl);
}

function patchGuidataXml(xml: string) {
  return xml
    .replace(/brainHostname="[^"]+"/g, `brainHostname="${brainId.toLowerCase()}"`)
    .replace(/projectId="[^"]+"/g, 'projectId="1774591238783"');
}

let requestCounter = 0;

// 2. Port 3000: Brain API & Remote WebSocket
serve({
  port: 3000, 
  probe: false,
  async fetch(req, server) {
    const url = new URL(req.url);
    const reqId = (++requestCounter).toString().padStart(4, '0');
    const safePath = url.pathname.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log(`[Remote -> API:3000] [Req ${reqId}] ${req.method} ${url.pathname}`);
    
    // Check if the remote is trying to open a WebSocket
    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
      if (server.upgrade(req, { data: { source: 'remote' } })) return;
    }
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: withCors() });
    }

    // Proxy request to real brain
    const targetUrl = `http://${REAL_BRAIN_IP}:3000${url.pathname}${url.search}`;
    const proxyHeaders = new Headers(req.headers);
    // Don't forward host header so we don't confuse the real brain
    proxyHeaders.set('host', `${REAL_BRAIN_IP}:3000`);
    proxyHeaders.delete('accept-encoding');

    let reqBody = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      reqBody = await req.arrayBuffer();
    }

    // Log Request
    const reqLog = {
      method: req.method,
      url: url.href,
      targetUrl,
      headers: Object.fromEntries(req.headers.entries()),
      body: reqBody ? new TextDecoder().decode(reqBody).substring(0, 1000) : null
    };
    fs.writeFileSync(join(LOG_DIR, `${reqId}_req_${req.method}${safePath}.json`), JSON.stringify(reqLog, null, 2));

    let upstreamResponse;
    try {
      upstreamResponse = await fetch(targetUrl, {
        method: req.method,
        headers: proxyHeaders,
        body: reqBody
      });
    } catch (e: any) {
      console.error(`[Req ${reqId}] Upstream Error: ${e.message}`);
      return new Response(`Upstream Error: ${e.message}`, { status: 502 });
    }

    let resBodyBuffer = await upstreamResponse.arrayBuffer();
    const resHeaders = new Headers(upstreamResponse.headers);

    // If it's gui_xml or guidata_xml, we need to intercept and patch the IPs
    if (url.pathname === '/projects/home/tr2/gui_xml') {
      let text = new TextDecoder().decode(resBodyBuffer);
      text = patchCapturedGuiXml(text, req.headers.get('host'));

      const acceptsGzip = req.headers.get('accept-encoding')?.includes('gzip');
      if (acceptsGzip) {
        resBodyBuffer = Bun.gzipSync(text);
        resHeaders.set('content-encoding', 'gzip');
      } else {
        resBodyBuffer = new TextEncoder().encode(text).buffer;
        resHeaders.delete('content-encoding');
      }
      resHeaders.set('content-length', resBodyBuffer.byteLength.toString());
    } 
    else if (url.pathname === '/projects/home/tr2/guidata_xml') {
      let text = new TextDecoder().decode(resBodyBuffer);
      text = patchGuidataXml(text);

      const acceptsGzip = req.headers.get('accept-encoding')?.includes('gzip');
      if (acceptsGzip) {
        resBodyBuffer = Bun.gzipSync(text);
        resHeaders.set('content-encoding', 'gzip');
      } else {
        resBodyBuffer = new TextEncoder().encode(text).buffer;
        resHeaders.delete('content-encoding');
      }
      resHeaders.set('content-length', resBodyBuffer.byteLength.toString());
    }
    // Also patch systeminfo IP
    else if (url.pathname === '/systeminfo' || url.pathname === '/v1/systeminfo') {
      let text = new TextDecoder().decode(resBodyBuffer);
      try {
        const payload = JSON.parse(text);
        payload.ip = localIp;
        payload.lanip = localIp;
        payload.wlanip = localIp;
        text = JSON.stringify(payload);
        resBodyBuffer = new TextEncoder().encode(text).buffer;
        resHeaders.set('content-length', resBodyBuffer.byteLength.toString());
      } catch (e) {
        console.error("Could not patch systeminfo JSON", e);
      }
    }

    // Ensure CORS
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      resHeaders.set(k, v);
    }

    // Log Response
    let loggedResBody = "Binary or Large Data";
    if (resBodyBuffer.byteLength < 50000) {
      const ct = resHeaders.get('content-type') || '';
      if (ct.includes('json') || ct.includes('xml') || ct.includes('text')) {
        loggedResBody = new TextDecoder().decode(resBodyBuffer).substring(0, 5000); // partial log
      }
    }

    const resLog = {
      status: upstreamResponse.status,
      headers: Object.fromEntries(resHeaders.entries()),
      bodyPreview: loggedResBody
    };
    fs.writeFileSync(join(LOG_DIR, `${reqId}_res_${upstreamResponse.status}${safePath}.json`), JSON.stringify(resLog, null, 2));

    return new Response(resBodyBuffer, {
      status: upstreamResponse.status,
      headers: resHeaders
    });
  },
  websocket: {
    message(ws, message) {
      console.log(`[Remote WS] button event: ${message}`);
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
    
    if (await file.exists()) {
      return new Response(file);
    }
    
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
process.on('SIGINT', () => {
  console.log("\nShutting down... Unpublishing mDNS.");
  bonjour.unpublishAll(() => {
    bonjour.destroy();
    console.log("mDNS unpublished. Goodbye!");
    process.exit(0);
  });
});
