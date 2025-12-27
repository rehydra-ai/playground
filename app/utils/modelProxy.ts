/**
 * Intercepts fetch requests to Hugging Face model URLs and redirects them
 * through our server proxy to bypass CORS restrictions in Firefox/Safari
 */

let isProxySetup = false;

function installProxy() {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Only setup once
  if (isProxySetup) return;
  isProxySetup = true;

  // Store original fetch
  const originalFetch = window.fetch.bind(window);

  // Override fetch to intercept Hugging Face requests
  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    let url: string;

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      // Fallback for unexpected types
      return originalFetch(input, init);
    }

    // Check if this is a Hugging Face XetHub request (model downloads)
    if (url.includes("cas-bridge.xethub.hf.co")) {
      try {
        // Extract the path and query parameters
        const urlObj = new URL(url);
        const path = urlObj.pathname.substring(1); // Remove leading /
        const queryString = urlObj.search.substring(1); // Remove leading ?

        // Redirect to our proxy
        const proxyUrl = `/api/models/${path}${queryString ? `?${queryString}` : ""}`;

        console.log("[ModelProxy] Proxying XetHub request:", url.substring(0, 80) + "...");

        // Call original fetch with proxied URL
        return originalFetch(proxyUrl, init);
      } catch (error) {
        console.error("[ModelProxy] Failed to proxy request:", error);
        // Fall back to original request
        return originalFetch(input, init);
      }
    }

    // Also proxy huggingface.co CDN requests - these redirect to cas-bridge which has CORS issues
    // By proxying the initial request, we follow redirects server-side
    if (url.includes("huggingface.co") && url.includes("/resolve/")) {
      try {
        // Encode the full URL as a query param for our proxy
        const proxyUrl = `/api/hf-proxy?url=${encodeURIComponent(url)}`;

        console.log("[ModelProxy] Proxying HuggingFace CDN request:", url.substring(0, 80) + "...");

        // Call original fetch with proxied URL
        return originalFetch(proxyUrl, init);
      } catch (error) {
        console.error("[ModelProxy] Failed to proxy HF request:", error);
        // Fall back to original request
        return originalFetch(input, init);
      }
    }

    // For all other requests, use original fetch
    return originalFetch(input, init);
  };

  console.log("[ModelProxy] Fetch proxy installed for Hugging Face model downloads");
}

// Auto-install proxy when module is imported (in browser)
if (typeof window !== "undefined") {
  installProxy();
}

// Also export for manual setup if needed
export function setupModelProxy() {
  installProxy();
}

