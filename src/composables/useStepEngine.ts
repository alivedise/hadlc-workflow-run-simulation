import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import type {
  Scenario,
  Step,
  Phase,
  AccumulatedState,
  WindowId,
  CameraPlacement,
  PrototypeState,
} from '@/data/types'
import type { useWindowManager } from './useWindowManager'

interface FlatStep {
  step: Step
  phase: Phase
  globalIndex: number
}

interface UndoSnapshot {
  browserTab: AccumulatedState['browserTab']
  prototypeState: PrototypeState
  vscodeFile: AccumulatedState['vscodeFile']
  pencilFile: AccumulatedState['pencilFile']
  pencilScreens: AccumulatedState['pencilScreens']
  teamsCount: number
  claudeCount: number
  finderEntries: AccumulatedState['finderEntries'][number][]
  apiEndpointCount: number
  cameraCount: number
}

const DEFAULT_CAMERAS: CameraPlacement[] = [
  { id: 'cam-1', name: 'Lobby', x: 0.2, y: 0.3, angle: 45 },
  { id: 'cam-2', name: 'Hallway A', x: 0.5, y: 0.2, angle: 180 },
  { id: 'cam-3', name: 'Server Room', x: 0.8, y: 0.5, angle: 270 },
  { id: 'cam-4', name: 'Exit B', x: 0.3, y: 0.8, angle: 90 },
  { id: 'cam-5', name: 'Parking', x: 0.7, y: 0.85, angle: 135 },
]

export function useStepEngine(scenario: Scenario, windowManager?: ReturnType<typeof useWindowManager>) {
  // Flatten all steps
  const flatSteps: FlatStep[] = []
  for (const phase of scenario.phases) {
    for (const step of phase.steps) {
      flatSteps.push({
        step,
        phase,
        globalIndex: flatSteps.length,
      })
    }
  }

  const state = reactive<AccumulatedState>({
    teamsMessages: [],
    claudeLines: [],
    finderEntries: [],
    browserTab: 'prototype',
    prototypeState: 'empty',
    apiEndpoints: [],
    cameras: [],
    vscodeFile: null,
    pencilFile: null,
    pencilScreens: [],
    currentPhase: scenario.phases[0] ?? null,
    currentStepIndex: -1,
    totalSteps: flatSteps.length,
    activeWindow: null,
  })

  const undoStack: UndoSnapshot[] = []
  let glowTimeout: ReturnType<typeof setTimeout> | null = null
  const paused = ref(true)

  function detectActiveWindow(step: Step): WindowId | null {
    // Priority: last action key in the step
    if (step.pencil) return 'pencil'
    if (step.vscode) return 'vscode'
    if (step.browser) return 'browser'
    if (step.finder) return 'vscode'
    if (step.claude) return 'claude'
    if (step.teams) return 'teams'
    return null
  }

  function takeSnapshot(): UndoSnapshot {
    return {
      browserTab: state.browserTab,
      prototypeState: state.prototypeState,
      vscodeFile: state.vscodeFile ? { ...state.vscodeFile } : null,
      pencilFile: state.pencilFile,
      pencilScreens: [...state.pencilScreens],
      teamsCount: state.teamsMessages.length,
      claudeCount: state.claudeLines.length,
      finderEntries: state.finderEntries.map((e) => ({ ...e })),
      apiEndpointCount: state.apiEndpoints.length,
      cameraCount: state.cameras.length,
    }
  }

  function applyStep(flat: FlatStep) {
    const { step, phase } = flat

    // Save snapshot before applying
    undoStack.push(takeSnapshot())

    state.currentPhase = phase

    // Teams
    if (step.teams) {
      state.teamsMessages.push({ ...step.teams, stepId: step.id })
    }

    // Claude
    if (step.claude) {
      if (step.claude.action === 'command') {
        state.claudeLines.push({
          type: 'command',
          text: step.claude.text,
          stepId: step.id,
        })
      } else {
        for (const line of step.claude.lines) {
          state.claudeLines.push({
            type: 'output',
            text: line.text,
            color: line.color,
            stepId: step.id,
          })
        }
      }
    }

    // Finder
    if (step.finder) {
      for (const entry of step.finder.entries) {
        const existing = state.finderEntries.findIndex((e) => e.path === entry.path)
        if (existing >= 0) {
          state.finderEntries[existing] = { ...entry }
        } else {
          state.finderEntries.push({ ...entry })
        }
      }
    }

    // Browser
    if (step.browser) {
      state.browserTab = step.browser.tab
      if (step.browser.tab === 'prototype') {
        state.prototypeState = step.browser.state
        if (step.browser.state === 'cameras' || step.browser.state === 'interactive' || step.browser.state === 'final') {
          state.cameras = [...DEFAULT_CAMERAS]
        }
      } else {
        for (const ep of step.browser.endpoints) {
          if (!state.apiEndpoints.find((e) => e.method === ep.method && e.path === ep.path)) {
            state.apiEndpoints.push({ ...ep })
          }
        }
      }
    }

    // VS Code
    if (step.vscode) {
      if (step.vscode.action === 'open-file') {
        state.vscodeFile = {
          path: step.vscode.path,
          content: step.vscode.content,
          language: step.vscode.language ?? 'markdown',
        }
      } else if (step.vscode.action === 'update-content') {
        if (state.vscodeFile) {
          state.vscodeFile = { ...state.vscodeFile, content: step.vscode.content }
        }
      } else if (step.vscode.action === 'close-file') {
        state.vscodeFile = null
      }
    }

    // Pencil
    if (step.pencil) {
      if (step.pencil.action === 'show-design') {
        state.pencilFile = step.pencil.file
        state.pencilScreens = [...step.pencil.screens]
      }
    }

    // Active window glow + bring to front
    const win = detectActiveWindow(step)
    state.activeWindow = win
    if (win && windowManager) {
      windowManager.bringToFront(win)
    }
    if (glowTimeout) clearTimeout(glowTimeout)
    glowTimeout = setTimeout(() => {
      state.activeWindow = null
    }, 800)
  }

  function reverseStep() {
    const snapshot = undoStack.pop()
    if (!snapshot) return

    // Restore arrays by truncating
    state.teamsMessages.length = snapshot.teamsCount
    state.claudeLines.length = snapshot.claudeCount
    state.finderEntries.splice(0, state.finderEntries.length, ...snapshot.finderEntries)
    state.apiEndpoints.length = snapshot.apiEndpointCount
    state.cameras.length = snapshot.cameraCount

    // Restore replaced state
    state.browserTab = snapshot.browserTab
    state.prototypeState = snapshot.prototypeState
    state.vscodeFile = snapshot.vscodeFile
    state.pencilFile = snapshot.pencilFile
    state.pencilScreens = snapshot.pencilScreens

    // Restore phase
    if (state.currentStepIndex >= 0) {
      state.currentPhase = flatSteps[state.currentStepIndex].phase
    } else {
      state.currentPhase = scenario.phases[0] ?? null
    }
  }

  function next() {
    if (state.currentStepIndex >= flatSteps.length - 1) return
    state.currentStepIndex++
    applyStep(flatSteps[state.currentStepIndex])
  }

  function prev() {
    if (state.currentStepIndex < 0) return
    reverseStep()
    state.currentStepIndex--
  }

  function handleKeydown(e: KeyboardEvent) {
    if (paused.value) {
      paused.value = false
      return
    }
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    }
  }

  const currentPhaseIndex = computed(() => {
    if (!state.currentPhase) return 0
    return scenario.phases.findIndex((p) => p.id === state.currentPhase!.id)
  })

  const stepInPhase = computed(() => {
    if (state.currentStepIndex < 0 || !state.currentPhase) return 0
    let count = 0
    for (let i = 0; i <= currentPhaseIndex.value; i++) {
      if (i === currentPhaseIndex.value) {
        return state.currentStepIndex - count + 1
      }
      count += scenario.phases[i].steps.length
    }
    return 0
  })

  const totalStepsInPhase = computed(() => {
    return state.currentPhase?.steps.length ?? 0
  })

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    state,
    next,
    prev,
    paused,
    currentPhaseIndex,
    stepInPhase,
    totalStepsInPhase,
  }
}
