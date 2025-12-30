<script setup lang="ts">
const {
  isInitialized,
  isInitializing,
  initStatus,
  initError,
  initialize,
  anonymize,
  deanonymize,
  clearSession,
  getSessionStats,
  nerEnabled,
  nerLoading,
  nerLoadProgress,
  setNEREnabled
} = useAnonymizer()

// Current step in the workflow
const currentStep = ref<'input' | 'anonymized' | 'response'>('input')

// Window dragging
const windowRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const windowPos = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

// Window minimize
const isMinimized = ref(false)

// Window closed
const isClosed = ref(false)

// Window maximized
const isMaximized = ref(false)
const savedPos = ref({ x: 0, y: 0 })

// Mobile detection
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  // Auto-maximize on mobile
  if (isMobile.value) {
    isMaximized.value = true
  }
}

// Window focus management
const focusedWindow = ref<'main' | 'about'>('main')

function focusMainWindow() {
  focusedWindow.value = 'main'
}

function focusAboutWindow() {
  focusedWindow.value = 'about'
}

function minimizeWindow() {
  isMinimized.value = true
}

function restoreWindow() {
  isMinimized.value = false
  isClosed.value = false
  // Auto-maximize on mobile
  if (isMobile.value) {
    isMaximized.value = true
  }
}

function toggleWindow() {
  if (isClosed.value) {
    isClosed.value = false
    isMinimized.value = false
  } else {
    isMinimized.value = !isMinimized.value
  }
}

function closeWindow() {
  isClosed.value = true
  isMinimized.value = false
}

function openWindow() {
  isClosed.value = false
  isMinimized.value = false
  // Auto-maximize on mobile
  if (isMobile.value) {
    isMaximized.value = true
  }
  focusMainWindow()
}

function toggleMaximize() {
  // On mobile, always stay maximized
  if (isMobile.value) {
    isMaximized.value = true
    return
  }

  if (isMaximized.value) {
    // Restore to saved position
    windowPos.value = { ...savedPos.value }
    isMaximized.value = false
  } else {
    // Save current position and maximize
    savedPos.value = { ...windowPos.value }
    windowPos.value = { x: 0, y: 0 }
    isMaximized.value = true
  }
}

function startDrag(e: MouseEvent) {
  // Only start drag on left mouse button
  if (e.button !== 0) return

  // Don't allow dragging when maximized
  if (isMaximized.value) return

  isDragging.value = true
  dragStart.value = {
    x: e.clientX - windowPos.value.x,
    y: e.clientY - windowPos.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  // Prevent text selection during drag
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

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', onAboutDrag)
  document.removeEventListener('mouseup', stopAboutDrag)
})

// Text inputs
const inputText = ref('')
const anonymizedText = ref('')
const chatGptResponse = ref('')
const deanonymizedText = ref('')

// Processing states
const isAnonymizing = ref(false)
const isDeanonymizing = ref(false)

// Error state
const error = ref<string | null>(null)

// Toast for copy feedback
const toast = useToast()

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

// Start menu
const startMenuOpen = ref(false)
const startMenuRef = ref<HTMLElement | null>(null)
const startBtnRef = ref<HTMLElement | null>(null)

function toggleStartMenu() {
  startMenuOpen.value = !startMenuOpen.value
}

function closeStartMenu(e: MouseEvent) {
  if (
    startMenuOpen.value
    && startMenuRef.value
    && startBtnRef.value
    && !startMenuRef.value.contains(e.target as Node)
    && !startBtnRef.value.contains(e.target as Node)
  ) {
    startMenuOpen.value = false
  }
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

// Background selector
const backgroundDialogOpen = ref(false)
const currentBackground = ref('default')
const selectedBackground = ref('default')

// About dialog
const aboutDialogOpen = ref(false)
const aboutDialogPos = ref({ x: 0, y: 0 })
const aboutDragStart = ref({ x: 0, y: 0 })
const isAboutDragging = ref(false)

function openAboutDialog() {
  aboutDialogOpen.value = true
  // Position offset from center so it doesn't overlap main window
  aboutDialogPos.value = { x: 100, y: 50 }
  focusAboutWindow()
}

function closeAboutDialog() {
  aboutDialogOpen.value = false
}

function startAboutDrag(e: MouseEvent) {
  if (e.button !== 0) return
  isAboutDragging.value = true
  aboutDragStart.value = {
    x: e.clientX - aboutDialogPos.value.x,
    y: e.clientY - aboutDialogPos.value.y
  }
  document.addEventListener('mousemove', onAboutDrag)
  document.addEventListener('mouseup', stopAboutDrag)
  e.preventDefault()
}

function onAboutDrag(e: MouseEvent) {
  if (!isAboutDragging.value) return
  aboutDialogPos.value = {
    x: e.clientX - aboutDragStart.value.x,
    y: e.clientY - aboutDragStart.value.y
  }
}

function stopAboutDrag() {
  isAboutDragging.value = false
  document.removeEventListener('mousemove', onAboutDrag)
  document.removeEventListener('mouseup', stopAboutDrag)
}

const backgrounds = [
  { id: 'default', name: 'Default (Gradient)', preview: '', type: 'gradient' },
  { id: 'bliss', name: 'Bliss', preview: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', type: 'image' },
  { id: 'mountains', name: 'Mountains', preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', type: 'image' },
  { id: 'ocean', name: 'Ocean', preview: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80', type: 'image' },
  { id: 'forest', name: 'Forest', preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', type: 'image' },
  { id: 'sunset', name: 'Sunset', preview: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80', type: 'image' },
  { id: 'stars', name: 'Starry Night', preview: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', type: 'image' },
  { id: 'aurora', name: 'Aurora', preview: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', type: 'image' },
  { id: 'desert', name: 'Desert', preview: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=200&h=150&fit=crop', full: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80', type: 'image' }
]

function openBackgroundDialog() {
  contextMenuOpen.value = false
  selectedBackground.value = currentBackground.value
  backgroundDialogOpen.value = true
}

function applyBackground() {
  currentBackground.value = selectedBackground.value
  backgroundDialogOpen.value = false
}

function cancelBackgroundDialog() {
  selectedBackground.value = currentBackground.value
  backgroundDialogOpen.value = false
}

const backgroundStyle = computed(() => {
  if (currentBackground.value === 'default') {
    return { background: 'linear-gradient(180deg, #5a8cc2 0%, #3a6ea5 50%, #2d5a8a 100%)' }
  }
  const bg = backgrounds.find(b => b.id === currentBackground.value)
  if (bg && bg.type === 'image') {
    return {
      backgroundImage: `url(${bg.full})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return { background: 'linear-gradient(180deg, #5a8cc2 0%, #3a6ea5 50%, #2d5a8a 100%)' }
})

onMounted(() => {
  initialize()
  updateClock()
  setInterval(updateClock, 1000)
  document.addEventListener('click', closeStartMenu)
  document.addEventListener('click', closeContextMenu)
  // Mobile detection
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  document.removeEventListener('click', closeStartMenu)
  document.removeEventListener('click', closeContextMenu)
  window.removeEventListener('resize', checkMobile)
})

async function handleAnonymize() {
  if (!inputText.value.trim()) {
    error.value = 'Please enter text to scrub.'
    return
  }

  error.value = null
  isAnonymizing.value = true

  try {
    const result = await anonymize(inputText.value)

    if (result.success) {
      anonymizedText.value = result.anonymizedText!
      currentStep.value = 'anonymized'
    } else {
      error.value = result.error || 'An error occurred.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred.'
  } finally {
    isAnonymizing.value = false
  }
}

async function handleDeanonymize() {
  if (!chatGptResponse.value.trim()) {
    error.value = 'Please paste the ChatGPT response.'
    return
  }

  error.value = null
  isDeanonymizing.value = true

  try {
    const result = await deanonymize(chatGptResponse.value)

    if (result.success) {
      deanonymizedText.value = result.originalText!
      currentStep.value = 'response'
    } else {
      error.value = result.error || 'An error occurred.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred.'
  } finally {
    isDeanonymizing.value = false
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: 'Copied to clipboard',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Could not copy',
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
}

function startOver() {
  inputText.value = ''
  anonymizedText.value = ''
  chatGptResponse.value = ''
  deanonymizedText.value = ''
  currentStep.value = 'input'
  error.value = null
  clearSession()
}

async function toggleNER() {
  try {
    await setNEREnabled(!nerEnabled.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to toggle NER'
  }
}

const entityStats = computed(() => {
  const stats = getSessionStats()
  if (!stats) return null

  return {
    total: stats.totalEntities,
    byType: Object.entries(stats.countsByType)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({ type, count }))
  }
})

const currentStepIndex = computed(() => {
  switch (currentStep.value) {
    case 'input': return 0
    case 'anonymized': return 1
    case 'response': return 2
    default: return 0
  }
})
</script>

<template>
  <div class="h-screen font-mono text-[11px] overflow-hidden flex flex-col" :style="backgroundStyle">
    <!-- Desktop area -->
    <div class="flex-1 flex items-start justify-center p-8 pt-12 pb-16 overflow-auto relative"
      @contextmenu="showContextMenu">
      <!-- Desktop Icons -->
      <div class="absolute top-4 left-4 flex flex-col gap-4">
        <!-- rehydra.ai Icon -->
        <div class="desktop-icon" @dblclick="openWindow" @click="isMobile && openWindow()">
          <RehydraIconPixel :size="48" />
          <span class="desktop-icon-label">rehydra</span>
        </div>

        <!-- About.txt Icon -->
        <div class="desktop-icon" @dblclick="openAboutDialog" @click="isMobile && openAboutDialog()">
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
      <!-- Window -->
      <Transition name="window-minimize">
        <div v-show="!isMinimized && !isClosed" ref="windowRef" class="win-frame w-full"
          :class="{ 'win-maximized': isMaximized, 'max-w-2xl': !isMaximized }" :style="{
            ...(isMaximized ? {} : { transform: `translate(${windowPos.x}px, ${windowPos.y}px)` }),
            cursor: isDragging ? 'grabbing' : 'default',
            zIndex: focusedWindow === 'main' ? 30 : 10
          }" @mousedown="focusMainWindow">
          <!-- Title bar -->
          <div class="win-titlebar select-none" :class="{
            'cursor-grabbing': isDragging,
            'cursor-grab': !isDragging && !isMaximized,
            'cursor-default': isMaximized
          }" @mousedown="startDrag" @dblclick="toggleMaximize">
            <div class="flex items-center gap-2 pointer-events-none">
              <RehydraIconPixel :size="16" color="white" />
              <span>rehydra.ai - PII Anonymization</span>
            </div>
            <div class="flex gap-0.5 pointer-events-auto">
              <button class="win-title-btn" title="Minimize" @click.stop="minimizeWindow">_</button>
              <button class="win-title-btn" :title="isMaximized ? 'Restore' : 'Maximize'" @click.stop="toggleMaximize">
                {{ isMaximized ? '❐' : '□' }}
              </button>
              <button class="win-title-btn" title="Close" @click.stop="closeWindow">✕</button>
            </div>
          </div>

          <!-- Menu bar -->
          <div class="win-menubar flex gap-0">
            <span class="win-menu-item cursor-default"><u>F</u>ile</span>
            <span class="win-menu-item cursor-default"><u>E</u>dit</span>
            <span class="win-menu-item cursor-default"><u>V</u>iew</span>
            <span class="win-menu-item cursor-default"><u>H</u>elp</span>
          </div>

          <!-- Toolbar -->
          <div class="bg-[#c0c0c0] border-b border-[#808080] px-1 py-1 flex items-center gap-2">
            <div class="flex items-center gap-1 text-[10px]">
              <span class="w-2 h-2 rounded-full" :class="isInitialized ? 'bg-green-600' : 'bg-yellow-600'" />
              <span class="text-black">{{ isInitialized ? 'Ready' : 'Loading...' }}</span>
            </div>
            <span class="text-[#808080]">|</span>
            <span class="text-black">Step {{ currentStepIndex + 1 }} of 3</span>
          </div>

          <!-- Main content -->
          <div class="bg-[#c0c0c0] p-3">
            <!-- Step tabs -->
            <div class="flex mb-3">
              <template v-for="(step, index) in ['1. Input', '2. Scrubbed', '3. Restored']" :key="step">
                <div class="px-3 py-1 text-[11px] border-t border-l border-r cursor-default" :class="[
                  index === currentStepIndex
                    ? 'bg-[#c0c0c0] border-[#fff] border-b-[#c0c0c0] -mb-px z-10 relative text-black'
                    : 'bg-[#a0a0a0] border-[#808080] text-[#606060]'
                ]"
                  :style="index === currentStepIndex ? 'border-top-color: #fff; border-left-color: #fff; border-right-color: #808080;' : ''">
                  {{ step }}
                </div>
              </template>
              <div class="flex-1 border-b border-[#808080]" />
            </div>

            <!-- Tab content panel -->
            <div
              class="border-2 border-t-[#808080] border-l-[#808080] border-r-[#fff] border-b-[#fff] bg-[#c0c0c0] p-3">
              <!-- Error display -->
              <div v-if="error"
                class="mb-3 p-2 bg-[#fff] border-2 border-t-[#808080] border-l-[#808080] border-r-[#fff] border-b-[#fff] flex items-center gap-2">
                <span class="text-red-700">⚠</span>
                <span class="text-black flex-1">{{ error }}</span>
                <button class="win-btn !min-w-0 !px-2" @click="error = null">OK</button>
              </div>

              <!-- Step 1: Input -->
              <div v-if="currentStep === 'input'">
                <div class="text-black mb-2">Enter or paste text containing sensitive data:</div>
                <div class="win-inset mb-3">
                  <textarea v-model="inputText" rows="12" placeholder="Type or paste your text here...

Example:
Dear John Smith,
Your email is john@example.com
Phone: +1-555-123-4567
Card: 4111-1111-1111-1111"
                    class="w-full bg-white text-black placeholder-[#808080] p-2 font-mono text-[11px] focus:outline-none resize-none border-none"
                    :disabled="!isInitialized || isAnonymizing" />
                </div>

                <!-- NER Toggle -->
                <div class="win-groupbox mb-3">
                  <span class="win-groupbox-title">Options</span>
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" :checked="nerEnabled" :disabled="nerLoading" class="w-4 h-4"
                      @change="toggleNER">
                    <span class="text-black">
                      Enable NER (detect names, organizations, locations)
                    </span>
                    <span v-if="nerLoading" class="text-[#808080] text-[10px]">
                      {{ nerLoadProgress || 'Loading...' }}
                    </span>
                  </label>
                  <p class="text-[#606060] text-[10px] mt-1 ml-6">
                    NER uses a ~265MB AI model. First load takes a few seconds.
                  </p>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-black">{{ inputText.length }} character(s)</span>
                  <button :disabled="!isInitialized || !inputText.trim() || isAnonymizing" class="win-btn"
                    @click="handleAnonymize">
                    {{ isAnonymizing ? 'Processing...' : 'Scrub Data' }}
                  </button>
                </div>
              </div>

              <!-- Step 2: Anonymized -->
              <div v-if="currentStep === 'anonymized'">
                <div class="text-black mb-2">Scrubbed output (copy this to ChatGPT):</div>
                <div class="win-inset mb-2 relative">
                  <pre class="bg-white p-2 text-black text-[11px] whitespace-pre-wrap overflow-auto max-h-28 font-mono">{{
                    anonymizedText }}</pre>
                  <button class="win-btn !min-w-0 absolute top-1 right-1 !px-2 !py-0 text-[10px]"
                    @click="copyToClipboard(anonymizedText)">
                    Copy
                  </button>
                </div>

                <!-- Stats group box -->
                <div v-if="entityStats && entityStats.total > 0" class="win-groupbox mb-3">
                  <span class="win-groupbox-title">Scan Results</span>
                  <div class="text-black mb-1">{{ entityStats.total }} item(s) detected and replaced:</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="stat in entityStats.byType" :key="stat.type" class="win-status-field text-[10px]">
                      {{ stat.type }}: {{ stat.count }}
                    </span>
                  </div>
                </div>

                <div class="text-black mb-2">Paste ChatGPT's response here to restore original data:</div>
                <div class="win-inset mb-3">
                  <textarea v-model="chatGptResponse" rows="6" placeholder="Paste the AI response here..."
                    class="w-full bg-white text-black placeholder-[#808080] p-2 font-mono text-[11px] focus:outline-none resize-none border-none"
                    :disabled="isDeanonymizing" />
                </div>

                <div class="flex justify-between">
                  <button class="win-btn" @click="startOver">
                    Reset
                  </button>
                  <button :disabled="!chatGptResponse.trim() || isDeanonymizing" class="win-btn"
                    @click="handleDeanonymize">
                    {{ isDeanonymizing ? 'Processing...' : 'Restore Data' }}
                  </button>
                </div>
              </div>

              <!-- Step 3: Restored -->
              <div v-if="currentStep === 'response'">
                <div class="text-black mb-2">Restored output (original data has been reinserted):</div>
                <div class="win-inset mb-3 relative">
                  <pre class="bg-white p-2 text-black text-[11px] whitespace-pre-wrap overflow-auto max-h-48 font-mono">{{
                    deanonymizedText }}</pre>
                  <button class="win-btn !min-w-0 absolute top-1 right-1 !px-2 !py-0 text-[10px]"
                    @click="copyToClipboard(deanonymizedText)">
                    Copy
                  </button>
                </div>

                <div class="flex justify-center">
                  <button class="win-btn" @click="startOver">
                    Start New Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Status bar -->
          <div class="win-statusbar flex justify-between">
            <div class="flex gap-2">
              <span class="win-status-field">{{ nerEnabled ? 'NER + Regex' : 'Regex' }}</span>
              <span class="win-status-field">Client-side</span>
            </div>
            <span class="win-status-field">v0.3.1</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Start Menu -->
    <Transition name="start-menu">
      <div v-if="startMenuOpen" ref="startMenuRef" class="start-menu">
        <!-- Windows 95 style sidebar -->
        <div class="start-menu-sidebar">
          <span class="start-menu-sidebar-text">rehydra.ai</span>
        </div>

        <!-- Menu content -->
        <div class="start-menu-content">
          <!-- Info items -->
          <div class="start-menu-info">
            <div class="flex items-center gap-2 mb-2">
              <RehydraIconPixel :size="24" color="black" />
              <div>
                <div class="font-bold text-[12px]">rehydra.ai</div>
                <div class="text-[10px] text-[#606060]">PII Anonymization</div>
              </div>
            </div>
            <div class="text-[10px] text-[#404040] leading-relaxed">
              <p class="mb-1">Version 0.3.1</p>
              <p class="mb-1">© 2025 rehydra.ai</p>
              <p>All rights reserved.</p>
            </div>
          </div>

          <div class="start-menu-separator" />

          <div class="start-menu-item" @click="startMenuOpen = false">
            <span class="start-menu-icon">❌</span>
            <span>Close Menu</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Context Menu -->
    <div v-if="contextMenuOpen" class="context-menu"
      :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }" @click.stop>
      <div class="context-menu-item" @click="openBackgroundDialog">
        <span>🖼️</span>
        <span>Change Background...</span>
      </div>
      <div class="context-menu-separator" />
      <div class="context-menu-item disabled">
        <span>📋</span>
        <span>Paste</span>
      </div>
      <div class="context-menu-separator" />
      <div class="context-menu-item disabled">
        <span>🔄</span>
        <span>Refresh</span>
      </div>
    </div>

    <!-- Background Selector Dialog -->
    <div v-if="backgroundDialogOpen" class="dialog-overlay" @click="cancelBackgroundDialog">
      <div class="win-frame dialog-window" @click.stop>
        <!-- Title bar -->
        <div class="win-titlebar">
          <div class="flex items-center gap-2">
            <span>🖼️</span>
            <span>Display Properties</span>
          </div>
          <div class="flex gap-0.5">
            <button class="win-title-btn" @click="cancelBackgroundDialog">✕</button>
          </div>
        </div>

        <!-- Dialog content -->
        <div class="bg-[#c0c0c0] p-3">
          <!-- Tabs -->
          <div class="flex mb-3">
            <div
              class="px-3 py-1 text-[11px] border-t border-l border-r bg-[#c0c0c0] border-[#fff] border-b-[#c0c0c0] -mb-px z-10 relative"
              style="border-top-color: #fff; border-left-color: #fff; border-right-color: #808080;">
              Background
            </div>
            <div class="px-3 py-1 text-[11px] border-t border-l border-r bg-[#a0a0a0] border-[#808080] text-[#404040]">
              Screen Saver
            </div>
            <div class="px-3 py-1 text-[11px] border-t border-l border-r bg-[#a0a0a0] border-[#808080] text-[#404040]">
              Appearance
            </div>
            <div class="flex-1 border-b border-[#808080]" />
          </div>

          <!-- Content -->
          <div class="border-2 border-t-[#808080] border-l-[#808080] border-r-[#fff] border-b-[#fff] bg-[#c0c0c0] p-3">
            <!-- Preview -->
            <div class="flex justify-center mb-3">
              <div class="w-40 h-28 border-2 border-[#404040] bg-[#008080] relative"
                :style="selectedBackground === 'default' ? { background: 'linear-gradient(180deg, #5a8cc2 0%, #3a6ea5 50%, #2d5a8a 100%)' } : { backgroundImage: `url(${backgrounds.find(b => b.id === selectedBackground)?.preview})`, backgroundSize: 'cover' }">
                <div class="absolute bottom-0 left-0 right-0 h-3 bg-[#c0c0c0] border-t border-[#fff]" />
              </div>
            </div>

            <!-- Wallpaper selection -->
            <div class="win-groupbox">
              <span class="win-groupbox-title">Wallpaper</span>
              <div class="win-inset bg-white p-1 h-32 overflow-y-auto">
                <div v-for="bg in backgrounds" :key="bg.id" class="flex items-center gap-2 px-2 py-1 cursor-pointer"
                  :class="selectedBackground === bg.id ? 'bg-[#000080] text-white' : 'text-black hover:bg-[#e0e0e0]'"
                  @click="selectedBackground = bg.id">
                  <span v-if="bg.type === 'gradient'">🎨</span>
                  <span v-else>🖼️</span>
                  <span>{{ bg.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-2 mt-3">
            <button class="win-btn" @click="applyBackground">OK</button>
            <button class="win-btn" @click="cancelBackgroundDialog">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- About Window (Notepad style) -->
    <div v-if="aboutDialogOpen" class="win-frame absolute" :class="{
      'about-window-mobile': isMobile,
      'w-[560px]': !isMobile
    }" :style="isMobile ? {
      zIndex: focusedWindow === 'about' ? 30 : 20
    } : {
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${aboutDialogPos.x}px), calc(-50% + ${aboutDialogPos.y}px))`,
      zIndex: focusedWindow === 'about' ? 30 : 20
    }" @mousedown="focusAboutWindow">
      <!-- Title bar -->
      <div class="win-titlebar select-none" :class="{
        'cursor-grabbing': isAboutDragging && !isMobile,
        'cursor-grab': !isAboutDragging && !isMobile,
        'cursor-default': isMobile
      }" @mousedown="(e) => !isMobile && startAboutDrag(e)">
        <div class="flex items-center gap-2 pointer-events-none">
          <svg viewBox="0 0 16 16" class="w-4 h-4">
            <rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#808080" />
            <line x1="3" y1="4" x2="13" y2="4" stroke="#000080" stroke-width="1" />
            <line x1="3" y1="6" x2="13" y2="6" stroke="#000080" stroke-width="1" />
            <line x1="3" y1="8" x2="10" y2="8" stroke="#000080" stroke-width="1" />
          </svg>
          <span>About.txt - Notepad</span>
        </div>
        <div class="flex gap-0.5 pointer-events-auto">
          <button class="win-title-btn" @click.stop="closeAboutDialog">✕</button>
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
      <div class="bg-[#c0c0c0] p-1 about-content-wrapper">
        <div class="win-inset">
          <div class="bg-white p-3 overflow-y-auto text-black leading-relaxed about-content-scroll"
            :class="{ 'h-[420px]': !isMobile }">
            <pre class="font-mono text-[11px] whitespace-pre-wrap">
          ══════════════════════════════════════════════
          rehydra.ai v0.3.1
          PII Anonymization Tool
          ══════════════════════════════════════════════

          WHAT IS rehydra.ai?
          ─────────────────
          rehydra.ai is a privacy-first tool that removes
          Personally Identifiable Information (PII) from
          text before you share it with AI services like
          ChatGPT, Claude, or other language models.

          HOW IT WORKS
          ────────────
          1. SCRUB: Paste your text into the tool.
          rehydra.ai detects and replaces sensitive
          data (emails, phones, names, addresses,
          credit cards, etc.) with anonymous tags.

          2. SHARE: Copy the scrubbed text to ChatGPT
          or any AI service. Your private data never
          leaves your device.

          3. REHYDRATE: Paste the AI's response back into
          rehydra.ai. It automatically reinserts your
          original data into the response.

          PRIVACY FEATURES
          ────────────────
          • 100% Client-side processing
          • No data sent to any server
          • AES-256-GCM encrypted PII storage
          • GDPR compliant (no external requests)

          DETECTION MODES
          ───────────────
          • Regex Mode: Fast detection of structured
          PII like emails, phones, IBANs, credit
          cards, IP addresses, and URLs.

          • NER Mode: AI-powered detection of names,
          organizations, and locations using an
          on-device neural network (~265MB model).

          CREDITS
          ───────
          Powered by <a href="https://github.com/rehydra-ai/rehydra">rehydra</a>
          © 2025 rehydra.ai. All rights reserved.
        </pre>
          </div>
        </div>
      </div>

      <!-- Status bar -->
      <div class="win-statusbar flex justify-between">
        <span class="win-status-field flex-1">Ln 1, Col 1</span>
        <span class="win-status-field">UTF-8</span>
      </div>
    </div>

    <!-- Windows Taskbar -->
    <div class="taskbar">
      <!-- Start button -->
      <button ref="startBtnRef" class="start-btn" :class="{ active: startMenuOpen }" @click="toggleStartMenu">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" fill="#f25022" />
          <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
          <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
          <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
        </svg>
        <span class="font-bold text-black">Start</span>
      </button>

      <!-- Quick launch divider -->
      <div class="taskbar-divider" />

      <!-- Active window button (hidden when closed) -->
      <button v-if="!isClosed" class="taskbar-window-btn" :class="{ active: !isMinimized && focusedWindow === 'main' }"
        @click="isMinimized ? restoreWindow() : focusMainWindow()">
        <RehydraIconPixel :size="16" color="black" />
        <span class="truncate">rehydra.ai - PII Anonymization</span>
      </button>

      <!-- About window button -->
      <button v-if="aboutDialogOpen" class="taskbar-window-btn" :class="{ active: focusedWindow === 'about' }"
        @click="focusAboutWindow">
        <svg viewBox="0 0 16 16" class="w-3 h-3">
          <rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#808080" />
          <line x1="3" y1="4" x2="13" y2="4" stroke="#000080" stroke-width="1" />
          <line x1="3" y1="6" x2="13" y2="6" stroke="#000080" stroke-width="1" />
        </svg>
        <span class="truncate">About.txt - Notepad</span>
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
