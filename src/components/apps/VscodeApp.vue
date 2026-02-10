<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { FinderEntry } from '@/data/types'
import { Folder, FileText, FileCode, FileCode2, FlaskConical, File, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  file: { path: string; content: string; language: string } | null
  entries: FinderEntry[]
}>()

// --- Explorer tree logic (ported from FinderApp) ---

interface TreeNode {
  name: string
  path: string
  type: 'folder' | 'file'
  modified?: boolean
  children: TreeNode[]
  depth: number
}

const tree = computed(() => {
  const root: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  const sorted = [...props.entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.path.localeCompare(b.path)
  })

  for (const entry of sorted) {
    const parts = entry.path.split('/')
    let currentPath = ''
    let parent: TreeNode[] = root

    for (let i = 0; i < parts.length; i++) {
      currentPath += (i > 0 ? '/' : '') + parts[i]
      const isLast = i === parts.length - 1

      let existing = map.get(currentPath)
      if (!existing) {
        existing = {
          name: parts[i],
          path: currentPath,
          type: isLast ? entry.type : 'folder',
          modified: isLast ? entry.modified : false,
          children: [],
          depth: i,
        }
        map.set(currentPath, existing)
        parent.push(existing)
      }
      parent = existing.children
    }
  }

  return root
})

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children))
    }
  }
  return result
}

const flatNodes = computed(() => flattenTree(tree.value))

function fileIcon(node: TreeNode): { icon: Component; color: string } {
  if (node.type === 'folder') return { icon: Folder, color: 'text-blue-400' }
  const name = node.name
  if (name.endsWith('.test.ts')) return { icon: FlaskConical, color: 'text-amber-400' }
  const ext = name.split('.').pop()
  if (ext === 'md') return { icon: FileText, color: 'text-white/50' }
  if (ext === 'yaml' || ext === 'yml') return { icon: FileCode, color: 'text-yellow-400' }
  if (ext === 'ts' || ext === 'js') return { icon: FileCode2, color: 'text-cyan-400' }
  if (ext === 'vue') return { icon: FileCode, color: 'text-green-400' }
  return { icon: File, color: 'text-white/40' }
}

// --- Editor logic ---

const lines = computed(() => {
  if (!props.file) return []
  return props.file.content.split('\n')
})

const fileName = computed(() => {
  if (!props.file) return ''
  const parts = props.file.path.split('/')
  return parts[parts.length - 1]
})

function highlightLine(line: string, language: string): string {
  if (language === 'typescript' || language === 'ts') {
    return highlightTS(line)
  }
  return highlightMarkdown(line)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightMarkdown(line: string): string {
  const escaped = escapeHtml(line)
  if (/^#{1,6}\s/.test(line)) {
    return `<span style="color:#89b4fa;font-weight:600">${escaped}</span>`
  }
  if (/^\s*[-*]\s/.test(line)) {
    return `<span style="color:#f9e2af">${escaped}</span>`
  }
  if (/\*\*.*\*\*/.test(line)) {
    return escaped.replace(/\*\*(.*?)\*\*/g, '<span style="color:#cba6f7;font-weight:600">**$1**</span>')
  }
  if (/`[^`]+`/.test(line)) {
    return escaped.replace(/`([^`]+)`/g, '<span style="color:#a6e3a1;background:rgba(166,227,161,0.1);padding:0 2px;border-radius:2px">`$1`</span>')
  }
  return `<span style="color:#cdd6f4">${escaped}</span>`
}

function highlightTS(line: string): string {
  const escaped = escapeHtml(line)
  if (/^\s*\/\//.test(line)) {
    return `<span style="color:#6c7086">${escaped}</span>`
  }
  const keywords = /\b(import|export|const|let|var|function|return|if|else|for|while|type|interface|async|await|from|class|new|this|extends|implements)\b/g
  let result = escaped.replace(keywords, '<span style="color:#cba6f7">$1</span>')
  result = result.replace(/(&apos;[^&]*&apos;|'[^']*'|"[^"]*"|`[^`]*`)/g, '<span style="color:#a6e3a1">$1</span>')
  return result
}
</script>

<template>
  <div class="h-full flex flex-col font-mono text-xs" style="background: #1e1e2e; color: #cdd6f4">
    <!-- Tab bar -->
    <div class="flex items-center h-7 pl-2 border-b border-white/10 shrink-0" style="background: #181825">
      <div
        v-if="file"
        class="flex items-center gap-1.5 px-3 h-full border-r border-white/10 text-white/80"
        style="background: #1e1e2e"
      >
        <span class="text-[10px]">{{ file.language === 'typescript' ? 'TS' : 'MD' }}</span>
        <span>{{ fileName }}</span>
      </div>
      <div v-else class="px-3 text-white/30">No file open</div>
    </div>
    <!-- Main area: sidebar + editor -->
    <div class="flex flex-1 min-h-0">
      <!-- Explorer sidebar -->
      <div class="w-40 border-r border-white/10 flex flex-col shrink-0 overflow-hidden" style="background: #181825">
        <div class="flex items-center gap-1 px-3 py-1.5 text-[10px] text-white/40 uppercase tracking-wider shrink-0">
          <ChevronRight :size="10" class="text-white/30" />
          Explorer
        </div>
        <div class="flex-1 overflow-y-auto min-h-0 px-1">
          <div v-if="flatNodes.length === 0" class="text-white/20 text-center py-4 text-[10px]">
            No files yet
          </div>
          <div
            v-for="node in flatNodes"
            :key="node.path"
            class="flex items-center gap-1 py-px rounded hover:bg-white/5 cursor-default animate-file-in"
            :style="{ paddingLeft: node.depth * 12 + 4 + 'px' }"
          >
            <component :is="fileIcon(node).icon" :size="12" :class="fileIcon(node).color" class="shrink-0" />
            <span
              class="truncate text-[11px]"
              :class="{
                'text-white/80 font-medium': node.type === 'folder',
                'text-white/60': node.type === 'file' && !node.modified,
                'text-yellow-400': node.modified,
              }"
            >
              {{ node.name }}
            </span>
            <span v-if="node.modified" class="text-yellow-400 text-[9px] shrink-0">M</span>
          </div>
        </div>
      </div>
      <!-- Editor area -->
      <div class="flex-1 flex flex-col min-w-0">
        <div v-if="file" class="flex-1 overflow-y-auto min-h-0">
          <div class="flex min-h-full">
            <!-- Line numbers -->
            <div class="py-2 px-2 text-right select-none shrink-0 border-r border-white/5" style="color: #585b70; min-width: 2.5rem">
              <div v-for="(_, i) in lines" :key="i" class="leading-5">{{ i + 1 }}</div>
            </div>
            <!-- Content -->
            <div class="py-2 px-3 flex-1">
              <div
                v-for="(line, i) in lines"
                :key="i"
                class="leading-5 whitespace-pre"
                v-html="highlightLine(line, file.language)"
              />
            </div>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-white/20">
          <div class="text-center">
            <div class="text-3xl mb-2" style="color: #313244">{ }</div>
            <div>No file open</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Status bar -->
    <div class="h-5 flex items-center justify-between px-3 text-[10px] text-white/50 shrink-0 border-t border-white/5" style="background: #181825">
      <div class="flex items-center gap-3">
        <span v-if="file" class="text-white/40">Ln {{ lines.length }}, Col 1</span>
        <span class="text-white/40">UTF-8</span>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="file" class="text-white/40">{{ file.language === 'typescript' ? 'TypeScript' : 'Markdown' }}</span>
        <span class="text-white/40">Prettier</span>
      </div>
    </div>
  </div>
</template>
