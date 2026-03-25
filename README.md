# NEEO Custom Brain Emulator

This project replaces the original "Brain" of the NEEO remote control with a lightweight service.
The service runs on **Bun**, broadcasts the necessary mDNS signal (`_neeo._tcp`), handles the remote's requests, and serves a Svelte frontend (SPA) that is loaded directly onto the remote control.

## How it works (v1)
- **Port 3000**: Simulates the Brain's REST API for the handshake (`/v1/systeminfo`) and intercepts hardware buttons via WebSocket.
- **Port 3200**: Serves the Svelte frontend (SPA) at the path `/eui/`, which is accessed by the remote control.
- The frontend (the UI on the remote) establishes a WebSocket connection to `Port 3200 /ws` and displays a list of every hardware button pressed on the remote.

## Accessing the Original Brain's Admin Interface
If you need to access the configuration or system menu of an original NEEO Brain (e.g., to configure Wi-Fi directly), you can reach its web-based Admin Interface via:
`http://<brainIP>:3200/iui/index.html`

## Usage (Development)

1. **Build the frontend:**
   ```bash
   cd frontend
   bun install
   bun run build
   ```

2. **Start the backend/emulator:**
   ```bash
   # In the root directory
   bun install
   bun run server.ts
   ```

3. **Restart the remote control:**
   Turn the remote control off and on again (or disconnect the old Brain from power). The remote control should now discover this new Brain via mDNS and connect to it.

## Usage (Docker for NAS)

A multi-stage Docker build is provided. Important for NAS setups: The container requires access to the local network (host network mode) so the mDNS broadcast (Bonjour) can reach the remote control.

```bash
docker build -t neeo-custom-brain .
docker run -d --net=host --name neeo-brain neeo-custom-brain
```

*Note:* When using `macvlan` or `host` networking on Synology/QNAP NAS, ensure that ports 3000 and 3200 are available on the host IP.