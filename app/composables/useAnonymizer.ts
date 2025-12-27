/**
 * Anonymizer composable using rehydra
 * Provides PII detection, anonymization, and rehydration for browser use
 */
import {
  createAnonymizer,
  InMemoryKeyProvider,
  decryptPIIMap,
  rehydrate,
  type AnonymizationResult,
  type Anonymizer,
} from "rehydra";

interface SessionData {
  encryptedPiiMap: AnonymizationResult["piiMap"];
  stats: {
    totalEntities: number;
    countsByType: Record<string, number>;
  };
}

// Shared state across components
const anonymizerInstance = shallowRef<Anonymizer | null>(null);
const keyProvider = new InMemoryKeyProvider();
const isInitialized = ref(false);
const isInitializing = ref(false);
const initStatus = ref("Not initialized");
const initError = ref<string | null>(null);
const nerEnabled = ref(false);
const nerLoading = ref(false);
const nerLoadProgress = ref("");
const currentSession = ref<SessionData | null>(null);

export function useAnonymizer() {
  async function initialize() {
    if (isInitialized.value || isInitializing.value) return;

    isInitializing.value = true;
    initStatus.value = "Initializing...";
    initError.value = null;

    try {
      // Create anonymizer with regex-only mode initially (no NER download)
      anonymizerInstance.value = createAnonymizer({
        ner: { mode: "disabled" },
        keyProvider,
      });

      await anonymizerInstance.value.initialize();

      isInitialized.value = true;
      initStatus.value = "Ready";
    } catch (err) {
      initError.value =
        err instanceof Error ? err.message : "Failed to initialize";
      initStatus.value = "Error";
      console.error("Anonymizer initialization failed:", err);
    } finally {
      isInitializing.value = false;
    }
  }

  async function setNEREnabled(enabled: boolean) {
    if (enabled === nerEnabled.value) return;
    if (!anonymizerInstance.value) {
      throw new Error("Anonymizer not initialized");
    }

    nerEnabled.value = enabled;

    if (enabled) {
      nerLoading.value = true;
      initStatus.value = "Loading NER model...";
      nerLoadProgress.value = "Preparing...";

      try {
        // Dispose current instance
        await anonymizerInstance.value.dispose();

        // Create new instance with NER enabled
        anonymizerInstance.value = createAnonymizer({
          ner: {
            mode: "quantized",
            autoDownload: true,
            onStatus: (status) => {
              initStatus.value = status;
            },
            onDownloadProgress: (progress) => {
              nerLoadProgress.value = `${progress.file}: ${Math.round(
                progress.percent ?? 0
              )}%`;
            },
          },
          semantic: {
            enabled: true,
            autoDownload: true,
            onStatus: (status) => {
              initStatus.value = status;
            },
          },
          keyProvider,
        });

        await anonymizerInstance.value.initialize();

        nerLoadProgress.value = "";
        initStatus.value = "Ready (NER enabled)";
      } catch (err) {
        // Revert on failure
        nerEnabled.value = false;

        // Check if this is a CORS/network error (common in Firefox with Hugging Face)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load NER model";
        const isCorsOrNetworkError =
          errorMessage.includes("NetworkError") ||
          errorMessage.includes("CORS") ||
          errorMessage.includes("Failed to download");

        if (isCorsOrNetworkError) {
          initError.value =
            "NER model download failed. Please check your connection and try again.";
        } else {
          initError.value = errorMessage;
        }

        initStatus.value = "Error loading NER";
        console.error("NER initialization failed:", err);

        // Try to reinitialize without NER
        try {
          anonymizerInstance.value = createAnonymizer({
            ner: { mode: "disabled" },
            keyProvider,
          });
          await anonymizerInstance.value.initialize();
          initStatus.value = "Ready (NER disabled)";
        } catch {
          initStatus.value = "Error";
        }
      } finally {
        nerLoading.value = false;
      }
    } else {
      // Disable NER - recreate with regex-only
      try {
        await anonymizerInstance.value.dispose();

        anonymizerInstance.value = createAnonymizer({
          ner: { mode: "disabled" },
          keyProvider,
        });

        await anonymizerInstance.value.initialize();
        initStatus.value = "Ready (NER disabled)";
      } catch (err) {
        initError.value =
          err instanceof Error ? err.message : "Failed to disable NER";
        console.error("Failed to disable NER:", err);
      }
    }
  }

  async function anonymize(text: string): Promise<{
    success: boolean;
    anonymizedText?: string;
    entityCount?: number;
    error?: string;
  }> {
    if (!isInitialized.value || !anonymizerInstance.value) {
      return { success: false, error: "Not initialized" };
    }

    try {
      const result = await anonymizerInstance.value.anonymize(text);

      // Store session data for later rehydration
      currentSession.value = {
        encryptedPiiMap: result.piiMap,
        stats: {
          totalEntities: result.stats.totalEntities,
          countsByType: result.stats.countsByType as Record<string, number>,
        },
      };

      return {
        success: true,
        anonymizedText: result.anonymizedText,
        entityCount: result.stats.totalEntities,
      };
    } catch (err) {
      console.error("Anonymization failed:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Anonymization failed",
      };
    }
  }

  async function deanonymize(anonymizedText: string): Promise<{
    success: boolean;
    originalText?: string;
    error?: string;
  }> {
    if (!currentSession.value) {
      return {
        success: false,
        error: "No active session. Please scrub text first.",
      };
    }

    try {
      // Get the encryption key from the key provider
      const encryptionKey = await keyProvider.getKey();

      // Decrypt the PII map
      const piiMap = await decryptPIIMap(
        currentSession.value.encryptedPiiMap,
        encryptionKey
      );

      // Rehydrate the text with original PII values
      const originalText = rehydrate(anonymizedText, piiMap);

      return {
        success: true,
        originalText,
      };
    } catch (err) {
      console.error("Deanonymization failed:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to restore original data",
      };
    }
  }

  function clearSession() {
    currentSession.value = null;
  }

  function hasActiveSession() {
    return currentSession.value !== null;
  }

  function getSessionStats() {
    return currentSession.value?.stats ?? null;
  }

  // Cleanup on unmount
  onUnmounted(async () => {
    // Only dispose if this is the last instance using it
    // In a real app, you might want more sophisticated lifecycle management
  });

  return {
    // State
    isInitialized,
    isInitializing,
    initStatus,
    initError,
    nerEnabled,
    nerLoading,
    nerLoadProgress,

    // Actions
    initialize,
    setNEREnabled,
    anonymize,
    deanonymize,
    clearSession,

    // Session info
    hasActiveSession,
    getSessionStats,
  };
}
