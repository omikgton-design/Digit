const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "H3", "H4", "A"]);
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeRichText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function safeText(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function sanitizeNode(node: Node, documentRef: Document): Node | null {
  if (node.nodeType === TEXT_NODE) {
    return documentRef.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== ELEMENT_NODE) return null;

  const element = node as HTMLElement;
  if (!ALLOWED_TAGS.has(element.tagName)) {
    const fragment = documentRef.createDocumentFragment();
    Array.from(element.childNodes).forEach((child) => {
      const sanitizedChild = sanitizeNode(child, documentRef);
      if (sanitizedChild) fragment.appendChild(sanitizedChild);
    });
    return fragment;
  }

  const cleanElement = documentRef.createElement(element.tagName.toLowerCase());
  if (element.tagName === "A") {
    const href = element.getAttribute("href") || "";
    if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) {
      cleanElement.setAttribute("href", href);
      cleanElement.setAttribute("target", "_blank");
      cleanElement.setAttribute("rel", "noreferrer");
    }
  }

  Array.from(element.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeNode(child, documentRef);
    if (sanitizedChild) cleanElement.appendChild(sanitizedChild);
  });
  return cleanElement;
}

export function sanitizeRichText(value: unknown) {
  const text = normalizeRichText(value);
  if (!text.trim()) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  try {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(text, "text/html");
    const cleanDocument = document.implementation.createHTMLDocument("");
    const fragment = cleanDocument.createDocumentFragment();

    Array.from(parsed.body.childNodes).forEach((child) => {
      const sanitizedChild = sanitizeNode(child, cleanDocument);
      if (sanitizedChild) fragment.appendChild(sanitizedChild);
    });

    const container = cleanDocument.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  } catch {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }
}

export function stripRichText(value: unknown) {
  const text = normalizeRichText(value);
  if (!text.trim()) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  try {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(text, "text/html");
    return (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}
