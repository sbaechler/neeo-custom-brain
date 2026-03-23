<script lang="ts">
  import { onMount } from 'svelte';

  type ButtonEvent = {
    timestamp: Date;
    raw: string;
  };

  let events: ButtonEvent[] = [];
  let connectionStatus = 'Connecting...';
  let ws: WebSocket;

  onMount(() => {
    // Connect to the backend
    const host = window.location.hostname;
    ws = new WebSocket(`ws://${host}:3200/ws`);

    ws.onopen = () => {
      connectionStatus = 'Connected to Brain';
    };

    ws.onclose = () => {
      connectionStatus = 'Disconnected';
    };

    ws.onmessage = (msg) => {
      let payload = msg.data;
      
      try {
        const parsed = JSON.parse(msg.data);
        payload = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // keep raw payload if not JSON
      }

      events = [{
        timestamp: new Date(),
        raw: payload
      }, ...events].slice(0, 50); // Keep last 50 events
    };

    return () => {
      if (ws) ws.close();
    };
  });
</script>

<main>
  <header>
    <h1>NEEO Brain Emulator</h1>
    <div class="status {connectionStatus === 'Connected to Brain' ? 'online' : 'offline'}">
      {connectionStatus}
    </div>
  </header>

  <div class="events">
    <h2>Recent Button Presses</h2>
    {#if events.length === 0}
      <p class="empty">Waiting for remote buttons...</p>
    {:else}
      <ul>
        {#each events as ev}
          <li>
            <span class="time">{ev.timestamp.toLocaleTimeString()}</span>
            <pre>{ev.raw}</pre>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>

<style>
  main {
    font-family: system-ui, -apple-system, sans-serif;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
    color: #fff;
    background: #121212;
    min-height: 100vh;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .status {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status.online { background: #2e7d32; color: #c8e6c9; }
  .status.offline { background: #c62828; color: #ffcdd2; }

  .events {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  h2 {
    margin-top: 0;
    font-size: 1.25rem;
    color: #aaa;
  }

  .empty {
    color: #666;
    font-style: italic;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li {
    background: #2d2d2d;
    padding: 0.75rem;
    border-radius: 6px;
    border-left: 4px solid #1976d2;
  }

  .time {
    display: block;
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 0.25rem;
  }

  pre {
    margin: 0;
    font-family: monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #4fc3f7;
  }
</style>
