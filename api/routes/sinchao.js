const ALLOWED_ORIGINS = [
  "https://yourdomain.com",
  "https://sub.yourdomain.com"
];

function getCORSHeaders(origin) {
  if (1 || ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400" // cache preflight for 24h
    };
  }
  return {}; // Origin không hợp lệ => không set header
}

export async function onRequest(context) {
  const request = context.request;
  const origin = request.headers.get("Origin");

  // Nếu là preflight OPTIONS
  if (request.method === "OPTIONS") {
    const headers = getCORSHeaders(origin);
    if (Object.keys(headers).length === 0) {
      return new Response(null, { status: 403 }); // Forbidden nếu Origin không được phép
    }
    return new Response(null, {
      status: 204,
      headers: {
        ...headers
      }
    });
  }

  // Xử lý request bình thường
  const data = { message: "Hello from Cloudflare Pages API" };

  const headers = getCORSHeaders(origin);
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
