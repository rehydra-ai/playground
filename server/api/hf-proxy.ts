/**
 * Proxy for Hugging Face CDN requests
 * Follows redirects server-side to bypass CORS issues with cas-bridge.xethub.hf.co
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUrl = query.url as string;

  if (!targetUrl) {
    throw createError({
      statusCode: 400,
      message: "URL parameter is required",
    });
  }

  // Validate the URL is from huggingface.co
  if (!targetUrl.includes("huggingface.co")) {
    throw createError({
      statusCode: 400,
      message: "Only huggingface.co URLs are allowed",
    });
  }

  try {
    // Handle OPTIONS preflight
    if (event.method === "OPTIONS") {
      setHeader(event, "Access-Control-Allow-Origin", "*");
      setHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
      setHeader(event, "Access-Control-Allow-Headers", "Range, Content-Type");
      setHeader(event, "Access-Control-Max-Age", 86400);
      return null;
    }

    // Check for range request
    const range = getHeader(event, "range");

    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    };

    if (range) {
      fetchHeaders["Range"] = range;
    }

    // Fetch from Hugging Face - this will follow redirects to cas-bridge automatically
    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
      // Follow redirects - this is the key!
      redirect: "follow",
    });

    if (!response.ok && response.status !== 206) {
      console.error("[HF-Proxy] Failed:", response.status, response.statusText);
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch from HuggingFace: ${response.statusText}`,
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
    setHeader(
      event,
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Accept-Ranges"
    );

    if (contentLength) {
      setHeader(event, "Content-Length", parseInt(contentLength));
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
    console.error("[HF-Proxy] Error:", error);

    // If it's already a createError, rethrow
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: `Failed to proxy HuggingFace request: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
});
