// Client for the chatbot gateway (FastAPI). Streams replies over SSE using
// fetch, because EventSource can't send POST bodies or auth headers.

export const CHATBOT_URL = (
  import.meta.env.VITE_CHATBOT_URL || "http://localhost:8000"
).replace(/\/$/, "");

const BOT = "ecommerce";

function token() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function guestId() {
  return localStorage.getItem("guest_user_id");
}

export function authHeaders() {
  const headers = {};
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const g = guestId();
  if (g) headers["X-Guest-Id"] = g;
  return headers;
}

function newId() {
  return crypto?.randomUUID
    ? crypto.randomUUID()
    : `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** One conversation per signed-in user / guest, kept across page loads. */
export function conversationId(ownerKey, { reset = false } = {}) {
  const key = `shopassist_conversation_${ownerKey || "anon"}`;
  let id = null;
  try {
    id = reset ? null : localStorage.getItem(key);
    if (!id) {
      id = newId();
      localStorage.setItem(key, id);
    }
  } catch {
    id = id || newId();
  }
  return id;
}

async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function fetchWelcome(page) {
  const params = new URLSearchParams();
  if (page?.product_id) params.set("product_id", page.product_id);
  if (page?.name) params.set("product_name", page.name);
  const res = await fetch(`${CHATBOT_URL}/api/chat/${BOT}/welcome?${params}`, {
    headers: authHeaders(),
  });
  return json(res);
}

export async function fetchHistory(convId) {
  const res = await fetch(`${CHATBOT_URL}/api/chat/${BOT}/history/${convId}`, {
    headers: authHeaders(),
  });
  return (await json(res)).messages || [];
}

/**
 * Parse an SSE response body and call onEvent(type, data) for each event.
 */
async function readSSE(res, onEvent, signal) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.detail || `Chat request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    if (signal?.aborted) {
      reader.cancel();
      return;
    }
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    // Events are separated by a blank line (\n\n or \r\n\r\n).
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep).replace(/^\r?\n\r?\n/, "");
      let type = "message";
      const data = [];
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith("event:")) type = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
      }
      if (!data.length) continue;
      try {
        onEvent(type, JSON.parse(data.join("\n")));
      } catch {
        /* ignore keep-alives / malformed chunks */
      }
    }
  }
}

export async function streamChat({ message, conversationId: convId, page, onEvent, signal }) {
  const res = await fetch(`${CHATBOT_URL}/api/chat/${BOT}/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ message, conversation_id: convId, page: page || null }),
    signal,
  });
  await readSSE(res, onEvent, signal);
}

export async function streamConfirm({ conversationId: convId, approved, onEvent, signal }) {
  const res = await fetch(`${CHATBOT_URL}/api/chat/${BOT}/confirm?stream=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ conversation_id: convId, approved }),
    signal,
  });
  await readSSE(res, onEvent, signal);
}

export async function sendImage({ file, message, conversationId: convId }) {
  const form = new FormData();
  form.append("image", file);
  form.append("message", message || "");
  form.append("conversation_id", convId);
  const res = await fetch(`${CHATBOT_URL}/api/chat/${BOT}/image`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  return json(res);
}

// --- checkout hand-off: the chat collects details, the checkout page uses them ---
const PREFILL_KEY = "shopassist_checkout_prefill";

export function saveCheckoutPrefill(prefill) {
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ ...prefill, saved_at: Date.now() }));
  } catch {
    /* storage unavailable: checkout simply starts empty */
  }
}

export function takeCheckoutPrefill() {
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    sessionStorage.removeItem(PREFILL_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Only honour a hand-off from the last 30 minutes.
    return Date.now() - (data.saved_at || 0) < 30 * 60 * 1000 ? data : null;
  } catch {
    return null;
  }
}
