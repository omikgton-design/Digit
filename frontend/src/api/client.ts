let csrfToken = "";

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

function syncCsrfTokenFromCookie() {
  const cookieToken = getCookie("csrftoken");
  if (cookieToken) {
    csrfToken = cookieToken;
  }
}

function normalizeAssetUrl(value: string) {
  if (typeof window === "undefined") {
    return value;
  }

  try {
    const parsed = new URL(value);
    const isLocalBackend = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    const isServedAsset = parsed.pathname.startsWith("/media/") || parsed.pathname.startsWith("/static/");
    if (isLocalBackend && isServedAsset) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}

function normalizeApiAssets<T>(payload: T): T {
  if (typeof payload === "string") {
    return normalizeAssetUrl(payload) as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeApiAssets(item)) as T;
  }

  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, normalizeApiAssets(value)])
    ) as T;
  }

  return payload;
}

async function initCsrf() {
  syncCsrfTokenFromCookie();
  if (csrfToken) {
    return;
  }

  const response = await fetch("/api/csrf/", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("CSRF token авч чадсангүй.");
  }

  const data = (await response.json()) as { csrfToken?: string };
  csrfToken = data.csrfToken || "";
  syncCsrfTokenFromCookie();
}

export async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const needsCsrf = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  if (needsCsrf) {
    await initCsrf();
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (needsCsrf && csrfToken) {
    headers.set("X-CSRFToken", csrfToken);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  syncCsrfTokenFromCookie();

  if (!response.ok) {
    let message = `Алдаа (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return normalizeApiAssets((await response.json()) as T);
}
