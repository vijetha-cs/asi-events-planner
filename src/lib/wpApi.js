const configuredBase = import.meta.env.VITE_WP_API_URL?.trim();

export const isWordPressConfigured = Boolean(configuredBase);
const API_BASE = configuredBase?.replace(/\/+$/, "");

async function request(path, { nonce, ...options } = {}) {
  if (!API_BASE) throw new Error("WordPress API URL is not configured.");

  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  if (nonce) headers.set("X-WP-Nonce", nonce);

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `WordPress request failed (${response.status}).`);
  }
  return body;
}

export function getWordPressSession() {
  return request("/session");
}

export function getWordPressEvents() {
  return request("/events");
}

export function getMyWordPressRegistrations(nonce) {
  return request("/my-registrations", { nonce });
}

export function saveWordPressEvent(event, nonce) {
  const path = event.id ? `/events/${encodeURIComponent(event.id)}` : "/events";
  return request(path, {
    method: "POST",
    nonce,
    body: JSON.stringify(event),
  });
}

export function deleteWordPressEvent(id, nonce) {
  return request(`/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    nonce,
  });
}

export function setWordPressRegistration(eventId, shouldRegister, nonce) {
  return request(
    `/events/${encodeURIComponent(eventId)}/${shouldRegister ? "register" : "cancel"}`,
    { method: "POST", nonce, body: "{}" },
  );
}
