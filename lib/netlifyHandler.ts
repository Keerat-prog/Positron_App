const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function createNetlifyPostHandler<T = any>(
  fn: (body: T) => Promise<unknown>
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      const body = (await req.json().catch(() => ({}))) as T;
      const result = await fn(body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    } catch (error: any) {
      const status = typeof error?.statusCode === "number" ? error.statusCode : 500;
      return new Response(
        JSON.stringify({ error: error?.message || "Failed to process request." }),
        {
          status,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }
  };
}
