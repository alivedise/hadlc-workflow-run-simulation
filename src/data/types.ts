export type PersonRole = 'ADM' | 'PM' | 'RD' | 'UX' | 'Agent'

export type WindowId = 'teams' | 'claude' | 'browser' | 'vscode' | 'pencil'

export interface TeamsMember {
  role: PersonRole
  name: string
}

export interface TeamsAction {
  from: TeamsMember
  text: string
  isApproval?: boolean
}

export type ClaudeAction =
  | { action: 'command'; text: string }
  | { action: 'output'; lines: OutputLine[] }

export interface OutputLine {
  text: string
  color?: 'green' | 'yellow' | 'cyan' | 'red' | 'white'
}

export interface FinderAction {
  entries: FinderEntry[]
}

export interface FinderEntry {
  path: string
  type: 'folder' | 'file'
  modified?: boolean
}

export type BrowserAction =
  | { tab: 'prototype'; state: PrototypeState }
  | { tab: 'api-docs'; endpoints: ApiEndpoint[] }

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  summary: string
}

export type PrototypeState =
  | 'empty'
  | 'skeleton'
  | 'cameras'
  | 'interactive'
  | 'final'

export interface CameraPlacement {
  id: string
  name: string
  x: number
  y: number
  angle: number
}

export interface PencilElement {
  label: string
  x: number
  y: number
  w: number
  h: number
  color?: string
}

export interface PencilScreen {
  name: string
  elements: PencilElement[]
}

export type PencilAction =
  | { action: 'show-design'; file: string; screens: PencilScreen[] }

export type VscodeAction =
  | { action: 'open-file'; path: string; content: string; language?: string }
  | { action: 'update-content'; content: string }
  | { action: 'close-file' }

export interface Step {
  id: string
  description?: string
  teams?: TeamsAction
  claude?: ClaudeAction
  finder?: FinderAction
  browser?: BrowserAction
  vscode?: VscodeAction
  pencil?: PencilAction
}

export interface Phase {
  id: number
  name: string
  steps: Step[]
}

export interface Scenario {
  title: string
  phases: Phase[]
}

// Accumulated state -- the single reactive object all components read from
export interface AccumulatedState {
  // Teams
  teamsMessages: Array<TeamsAction & { stepId: string }>

  // Claude Code
  claudeLines: Array<{ type: 'command' | 'output'; text: string; color?: string; stepId: string }>

  // Finder
  finderEntries: FinderEntry[]

  // Browser
  browserTab: 'prototype' | 'api-docs'
  prototypeState: PrototypeState
  apiEndpoints: ApiEndpoint[]
  cameras: CameraPlacement[]

  // VS Code
  vscodeFile: { path: string; content: string; language: string } | null

  // Pencil
  pencilFile: string | null
  pencilScreens: PencilScreen[]

  // Navigation
  currentPhase: Phase | null
  currentStepIndex: number
  totalSteps: number
  activeWindow: WindowId | null
}
