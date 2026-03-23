# NEEO Custom Brain Emulator

Dieses Projekt ersetzt das originale "Brain" der NEEO-Fernbedienung durch einen schlanken Service.
Der Service läuft in **Bun**, sendet den nötigen mDNS-Broadcast aus (`_neeo._tcp`), nimmt die Anfragen der Fernbedienung entgegen und stellt ein Svelte-Frontend (SPA) bereit, das direkt auf der Fernbedienung geladen wird.

## Funktionsweise (v1)
- **Port 3000**: Simuliert die REST-API des Brains für den Handshake (`/v1/systeminfo`) und fängt Hardware-Buttons via WebSocket ab.
- **Port 3200**: Stellt das Svelte-Frontend (SPA) unter dem Pfad `/eui/` bereit, auf den die Fernbedienung zugreift.
- Das Frontend (die UI der Fernbedienung) baut eine WebSocket-Verbindung zu `Port 3200 /ws` auf und zeigt jeden gedrückten Hardware-Button der Fernbedienung in einer Liste an.

## Verwendung (Entwicklung)

1. **Frontend bauen:**
   ```bash
   cd frontend
   bun install
   bun run build
   ```

2. **Backend/Emulator starten:**
   ```bash
   # Im Hauptverzeichnis
   bun install
   bun run server.ts
   ```

3. **Fernbedienung neustarten:**
   Schalte die Fernbedienung aus und wieder ein (oder trenne das alte Brain vom Strom). Die Fernbedienung sollte nun per mDNS dieses neue Brain finden und sich verbinden.

## Verwendung (Docker für NAS)

Es wird ein mehrstufiger Docker-Build bereitgestellt. Wichtig beim NAS: Der Container benötigt Zugriff auf das lokale Netzwerk (Host-Netzwerk-Modus), damit der mDNS-Broadcast (Bonjour) die Fernbedienung erreicht.

```bash
docker build -t neeo-custom-brain .
docker run -d --net=host --name neeo-brain neeo-custom-brain
```

*Hinweis:* Bei `macvlan` oder `host` Netzwerken auf Synology/QNAP NAS unbedingt darauf achten, dass Port 3000 und 3200 auf der Host-IP frei sind.
