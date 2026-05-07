# front end system design

# Real-Time Communication Patterns Reference

> A comprehensive guide to short polling, long polling, WebSockets, SSE, and Webhooks with sequence diagrams, use cases, and comparisons.

---

## 📊 How Each Pattern Works — Sequence Diagrams

### 🔵 Short Polling

```
Client repeatedly asks the server every few seconds.
Most requests get empty responses.

Timeline:
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │    Server    │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │──── GET /updates ───────────────>│
       │                                   │
       │<────── 204 No content ───────────│
       │                                   │
       │──── GET /updates (again) ──────>│
       │                                   │
       │<────── 204 No content ───────────│
       │                                   │
       ├─────── [repeats every N seconds] ─────────┤
```

**Key Characteristic:** Client initiates all requests.

---

### 🟢 Long Polling

```
Client sends a request and server holds it open until
data is available, then responds. Client immediately
opens a new request.

Timeline:
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │    Server    │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │─── GET /updates (held open) ───>│
       │                                   │
       │                              [waiting...]
       │                                   │
       │<── 200 Data ready! (after event) │
       │                                   │
       │ (immediately re-opens request)    │
```

**Key Characteristic:** Server waits until data is available before responding.

---

### 🟠 WebSockets

```
Client and server do a one-time upgrade handshake,
then exchange messages freely in both directions
over a persistent connection.

Timeline:
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │    Server    │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │── HTTP Upgrade: websocket ──────>│
       │                                   │
       │<── 101 Switching Protocols ──────│
       │                                   │
       │<═══════════════════════════════>│ (persistent)
       │                                   │
       │──── msg: "user typing" ────────>│
       │                                   │
       │<─── msg: "new message" ─────────│
       │                                   │
       │──── msg: "user left" ──────────>│
       │                                   │
```

**Key Characteristic:** Full-duplex persistent connection.

---

### 🟣 SSE (Server-Sent Events)

```
Client makes one HTTP GET request and server streams
events down indefinitely. One direction only,
server to client.

Timeline:
┌─────────────┐                    ┌──────────────┐
│   Client    │                    │    Server    │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │─ GET /stream ────────────────────>│
       │ (Accept: text/event-stream)       │
       │                                   │
       │<─────── data: event 1 ──────────│
       │                                   │
       │<─────── data: event 2 ──────────│
       │                                   │
       │<─────── data: event 3 ... ──────│
       │                                   │
```

**Key Characteristic:** Server → Client only, single request, auto-reconnect.

---

### 🟡 Webhook

```
Service A registers a callback URL with Service B.
When an event happens in B, B calls A's URL with
the event data. No polling needed.

Timeline:
┌──────────────────┐                ┌─────────────────────────┐
│  Your Server     │                │ 3rd Party (Stripe/etc)  │
└────────┬─────────┘                └────────────┬────────────┘
         │                                        │
         │── Register: POST /webhooks ────────────>│
         │  (https://you.com/webhooks)             │
         │                                         │
         │                                    [event fires]
         │                                         │
         │<─ POST /webhooks ──────────────────────│
         │   { event: "payment.success", ... }    │
         │                                         │
         │─ HTTP 200 OK ──────────────────────────>│
         │ (acknowledge receipt)                   │
```

**Key Characteristic:** Push-based, server-to-server, no idle connections.

---

## 📋 Pattern Reference Cards

### 🔵 Short Polling

**Quote:** _"Client asks every N seconds. Works everywhere. Wastes bandwidth."_

#### Best For

Simple dashboards, low-frequency updates, status checks. Good when you just need something working fast.

#### Real-World Use

- Basic notification badge refresh
- Legacy admin panels
- Simple status pages

#### ✅ Pros

- Zero infra complexity
- Works behind any proxy/CDN
- Easy to debug
- Works on extremely old browsers

#### ❌ Cons

- Wasted requests (mostly empty)
- High server load at scale
- Latency = poll interval
- Inefficient bandwidth usage

#### Badges

`HTTP` `setInterval` `REST` `stateless`

---

### 🟢 Long Polling

**Quote:** _"Client asks, server waits until there's something to say, then responds immediately."_

#### Best For

Near-real-time updates when WebSockets are blocked. Good compatibility with HTTP/1.1 environments. Fallback for modern apps.

#### Real-World Use

- Old Facebook chat (Comet)
- Slack's fallback mechanism
- Zoom backup mechanism

#### ✅ Pros

- Lower latency than short polling
- No wasted empty responses
- Works on HTTP/1.1
- Better than short polling for latency

#### ❌ Cons

- Holds open server connections (RAM intensive)
- Reconnect logic is tricky
- Not truly real-time
- Thundering herd on reconnect

#### Badges

`HTTP` `Comet` `timeout` `held connections`

---

### 🟠 WebSockets

**Quote:** _"One handshake, then full two-way conversation over a persistent connection — like a phone call."_

#### Best For

Chat, live collaboration, multiplayer games, trading platforms. Anything needing sub-100ms latency in both directions.

#### Real-World Use

- **Slack** — team chat
- **Figma** — collaborative editing
- **Google Docs** — real-time collaboration
- **Binance** — live trade updates
- **Online games** — player state sync

#### ✅ Pros

- Full-duplex (both directions simultaneously)
- Very low latency (<100ms)
- Efficient — no HTTP headers per message
- Binary support for efficient data transfer

#### ❌ Cons

- Stateful — hard to scale horizontally (sticky sessions needed)
- Blocked by some proxies/firewalls/corporate networks
- Need sticky sessions or pub/sub (Redis)
- Requires connection pooling
- More complex to implement

#### Badges

`ws://` `wss://` `socket.io` `sticky session` `full-duplex` `stateful`

---

### 🟣 SSE (Server-Sent Events)

**Quote:** _"Client opens one HTTP connection and listens forever. Server pushes whenever it has something — browser handles reconnect automatically."_

#### Best For

Live feeds, AI streaming responses, stock tickers, activity logs. Any server-to-client one-way stream.

#### Real-World Use

- **ChatGPT** — streaming tokens in real-time
- **Twitter/X** — live counts and trending
- **CI/CD tools** — log streaming
- **Stock tickers** — price updates
- **GitHub** — deployment logs

#### ✅ Pros

- Built into browsers (EventSource API)
- Auto-reconnect built in with exponential backoff
- Works over HTTP/2 (multiplexed — 100+ connections per domain)
- Simple to implement server-side
- Text-based protocol (easy to debug)
- Works with existing HTTP infrastructure

#### ❌ Cons

- Server → client only (no client upload)
- Max 6 connections per domain on HTTP/1.1 (not multiplexed)
- Limited to text (must encode binary as base64)
- Not all browsers support it (mostly modern browsers)

#### Badges

`text/event-stream` `EventSource` `HTTP/2` `one-way stream` `auto-reconnect`

---

### 🟡 Webhooks

**Quote:** _"You give them your phone number. They call you when something happens. No polling, no connection to keep alive — just an HTTP endpoint you expose."_

#### Best For

Cross-service event notifications. Payment confirmations, GitHub push events, form submissions. Any time a 3rd-party needs to notify you asynchronously.

#### Real-World Use

- **Stripe** — payment.success, invoice.created
- **GitHub** — push events, PR reviews
- **Twilio** — SMS delivery confirmations
- **Shopify** — order.created, customer.updated
- **Zapier** — triggers for automations
- **SendGrid** — email bounce/delivery events

#### ✅ Pros

- Zero idle connections
- No polling overhead
- Scales to millions of events easily
- Server-to-server — no browser/client needed
- Cost-effective for provider
- Instant delivery (essentially synchronous from receiver's perspective)

#### ❌ Cons

- Your server must be publicly reachable
- Need to handle retries and exponential backoff
- Must verify HMAC signature (security critical)
- Harder to debug (async, external caller)
- Need idempotency keys for duplicate events
- Requires monitoring and alerting
- Need to implement retry queue

#### Badges

`HTTP POST` `HMAC` `idempotency key` `retry queue` `server-to-server` `push`

---

## 🧠 Webhook vs Polling — The Key Mental Model

| Polling                                                                         | Webhook                                                                                                         |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **YOU** keep asking: "Is it ready? Is it ready? Is it ready?"                   | **THEY** call you when it's ready.                                                                              |
| Like checking your phone every 5 minutes to see if your food order has shipped. | Like giving your phone number so the restaurant texts you when the order ships. You do nothing until they call. |
| Client-driven                                                                   | Server-driven                                                                                                   |

---

## 📊 At-a-Glance Comparison Table

| Aspect              | Short Poll    | Long Poll | WebSocket       | SSE            | Webhook             |
| ------------------- | ------------- | --------- | --------------- | -------------- | ------------------- |
| **Direction**       | C→S, S→C      | C→S, S→C  | **Both ↔**      | S→C only       | S→S                 |
| **Connection**      | New each time | Held open | **Persistent**  | **Persistent** | None                |
| **Latency**         | ⚠️ High       | 🟡 Medium | 🟢 **Very low** | 🟢 Low         | 🟢 **Instant**      |
| **Complexity**      | 🟢 Simple     | 🟡 Medium | 🔴 **High**     | 🟡 Low–Med     | 🟡 Medium           |
| **Scales To**       | 1k users      | 10k users | 100k+ ws        | 100k+          | **Millions**        |
| **Use in Browser?** | ✅ Yes        | ✅ Yes    | ✅ Yes          | ✅ Yes         | ❌ No (server only) |
| **Best For**        | Status checks | Fallback  | Chat/games      | Streaming      | 3rd-party events    |

---

## 🎯 Quick Decision Guide

### Use **Short Polling** if:

- ✅ You need instant prototype/MVP
- ✅ Updates are infrequent (< once per minute)
- ✅ You have < 1k concurrent users
- ✅ You want no infrastructure complexity

### Use **Long Polling** if:

- ✅ WebSockets are blocked by proxies/firewall
- ✅ You need better latency than short polling
- ✅ You're retrofitting an old system
- ✅ You have < 10k concurrent users

### Use **WebSockets** if:

- ✅ You need sub-100ms latency in both directions
- ✅ Users need to send and receive simultaneously
- ✅ You're building chat, games, or collaboration tools
- ✅ You can manage sticky sessions or use pub/sub

### Use **SSE** if:

- ✅ You only need server → client streaming
- ✅ You want simplicity with auto-reconnect
- ✅ You're streaming AI responses, logs, or live updates
- ✅ You want HTTP/2 multiplexing benefits
- ✅ You don't need full-duplex communication

### Use **Webhooks** if:

- ✅ You're integrating with 3rd-party services
- ✅ Events are infrequent but important
- ✅ You want the provider to push to you
- ✅ Your server is publicly reachable
- ✅ You need to scale to millions of events

---

## 🚀 Implementation Tips

### Short Polling

```javascript
setInterval(() => {
  fetch("/api/updates")
    .then((r) => r.json())
    .then((data) => updateUI(data));
}, 5000); // every 5 seconds
```

### Long Polling

```javascript
async function longPoll() {
  try {
    const response = await fetch("/api/updates", { timeout: 30000 });
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("Long poll error:", error);
  }
  longPoll(); // immediately reconnect
}
longPoll();
```

### WebSocket

```javascript
const ws = new WebSocket("wss://your-domain.com/socket");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};
ws.send(JSON.stringify({ action: "subscribe", channel: "updates" }));
```

### SSE

```javascript
const eventSource = new EventSource("/api/stream");
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};
eventSource.onerror = () => {
  eventSource.close(); // reconnect automatically
};
```

### Webhook (Server-side)

```javascript
app.post('/webhooks/payment', (req, res) => {
  // Verify HMAC signature
  const signature = req.headers['x-webhook-signature'];
  const computed = crypto
    .createHmac('sha256', SECRET)
    .update(req.body)
    .digest('hex');

  if (signature !== computed) {
    return res.status(401).send('Unauthorized');
  }

  // Idempotency: check if we've processed this event
  const eventId = req.body.id;
  if (await isProcessed(eventId)) {
    return res.status(200).send('OK'); // idempotent
  }

  // Process the event
  await handlePaymentSuccess(req.body);
  await markAsProcessed(eventId);

  res.status(200).send('OK');
});
```

---

## 📚 Further Reading

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Socket.IO Docs](https://socket.io/docs/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

---

## 📝 License

This reference guide is open source and available for educational use.
