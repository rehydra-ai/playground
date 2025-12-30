<script setup lang="ts">
// Set page meta
useHead({
  title: 'Privacy Policy - rehydra.ai'
})

useSeoMeta({
  title: 'Privacy Policy - rehydra.ai',
  description: 'Privacy policy for rehydra.ai and the Rehydra browser extension.'
})

// Window dragging
const windowRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const windowPos = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })
const isMaximized = ref(false)
const savedPos = ref({ x: 0, y: 0 })

// Mobile detection
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isMaximized.value = true
  }
}

function toggleMaximize() {
  if (isMobile.value) {
    isMaximized.value = true
    return
  }

  if (isMaximized.value) {
    windowPos.value = { ...savedPos.value }
    isMaximized.value = false
  } else {
    savedPos.value = { ...windowPos.value }
    windowPos.value = { x: 0, y: 0 }
    isMaximized.value = true
  }
}

function startDrag(e: MouseEvent) {
  if (e.button !== 0) return
  if (isMaximized.value) return

  isDragging.value = true
  dragStart.value = {
    x: e.clientX - windowPos.value.x,
    y: e.clientY - windowPos.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return

  windowPos.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Clock for taskbar
const currentTime = ref('')

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Context menu
const contextMenuOpen = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })

function showContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  contextMenuOpen.value = true
}

function closeContextMenu() {
  contextMenuOpen.value = false
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  document.addEventListener('click', closeContextMenu)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('click', closeContextMenu)
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div
    class="h-screen font-mono text-[11px] overflow-hidden flex flex-col"
    style="background: linear-gradient(180deg, #5a8cc2 0%, #3a6ea5 50%, #2d5a8a 100%)"
  >
    <!-- Desktop area -->
    <div
      class="flex-1 flex items-start justify-center p-4 md:p-8 pt-8 md:pt-12 pb-16 overflow-auto relative"
      @contextmenu="showContextMenu"
    >
      <!-- Desktop Icons -->
      <div class="absolute top-4 left-4 flex flex-col gap-4">
        <!-- rehydra.ai Icon -->
        <div class="desktop-icon" @dblclick="navigateTo('/')" @click="isMobile && navigateTo('/')">
          <RehydraIconPixel :size="48" />
          <span class="desktop-icon-label">rehydra</span>
        </div>

        <!-- About.txt Icon -->
        <div class="desktop-icon" @dblclick="navigateTo('/?openAbout=true')" @click="isMobile && navigateTo('/?openAbout=true')">
          <div class="desktop-icon-image">
            <svg viewBox="0 0 24 24" fill="none" class="w-10 h-10">
              <!-- Paper/document shape -->
              <path d="M6 2h8l6 6v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#fff" stroke="#808080"
                stroke-width="1" />
              <!-- Folded corner -->
              <path d="M14 2v6h6" fill="#e0e0e0" stroke="#808080" stroke-width="1" />
              <!-- Text lines -->
              <line x1="7" y1="12" x2="17" y2="12" stroke="#000" stroke-width="1" />
              <line x1="7" y1="15" x2="17" y2="15" stroke="#000" stroke-width="1" />
              <line x1="7" y1="18" x2="13" y2="18" stroke="#000" stroke-width="1" />
            </svg>
          </div>
          <span class="desktop-icon-label">About.txt</span>
        </div>
      </div>

      <!-- Privacy Policy Window -->
      <div
        ref="windowRef"
        class="win-frame w-full"
        :class="{ 'win-maximized': isMaximized, 'max-w-4xl': !isMaximized }"
        :style="{
          ...(isMaximized ? {} : { transform: `translate(${windowPos.x}px, ${windowPos.y}px)` }),
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: 30
        }"
      >
        <!-- Title bar -->
        <div
          class="win-titlebar select-none"
          :class="{
            'cursor-grabbing': isDragging,
            'cursor-grab': !isDragging && !isMaximized,
            'cursor-default': isMaximized
          }"
          @mousedown="startDrag"
          @dblclick="toggleMaximize"
        >
          <div class="flex items-center gap-2 pointer-events-none">
            <svg viewBox="0 0 16 16" class="w-4 h-4">
              <rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#808080" />
              <line x1="3" y1="4" x2="13" y2="4" stroke="#000080" stroke-width="1" />
              <line x1="3" y1="6" x2="13" y2="6" stroke="#000080" stroke-width="1" />
              <line x1="3" y1="8" x2="10" y2="8" stroke="#000080" stroke-width="1" />
            </svg>
            <span>Privacy Policy - Notepad</span>
          </div>
          <div class="flex gap-0.5 pointer-events-auto">
            <NuxtLink to="/" class="win-title-btn" title="Close">✕</NuxtLink>
          </div>
        </div>

        <!-- Menu bar -->
        <div class="win-menubar flex gap-0">
          <span class="win-menu-item cursor-default"><u>F</u>ile</span>
          <span class="win-menu-item cursor-default"><u>E</u>dit</span>
          <span class="win-menu-item cursor-default">F<u>o</u>rmat</span>
          <span class="win-menu-item cursor-default"><u>V</u>iew</span>
          <span class="win-menu-item cursor-default"><u>H</u>elp</span>
        </div>

        <!-- Notepad content -->
        <div class="bg-[#c0c0c0] p-1 privacy-content-wrapper">
          <div class="win-inset">
            <div
              class="bg-white p-4 md:p-6 overflow-y-auto text-black leading-relaxed privacy-content-scroll"
              :class="{ 'h-[calc(100vh-140px)]': !isMobile }"
            >
              <!-- Privacy Policy Content -->
              <article class="privacy-policy">
                <h1>Privacy Policy</h1>

                <h3>1. Who we are</h3>
                <p>
                  This website is operated by ascenue GmbH, registered at Christaweg 42, 79114 Freiburg.
                  We determine how and why your personal data are processed and are therefore the "data controller"
                  under the EU General Data Protection Regulation (GDPR).
                </p>
                <p><strong>Contact:</strong> info@ascenue.com</p>

                <h3>2. What data we collect</h3>
                <ol>
                  <li>
                    <strong>Contact form submissions</strong> – When you send us a message, we receive your name,
                    email address, and anything you write in the message box. We use this information solely to
                    answer your enquiry or continue the conversation. The legal basis is contractual necessity
                    (Art. 6 (1)(b) GDPR).
                  </li>
                  <li>
                    <strong>Automatic server logs</strong> – Our servers may record your IP address, browser type,
                    date and time of visit, and the pages you view. We rely on these logs to maintain site security
                    and diagnose errors. The legal basis is our legitimate interest in keeping the site safe and
                    functioning (Art. 6 (1)(f) GDPR).
                  </li>
                  <li>
                    <strong>Essential cookies only</strong> – We use only small "necessary" cookies that store a
                    unique session ID so the site can remember page navigation, form state, and other core functions.
                    We do <strong>not</strong> use analytics, marketing, or profiling cookies of any kind.
                  </li>
                </ol>

                <h3>3. No analytics or marketing cookies</h3>
                <p>
                  We do not use Google Analytics, Facebook Pixel, or any other tracking or profiling technology.
                  We set only essential cookies needed for the site to function; these do not analyse or advertise
                  to visitors.
                </p>

                <h3>4. How we share data</h3>
                <ul>
                  <li>
                    <strong>Infrastructure:</strong> Personal data are stored on servers located in the EU/EEA or
                    a country with an adequacy decision.
                  </li>
                  <li>We do not sell or rent your information and disclose it only if required by law.</li>
                </ul>

                <h3>5. Retention</h3>
                <ul>
                  <li>Contact form messages are kept for 12 months to follow up on enquiries, then securely deleted.</li>
                  <li>Server logs rotate automatically after 30 days.</li>
                </ul>

                <h3>6. Your rights</h3>
                <p>
                  Under GDPR you may, at any time, request: access to your data, correction, deletion,
                  restriction of processing, data portability, or to object to processing. Email info@ascenue.com.
                  You also have the right to lodge a complaint with your local supervisory authority.
                </p>

                <h3>7. Security</h3>
                <p>
                  We use HTTPS encryption and implement appropriate technical and organisational measures to
                  protect your information.
                </p>

                <h3>8. Rehydra Browser Extension</h3>
                <p>
                  If you use our Rehydra browser extension for privacy-preserving AI interactions, the following applies:
                </p>

                <h4>8.1 What data the extension processes</h4>
                <p>
                  The extension detects and anonymises personally identifiable information (PII) in text you submit
                  to ChatGPT. This includes names, email addresses, phone numbers, addresses, and other personal
                  identifiers. <strong>All processing happens locally in your browser</strong>—your original PII
                  is never transmitted to ascenue servers.
                </p>

                <h4>8.2 Local data storage</h4>
                <p>The extension stores:</p>
                <ul>
                  <li>
                    <strong>Encrypted PII mappings</strong> – A reversible mapping between anonymised placeholders
                    and your original data, encrypted using AES-256 with a key generated and stored locally on your
                    device. Stored in your browser's IndexedDB.
                  </li>
                  <li>
                    <strong>Extension settings</strong> – Your preferences (enabled/disabled state, detection mode,
                    debug logging) stored in your browser's local storage.
                  </li>
                  <li>
                    <strong>Encryption key</strong> – A randomly generated 256-bit key stored in your browser's
                    local storage, never transmitted externally.
                  </li>
                </ul>
                <p>This data remains on your device and is not accessible to ascenue or any third party.</p>

                <h4>8.3 Network requests</h4>
                <p>The extension may make the following network requests:</p>
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Purpose</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>huggingface.co / cdn-lfs.hf.co</td>
                        <td>Download AI model files (~280 MB) for enhanced PII detection</td>
                        <td>Only if you enable "Full NER" mode; one-time download cached locally</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>The extension does <strong>not</strong> contact ascenue servers or any analytics/tracking services.</p>

                <h4>8.4 Permissions</h4>
                <p>The extension requests:</p>
                <ul>
                  <li><strong>Storage</strong> – To save your settings and encrypted PII mappings locally</li>
                  <li>
                    <strong>Host permissions for Hugging Face</strong> – To download AI model files when Full NER
                    mode is enabled
                  </li>
                </ul>

                <h4>8.5 Data retention</h4>
                <ul>
                  <li>
                    PII mappings persist in your browser until you clear browser data or uninstall the extension.
                  </li>
                  <li>
                    You can clear all extension data at any time via your browser's extension settings or by
                    uninstalling the extension.
                  </li>
                </ul>

                <h4>8.6 No remote collection</h4>
                <p>We do <strong>not</strong> collect, transmit, or have access to:</p>
                <ul>
                  <li>Your original (un-anonymised) text</li>
                  <li>Your PII mappings or encryption keys</li>
                  <li>Your ChatGPT conversations</li>
                  <li>Any usage analytics or telemetry</li>
                </ul>

                <h4>8.7 Third-party services</h4>
                <ul>
                  <li>
                    <strong>OpenAI (ChatGPT)</strong> – The extension modifies text before it reaches ChatGPT.
                    We do not interact with the internal chatgpt.com API. Rehydra is not affiliated with ChatGPT
                    or OpenAI. Your anonymised text is subject to
                    <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener">OpenAI's privacy policy</a>.
                  </li>
                  <li>
                    <strong>Hugging Face</strong> – If you enable Full NER mode, model files are downloaded from
                    Hugging Face infrastructure, subject to
                    <a href="https://huggingface.co/privacy" target="_blank" rel="noopener">Hugging Face's privacy policy</a>.
                  </li>
                </ul>

                <h3>9. Changes to this policy</h3>
                <p>
                  If we add new features or legal requirements change, we'll update this page and note the revision date.
                </p>

                <div class="back-link">
                  <NuxtLink to="/" class="win-btn">
                    ← Back to rehydra.ai
                  </NuxtLink>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Status bar -->
        <div class="win-statusbar flex justify-between">
          <span class="win-status-field flex-1">Ln 1, Col 1</span>
          <span class="win-status-field">UTF-8</span>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenuOpen"
      class="context-menu"
      :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
      @click.stop
    >
      <NuxtLink to="/" class="context-menu-item" @click="contextMenuOpen = false">
        <span>🏠</span>
        <span>Go to Home</span>
      </NuxtLink>
      <div class="context-menu-separator" />
      <div class="context-menu-item disabled">
        <span>🔄</span>
        <span>Refresh</span>
      </div>
    </div>

    <!-- Windows Taskbar -->
    <div class="taskbar">
      <!-- Start button -->
      <NuxtLink to="/" class="start-btn">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" fill="#f25022" />
          <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
          <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
          <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
        </svg>
        <span class="font-bold text-black">Start</span>
      </NuxtLink>

      <!-- Quick launch divider -->
      <div class="taskbar-divider" />

      <!-- Active window button -->
      <button class="taskbar-window-btn active">
        <svg viewBox="0 0 16 16" class="w-3 h-3">
          <rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#808080" />
          <line x1="3" y1="4" x2="13" y2="4" stroke="#000080" stroke-width="1" />
          <line x1="3" y1="6" x2="13" y2="6" stroke="#000080" stroke-width="1" />
        </svg>
        <span class="truncate">Privacy Policy - Notepad</span>
      </button>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- System tray -->
      <div class="system-tray">
        <div class="tray-icons">
          <span class="tray-icon">🔊</span>
          <span class="tray-icon">🔌</span>
        </div>
        <div class="taskbar-divider" />
        <div class="clock">
          {{ currentTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Privacy policy content styling */
.privacy-policy {
  font-family: 'IBM Plex Mono', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #000;
}

.privacy-policy h1 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid #000080;
  color: #000080;
}

.privacy-policy h3 {
  font-size: 14px;
  font-weight: bold;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #000080;
}

.privacy-policy h4 {
  font-size: 12px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #404040;
}

.privacy-policy p {
  margin-bottom: 12px;
}

.privacy-policy ul,
.privacy-policy ol {
  margin-bottom: 12px;
  padding-left: 24px;
}

.privacy-policy li {
  margin-bottom: 8px;
}

.privacy-policy ol {
  list-style-type: decimal;
}

.privacy-policy ul {
  list-style-type: disc;
}

.privacy-policy a {
  color: #000080;
  text-decoration: underline;
}

.privacy-policy a:hover {
  color: #1084d0;
}

.privacy-policy strong {
  font-weight: bold;
}

/* Table styling */
.table-container {
  overflow-x: auto;
  margin: 12px 0;
}

.privacy-policy table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  background: #fff;
}

.privacy-policy th,
.privacy-policy td {
  border: 1px solid #808080;
  padding: 6px 8px;
  text-align: left;
}

.privacy-policy th {
  background: #c0c0c0;
  font-weight: bold;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
}

.privacy-policy td {
  background: #fff;
}

.back-link {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #c0c0c0;
}

/* Content wrapper for proper scrolling */
.privacy-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.privacy-content-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .privacy-policy {
    font-size: 11px;
  }

  .privacy-policy h1 {
    font-size: 16px;
  }

  .privacy-policy h3 {
    font-size: 13px;
  }

  .privacy-policy h4 {
    font-size: 11px;
  }

  .privacy-content-scroll {
    height: calc(100vh - 140px) !important;
  }

  .taskbar-window-btn span.truncate {
    display: none;
  }
}
</style>

