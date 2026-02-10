<script setup lang="ts">
import type { ApiEndpoint, PrototypeState, CameraPlacement } from '@/data/types'
import ApiDocsView from './ApiDocsView.vue'
import PrototypeCanvas from './PrototypeCanvas.vue'

defineProps<{
  activeTab: 'prototype' | 'api-docs'
  prototypeState: PrototypeState
  cameras: CameraPlacement[]
  endpoints: ApiEndpoint[]
}>()
</script>

<template>
  <div class="h-full flex flex-col text-xs" style="background: #1a1b26; color: #cdd6f4">
    <!-- Tab bar -->
    <div class="flex items-center h-7 pl-2 border-b border-white/10 shrink-0" style="background: #16161e">
      <div
        class="px-3 h-full flex items-center border-r border-white/10 cursor-default"
        :class="activeTab === 'prototype' ? 'text-white/80 bg-white/5' : 'text-white/40'"
      >
        Prototype
      </div>
      <div
        class="px-3 h-full flex items-center border-r border-white/10 cursor-default"
        :class="activeTab === 'api-docs' ? 'text-white/80 bg-white/5' : 'text-white/40'"
      >
        API Docs
      </div>
    </div>
    <!-- URL bar -->
    <div class="flex items-center h-6 px-3 border-b border-white/10 shrink-0" style="background: #1a1b26">
      <div class="flex-1 px-2 py-0.5 rounded text-[10px] text-white/40 font-mono" style="background: rgba(255,255,255,0.05)">
        {{ activeTab === 'prototype' ? 'http://localhost:5177/emap/editor' : 'http://localhost:5177/api/docs' }}
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <PrototypeCanvas
        v-if="activeTab === 'prototype'"
        :state="prototypeState"
        :cameras="cameras"
      />
      <ApiDocsView
        v-else
        :endpoints="endpoints"
      />
    </div>
  </div>
</template>
