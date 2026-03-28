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

## Connecting the Remote to the Custom Server

Since the NEEO Remote relies on a proprietary 6LoWPAN connection to discover the Brain's IP address (rather than just using mDNS), the easiest way to connect it to your custom emulator is by using an undocumented endpoint on the **Original NEEO Brain**.

If your original NEEO Brain is still active on the local network, you can instruct it to redirect the Remote to your custom server.

1. **Use the Undocumented Endpoint on the Original Brain:**
   Open a terminal and send a request to your *original* Brain, telling it to report the *custom server's IP* to the Remote:
   ```bash
   curl http://<ORIGINAL-BRAIN-IP>:3000/projects/home/tr2/overrideBrainHost/<CUSTOM-SERVER-IP>
   ```
   *Example: `curl http://192.168.178.61:3000/projects/home/tr2/overrideBrainHost/192.168.178.250`*

   If successful, the Brain will respond with the Easter Egg: `WITH_GREAT_POWER_COMES_GREAT_RESPONSIBILITY`

2. **Reconnect the Remote:**
   Leave the original Brain powered on (the Remote needs it for the 6LoWPAN connection).
   Make sure your custom server/emulator is running.
   Wake up the Remote (or restart it). It will ask the original Brain for its IP, and the Brain will redirect it to your custom server.

## Troubleshooting

### Stuck in "Reconnecting..." Loop
If your remote control is stuck on "Reconnecting..." and fails to discover the new Brain, you might need to force it into Pairing Mode to connect to a new Brain:
1. Turn off the NEEO remote control.
2. Turn the remote back on and **immediately press and hold the BACK button** (the physical button).
3. The remote will enter Pairing Mode, allowing you to select and connect to the new custom Brain.

## Usage (Docker for NAS)

A multi-stage Docker build is provided. Important for NAS setups: The container requires access to the local network (host network mode) so the mDNS broadcast (Bonjour) can reach the remote control.

```bash
docker build -t neeo-custom-brain .
docker run -d --net=host --name neeo-brain neeo-custom-brain
```

*Note:* When using `macvlan` or `host` networking on Synology/QNAP NAS, ensure that ports 3000 and 3200 are available on the host IP.
## Discovery (mDNS / Bonjour)

To successfully emulate a NEEO Brain, the custom server must accurately announce itself on the local network using mDNS (Bonjour). The NEEO Remote searches for the `_neeo._tcp` service type and strictly validates the accompanying `TXT` records. If these records are missing or malformed, the Remote will completely ignore the server.

### How to find the correct Bonjour payload
We discovered the required payload by scanning the authentic NEEO Brain while it was connected to the same network. On macOS, you can use the built-in `dns-sd` utility to inspect mDNS traffic.

To scan for NEEO devices and print their raw TXT records, run:
```bash
dns-sd -Z _neeo._tcp
```

**Output from an authentic NEEO Brain:**
```text
_neeo._tcp PTR NEEO\032Wohnzimmer._neeo._tcp
NEEO\032Wohnzimmer._neeo._tcp SRV 0 0 3000 NEEO-f0174939.local.
NEEO\032Wohnzimmer._neeo._tcp TXT "upd=2026-3-26" "rel=0.53.9-20180424-02ae61b-0810-163048" "reg=EU" "hon=NEEO-f0174939"
```

### Mapping to code (`bonjour-service`)
Using the `dns-sd` output, we mapped the exact values into our `bonjour.publish` configuration in `server.ts`:

- **Name**: `NEEO Wohnzimmer` (Customizable, `\032` is an escaped space)
- **Service Type**: `_neeo._tcp` -> `type: 'neeo'`
- **Port**: `3000` -> `port: 3000`
- **Host**: `NEEO-f0174939.local` -> `host: 'NEEO-f0174939.local'`
- **TXT Records**:
  - `upd`: Date string (e.g., `2026-3-26`)
  - `rel`: Firmware release string. This must match the format expected by the remote (and should match the `firmwareVersion` returned by your `/systeminfo` endpoint).
  - `reg`: Hardware region (e.g., `EU` or `US`).
  - `hon`: The hostname without the `.local` suffix (e.g., `NEEO-f0174939`).

If the remote is on the same Wi-Fi but doesn't find your custom Brain, verify that your `TXT` records and `/systeminfo` output match perfectly.
