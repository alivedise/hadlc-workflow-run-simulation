<script setup lang="ts">
import { ref } from 'vue'
import type { WindowId } from '@/data/types'
import type { Component } from 'vue'
import { MessageSquare, Code, Terminal, Globe, Rocket, Settings, Mail, Music, Camera, PenTool } from 'lucide-vue-next'

defineProps<{
  activeWindow: WindowId | null
}>()

const emit = defineEmits<{
  (e: 'activate', id: WindowId): void
}>()

const visible = ref(false)

const apps: Array<{ id: WindowId | null; label: string; icon: Component; color?: string }> = [
  { id: null, label: 'Launchpad', icon: Rocket, color: '#6b7280' },
  { id: 'browser', label: 'Chrome', icon: Globe, color: '#f59e0b' },
  { id: 'teams', label: 'Teams', icon: MessageSquare, color: '#7c3aed' },
  { id: 'vscode', label: 'Cursor', icon: Code, color: '#22c55e' },
  { id: 'claude', label: 'iTerm2', icon: Terminal, color: '#10b981' },
  { id: 'pencil', label: 'Pencil', icon: PenTool, color: '#a78bfa' },
  { id: null, label: 'Mail', icon: Mail, color: '#3b82f6' },
  { id: null, label: 'Music', icon: Music, color: '#ec4899' },
  { id: null, label: 'Camera', icon: Camera, color: '#6b7280' },
  { id: null, label: 'Settings', icon: Settings, color: '#6b7280' },
]

const activeIds: WindowId[] = ['browser', 'teams', 'vscode', 'claude', 'pencil']
</script>

<template>
  <div
    class="absolute bottom-0 left-0 right-0"
    style="z-index: 9999"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
  >
    <!-- Invisible 16px trigger zone -->
    <div class="h-4" />
    <!-- Dock bar -->
    <div
      class="flex justify-center py-1 transition-transform duration-300 ease-out"
      :class="visible ? 'translate-y-0' : 'translate-y-full'"
    >
      <div
        class="flex items-end gap-1 px-3 py-1.5 rounded-2xl backdrop-blur-xl"
        style="background: rgba(40, 40, 50, 0.7); border: 1px solid rgba(255,255,255,0.15)"
      >
        <div
          v-for="app in apps"
          :key="app.label"
          class="flex flex-col items-center gap-0.5 cursor-pointer"
          @click="app.id && emit('activate', app.id)"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
            :style="{ background: app.color ? app.color + '33' : 'rgba(60, 60, 70, 0.8)' }"
          >
            <component :is="app.icon" :size="20" :style="{ color: app.color || '#ffffff' }" class="opacity-80" />
          </div>
          <div
            class="w-1 h-1 rounded-full transition-colors"
            :class="(app.id && activeIds.includes(app.id)) || activeWindow === app.id ? 'bg-white/80' : 'bg-transparent'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
