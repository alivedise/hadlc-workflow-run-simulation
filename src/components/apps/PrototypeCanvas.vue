<script setup lang="ts">
import type { PrototypeState, CameraPlacement } from '@/data/types'

defineProps<{
  state: PrototypeState
  cameras: CameraPlacement[]
}>()

const rooms = [
  { name: 'Lobby', x: 5, y: 10, w: 30, h: 35, color: 'rgba(59,130,246,0.15)' },
  { name: 'Hallway A', x: 35, y: 10, w: 35, h: 15, color: 'rgba(139,92,246,0.15)' },
  { name: 'Server Room', x: 70, y: 10, w: 25, h: 35, color: 'rgba(239,68,68,0.12)' },
  { name: 'Office 1', x: 35, y: 25, w: 17, h: 20, color: 'rgba(34,197,94,0.12)' },
  { name: 'Office 2', x: 52, y: 25, w: 18, h: 20, color: 'rgba(34,197,94,0.12)' },
  { name: 'Break Room', x: 5, y: 45, w: 30, h: 25, color: 'rgba(249,115,22,0.12)' },
  { name: 'Conference', x: 35, y: 45, w: 35, h: 25, color: 'rgba(236,72,153,0.12)' },
  { name: 'Exit B', x: 70, y: 45, w: 25, h: 25, color: 'rgba(107,114,128,0.15)' },
  { name: 'Parking', x: 5, y: 70, w: 90, h: 20, color: 'rgba(75,85,99,0.1)' },
]
</script>

<template>
  <div class="w-full h-full relative" style="background: #111827">
    <!-- Empty state -->
    <div
      v-if="state === 'empty'"
      class="w-full h-full flex items-center justify-center text-white/20 text-xs"
    >
      Floor plan will appear here
    </div>

    <!-- Floor plan (skeleton and above) -->
    <template v-if="state !== 'empty'">
      <!-- Grid background -->
      <svg class="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <!-- Rooms -->
      <div
        v-for="room in rooms"
        :key="room.name"
        class="absolute border border-white/20 rounded-sm flex items-center justify-center"
        :style="{
          left: room.x + '%',
          top: room.y + '%',
          width: room.w + '%',
          height: room.h + '%',
          background: state === 'skeleton' ? 'rgba(255,255,255,0.03)' : room.color,
        }"
      >
        <span class="text-[9px] text-white/40 select-none">{{ room.name }}</span>
      </div>

      <!-- Camera dots -->
      <template v-if="state === 'cameras' || state === 'interactive' || state === 'final'">
        <div
          v-for="cam in cameras"
          :key="cam.id"
          class="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-cyan-400 border-2 border-cyan-300 z-10"
          :class="state === 'final' ? 'shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''"
          :style="{ left: cam.x * 100 + '%', top: cam.y * 100 + '%' }"
          :title="cam.name"
        >
          <!-- View angle indicator -->
          <div
            v-if="state === 'interactive' || state === 'final'"
            class="absolute w-8 h-8 -left-2 -top-2"
            :style="{ transform: `rotate(${cam.angle}deg)` }"
          >
            <svg viewBox="0 0 32 32" class="w-full h-full opacity-30">
              <path d="M 16 16 L 8 0 L 24 0 Z" fill="cyan" />
            </svg>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
