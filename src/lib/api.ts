const rawApiBase =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";

const normalizedApiBase = rawApiBase.replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  if (!normalizedApiBase) return path;
  return `${normalizedApiBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetchJson<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      const errObj = await res.json().catch(() => ({}));
      throw new Error(errObj?.error || `Request failed (${res.status}).`);
    }
    if (res.status === 404) {
      throw new Error(
        "The conversation backend endpoint (/api) is not active on this host yet. Redeploy with Netlify Functions & GEMINI_API_KEY configured."
      );
    }
    throw new Error(`Backend service returned status ${res.status}. Please try again.`);
  }

  if (!isJson) {
    throw new Error(
      "The conversation endpoint returned an unexpected HTML page instead of JSON. Ensure Netlify Functions and GEMINI_API_KEY are deployed."
    );
  }

  return (await res.json()) as T;
}
