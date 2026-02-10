<script setup lang="ts">
import { ref } from 'vue'
import { useStepEngine } from '@/composables/useStepEngine'
import { useWindowManager } from '@/composables/useWindowManager'
import { scenario } from '@/data/scenario'
import type { WindowId } from '@/data/types'
import MenuBar from '@/components/MenuBar.vue'
import Dock from '@/components/Dock.vue'
import Window from '@/components/Window.vue'
import TeamsApp from '@/components/apps/TeamsApp.vue'
import VscodeApp from '@/components/apps/VscodeApp.vue'
import ClaudeCodeApp from '@/components/apps/ClaudeCodeApp.vue'
import BrowserApp from '@/components/apps/BrowserApp.vue'
import PencilApp from '@/components/apps/PencilApp.vue'

const desktopRef = ref<HTMLElement>()
const wm = useWindowManager(desktopRef)

const { state, paused, currentPhaseIndex, stepInPhase, totalStepsInPhase } = useStepEngine(scenario, wm)

const windowDefs: Array<{ id: WindowId; title: string }> = [
  { id: 'browser', title: 'Browser' },
  { id: 'pencil', title: 'Pencil' },
  { id: 'claude', title: 'Claude Code' },
  { id: 'vscode', title: 'Visual Studio Code' },
  { id: 'teams', title: 'Microsoft Teams' },
]

function windowStyle(id: WindowId) {
  const win = wm.windows[id]
  return {
    left: win.x + '%',
    top: win.y + '%',
    width: win.w + '%',
    height: win.h + '%',
    zIndex: win.zIndex,
  }
}

function dismissOverlay() {
  paused.value = false
}
</script>

<template>
  <!-- 16:9 aspect ratio container -->
  <div class="w-full h-full flex items-center justify-center bg-black">
    <div
      class="relative flex flex-col overflow-hidden"
      style="
        aspect-ratio: 16 / 9;
        width: min(100vw, 177.78vh);
        height: min(100vh, 56.25vw);
        background: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 30%, #1e3a5f 60%, #0f2027 100%);
      "
    >
      <!-- Menu Bar -->
      <MenuBar
        :app-name="scenario.title"
        :phase-name="state.currentPhase?.name ?? ''"
        :phase-index="currentPhaseIndex"
        :step-in-phase="stepInPhase"
        :total-steps-in-phase="totalStepsInPhase"
        :total-steps="state.totalSteps"
        :current-step-index="state.currentStepIndex"
      />

      <!-- Desktop area with absolutely-positioned windows -->
      <div ref="desktopRef" class="flex-1 relative min-h-0">
        <Window
          v-for="def in windowDefs"
          :key="def.id"
          :window-id="def.id"
          :title="def.title"
          :active="state.activeWindow === def.id"
          :style="windowStyle(def.id)"
          :manager="wm"
        >
          <BrowserApp
            v-if="def.id === 'browser'"
            :active-tab="state.browserTab"
            :prototype-state="state.prototypeState"
            :cameras="state.cameras"
            :endpoints="state.apiEndpoints"
          />
          <PencilApp v-else-if="def.id === 'pencil'" :file="state.pencilFile" :screens="state.pencilScreens" />
          <ClaudeCodeApp v-else-if="def.id === 'claude'" :lines="state.claudeLines" />
          <VscodeApp v-else-if="def.id === 'vscode'" :file="state.vscodeFile" :entries="state.finderEntries" />
          <TeamsApp v-else-if="def.id === 'teams'" :messages="state.teamsMessages" />
        </Window>

        <!-- Dock (auto-hide, floats over windows) -->
        <Dock :active-window="state.activeWindow" @activate="wm.bringToFront" />
      </div>

      <!-- Keyboard shortcut overlay -->
      <Transition name="fade">
        <div
          v-if="paused"
          class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          @click="dismissOverlay"
          @keydown.once="dismissOverlay"
        >
          <div class="text-center text-white space-y-4" @click.stop="dismissOverlay">
            <h2 class="text-2xl font-light tracking-wide">HADLC Interactive Demo</h2>
            <div class="space-y-2 text-sm text-white/70">
              <div class="flex items-center justify-center gap-3">
                <kbd class="px-3 py-1 rounded bg-white/10 border border-white/20 text-white font-mono text-xs">&#8594;</kbd>
                <span>or</span>
                <kbd class="px-3 py-1 rounded bg-white/10 border border-white/20 text-white font-mono text-xs">Space</kbd>
                <span class="ml-2">Next step</span>
              </div>
              <div class="flex items-center justify-center gap-3">
                <kbd class="px-3 py-1 rounded bg-white/10 border border-white/20 text-white font-mono text-xs">&#8592;</kbd>
                <span class="ml-9">Previous step</span>
              </div>
            </div>
            <p class="text-xs text-white/40 mt-6">Click anywhere or press any key to begin</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
