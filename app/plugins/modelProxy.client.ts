/**
 * Nuxt plugin to install the model proxy as early as possible
 * The .client suffix ensures this only runs in the browser
 */
import { setupModelProxy } from "~/utils/modelProxy";

export default defineNuxtPlugin(() => {
  // Install the fetch proxy immediately
  setupModelProxy();
});

