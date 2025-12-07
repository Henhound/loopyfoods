import type { PlaceholderCard } from '../data/placeholder-food-cards'
import type { PlaceholderKid } from '../data/placeholder-kid-cards'

// Shape of a stored team snapshot for proto matchmaking.
export type TeamSnapshot = {
  id: string
  createdAt: number
  round: number
  health: number
  trophies: number
  tray: Array<PlaceholderCard | null>
  kids: PlaceholderKid[]
}

export type TeamSnapshotInput = Omit<TeamSnapshot, 'id' | 'createdAt'> & { id?: string }

const STORAGE_KEY = 'loopyfoods:teamSnapshots:v1'
const MAX_SNAPSHOTS = 30

const hasLocalStorage = () => typeof localStorage !== 'undefined'

const copyCard = (card: PlaceholderCard): PlaceholderCard => ({ ...card })
const copyKid = (kid: PlaceholderKid): PlaceholderKid => ({ ...kid })

function normalizeSnapshot(raw: any): TeamSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const base: TeamSnapshot = {
    id: typeof raw.id === 'string' ? raw.id : '',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    round: typeof raw.round === 'number' ? raw.round : 1,
    health: typeof raw.health === 'number' ? raw.health : 0,
    trophies: typeof raw.trophies === 'number' ? raw.trophies : 0,
    tray: Array.isArray(raw.tray) ? raw.tray.map((c: any) => (c ? copyCard(c) : null)) : [],
    kids: Array.isArray(raw.kids) ? raw.kids.map((k: any) => copyKid(k)) : [],
  }
  if (!base.id) base.id = randomId()
  return base
}

function readSnapshots(): TeamSnapshot[] {
  if (!hasLocalStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeSnapshot)
      .filter((v): v is TeamSnapshot => Boolean(v))
  } catch (err) {
    console.warn('Failed to read team snapshots', err)
    return []
  }
}

function writeSnapshots(snaps: TeamSnapshot[]) {
  if (!hasLocalStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snaps))
  } catch (err) {
    console.warn('Failed to write team snapshots', err)
  }
}

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `snap-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function saveTeamSnapshot(input: TeamSnapshotInput): TeamSnapshot {
  const snapshot: TeamSnapshot = {
    id: input.id ?? randomId(),
    createdAt: Date.now(),
    round: input.round,
    health: input.health,
    trophies: input.trophies,
    tray: input.tray.map(card => (card ? copyCard(card) : null)),
    kids: input.kids.map(copyKid),
  }

  const existing = readSnapshots().filter(s => s.id !== snapshot.id)
  const next = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS)
  writeSnapshots(next)
  return snapshot
}

export function listTeamSnapshots(): TeamSnapshot[] {
  return readSnapshots()
}

export function getRandomOpponentSnapshot(excludeId?: string): TeamSnapshot | null {
  const pool = readSnapshots().filter(s => s.id !== excludeId)
  if (!pool.length) return null
  const pick = Math.floor(Math.random() * pool.length)
  return pool[pick]
}

export function clearTeamSnapshots() {
  writeSnapshots([])
}

export function deleteTeamSnapshot(id: string) {
  if (!id) return
  const remaining = readSnapshots().filter(s => s.id !== id)
  writeSnapshots(remaining)
}
