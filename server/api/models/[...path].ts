/**
 * Proxy server route for Hugging Face model downloads
 * Bypasses CORS restrictions in Firefox/Safari by fetching models server-side
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, "path");

  if (!path) {
    throw createError({
      statusCode: 400,
      message: "Path parameter is required",
    });
  }

  // Reconstruct the Hugging Face URL
  const hfUrl = `https://cas-bridge.xethub.hf.co/${path}`;

  // Get query parameters from the original request
  const query = getQuery(event);
  const queryString = new URLSearchParams(
    query as Record<string, string>
  ).toString();
  const fullUrl = queryString ? `${hfUrl}?${queryString}` : hfUrl;

  try {
    // Handle OPTIONS preflight
    if (event.method === "OPTIONS") {
      setHeader(event, "Access-Control-Allow-Origin", "*");
      setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
      setHeader(event, "Access-Control-Allow-Headers", "Range, Content-Type");
      setHeader(event, "Access-Control-Max-Age", "86400");
      return null;
    }

    // Check for range request (partial download)
    const range = getHeader(event, "range");

    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    };

    if (range) {
      fetchHeaders["Range"] = range;
    }

    // Fetch from Hugging Face
    const response = await fetch(fullUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 206) {
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch model: ${response.statusText}`,
      });
    }

    // Get headers from the response
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");

    // Set response headers
    setHeader(event, "Content-Type", contentType);
    setHeader(event, "Access-Control-Allow-Origin", "*");
    setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
    setHeader(event, "Access-Control-Allow-Headers", "Range, Content-Type");
    setHeader(event, "Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

    if (contentLength) {
      setHeader(event, "Content-Length", contentLength);
    }
    if (acceptRanges) {
      setHeader(event, "Accept-Ranges", acceptRanges);
    }
    if (contentRange) {
      setHeader(event, "Content-Range", contentRange);
    }

    // Set status for partial content
    if (response.status === 206) {
      setResponseStatus(event, 206);
    }

    // Stream the response body
    return response.body;
  } catch (error) {
    console.error("Model proxy error:", error);

    // If it's already a createError, rethrow
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: `Failed to proxy model download: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
});

