import React from 'react'
import '../styles/shop.css'
import {
  DndContext,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, Modifier } from '@dnd-kit/core'

import { useNavigation } from '../app/navigation'
import { SCREENS } from '../app/screen'
import { PLACEHOLDER_CARDS, type PlaceholderCard } from '../data/placeholder-food-cards'
import { PLACEHOLDER_KIDS, type PlaceholderKid } from '../data/placeholder-kid-cards'
import { getRandomOpponentSnapshot, saveTeamSnapshot } from '../app/teamStorage'
import { CardPopover } from '../components/CardPopover'

type DragFoodSource = { type: 'shop'; index: number } | { type: 'tray'; index: number }
type DragKidSource = { type: 'kid'; index: number } | { type: 'kid-option'; index: number }
type DragData =
  | { kind: 'food'; card: PlaceholderCard; source?: DragFoodSource }
  | { kind: 'kid'; kid: PlaceholderKid; source: DragKidSource }

const TRAY_SIZE = 5 as const
const MAX_HEALTH = 5
const MAX_TROPHIES = 10

// Simple economy values
const FOOD_COST = 3
const FOOD_SELL_VALUE = 1
const REROLL_COST = 1

function pickRandomUnique<T>(source: readonly T[], count: number): T[] {
  if (!source.length || count <= 0) return []
  const pool = [...source]
  // Fisher-Yates shuffle to avoid duplicates while keeping randomness.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }
  return pool.slice(0, Math.min(count, pool.length))
}

function rollShopItems(trayItems: Array<PlaceholderCard | null>, count: number): PlaceholderCard[] {
  const excludedTitles = new Set(
    trayItems.filter((card): card is PlaceholderCard => Boolean(card)).map(card => card.title),
  )
  const available = PLACEHOLDER_CARDS.filter(card => !excludedTitles.has(card.title))
  return pickRandomUnique(available, count)
}

function TraySlot({
  index,
  children,
  canHighlight,
}: {
  index: number
  children?: React.ReactNode
  canHighlight: boolean
}) {
  const id = `tray-${index}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const cls = `slot ${index === TRAY_SIZE ? 'rect' : 'square'}`
  const style: React.CSSProperties = isOver && canHighlight
    ? { outline: '2px dashed var(--accent)', outlineOffset: -2 }
    : {}
  return (
    <div ref={setNodeRef} className={cls} data-index={index} style={style}>
      {children ?? <span>{index}</span>}
    </div>
  )
}

function LunchLineSlot({
  index,
  children,
  canHighlight,
}: {
  index: number
  children?: React.ReactNode
  canHighlight: boolean
}) {
  const id = `kid-${index}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const style: React.CSSProperties = isOver && canHighlight
    ? { outline: '2px dashed var(--accent)', outlineOffset: -2 }
    : {}
  return (
    <div ref={setNodeRef} className="slot kidRect lunchLineSlot" data-index={index} style={style}>
      {children}
    </div>
  )
}

function DraggableCard({
  id,
  card,
  source,
  hide,
  selected,
  disabled,
  onClick,
}: {
  id: string
  card: PlaceholderCard
  source?: DragFoodSource
  hide?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
    data: { kind: 'food', card, source },
  })
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: card.color,
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    userSelect: 'none',
    touchAction: 'none',
    cursor: disabled ? 'not-allowed' : 'grab',
    opacity: hide ? 0 : disabled ? 0.55 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    outline: selected ? '2px solid var(--accent)' : undefined,
    outlineOffset: selected ? -2 : undefined,
    padding: '4px 8px',
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textAlign: 'center',
    lineHeight: 1.1,
    fontSize: 13,
    maxWidth: '100%',
    maxHeight: '100%',
    textShadow:
      '0 1px 2px rgba(0,0,0,0.45), 0 0 4px rgba(0,0,0,0.35)',
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      aria-label={card.title}
      aria-disabled={disabled || undefined}
      aria-pressed={selected ? true : undefined}
      onClick={disabled ? undefined : onClick}
      data-selectable="true"
      data-drag-id={id}
    >
      {card.title}
    </div>
  )
}

function CardPreview({ card, size }: { card: PlaceholderCard; size: 'shop' | 'fill' }) {
  const dim: React.CSSProperties =
    size === 'shop'
      ? { width: 'var(--slot-s)', height: 'var(--slot-s)' }
      : { width: '100%', height: '100%' }
  return (
    <div
      style={{
        ...dim,
        borderRadius: 10,
        background: card.color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
      }}
    >
      {card.title}
    </div>
  )
}

function TrayItem({
  index,
  card,
  hide,
  selected,
  onClick,
}: {
  index: number
  card: PlaceholderCard
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `tray-item-${index}`,
    data: { kind: 'food', card, source: { type: 'tray', index: index - 1 } },
  })
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: card.color,
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'grab',
    opacity: hide ? 0 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    outline: selected ? '2px solid var(--accent)' : undefined,
    outlineOffset: selected ? -2 : undefined,
    padding: '4px 8px',
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textAlign: 'center',
    lineHeight: 1.1,
    fontSize: 13,
    maxWidth: '100%',
    maxHeight: '100%',
    textShadow:
      '0 1px 2px rgba(0,0,0,0.45), 0 0 4px rgba(0,0,0,0.35)',
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      aria-label={card.title}
      aria-pressed={selected ? true : undefined}
      onClick={onClick}
      data-selectable="true"
      data-drag-id={`tray-item-${index}`}
    >
      {card.title}
    </div>
  )
}

function DraggableKid({
  id,
  kid,
  source,
  hide,
  selected,
  onClick,
}: {
  id: string
  kid: PlaceholderKid
  source: DragKidSource
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { kind: 'kid', kid, source },
  })
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: '#fff',
    display: 'grid',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'grab',
    opacity: hide ? 0 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    outline: selected ? '2px solid var(--accent)' : undefined,
    outlineOffset: selected ? -2 : undefined,
    overflow: 'hidden',
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      aria-label={kid.title}
      aria-pressed={selected ? true : undefined}
      onClick={onClick}
      data-selectable="true"
      data-drag-id={id}
    >
      <img className="kidSprite" src={kid.image} alt={kid.title} />
    </div>
  )
}

function KidPreview({ kid, size }: { kid: PlaceholderKid; size: 'shop' | 'fill' }) {
  const dim: React.CSSProperties =
    size === 'shop'
      ? { width: 'var(--kid-w)', height: 'var(--kid-h)' }
      : { width: '100%', height: '100%' }
  return (
    <div
      style={{
        ...dim,
        borderRadius: 12,
        background: '#fff',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      <img className="kidSprite" src={kid.image} alt={kid.title} />
    </div>
  )
}

function KidOptionToken({
  kid,
  index,
  selected,
  locked,
  onClick,
}: {
  kid: PlaceholderKid
  index: number
  selected: boolean
  locked: boolean
  onClick: () => void
}) {
  const id = `kid-option-${index}`
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: locked,
    data: { kind: 'kid', kid, source: { type: 'kid-option', index } },
  })
  const cardStyle: React.CSSProperties = {
    width: 'var(--kid-w)',
    height: 'var(--kid-h)',
    borderRadius: 12,
    border: '1px solid var(--border-color)',
    background: '#fff',
    display: 'grid',
    cursor: locked ? 'not-allowed' : 'grab',
    opacity: locked ? 0.5 : selected ? 1 : 0.95,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    outline: selected ? '2px solid var(--accent)' : undefined,
    outlineOffset: selected ? -2 : undefined,
  }
  return (
    <div
      className={`kidOptionToken ${selected ? 'isSelected' : ''} ${locked ? 'isLocked' : ''}`}
      data-selectable="true"
      onClick={locked ? undefined : onClick}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="kidOptionCircle"
        style={cardStyle}
        role="button"
        aria-label={kid.title}
        aria-pressed={selected ? true : undefined}
        data-drag-id={id}
      >
        <img className="kidSprite" src={kid.image} alt={kid.title} />
      </div>
    </div>
  )
}

type ShopParams = {
  tray?: Array<PlaceholderCard | null>
  kids?: PlaceholderKid[]
  round?: number
  health?: number
  trophies?: number
}

export default function Shop() {
  const { back, navigate, params } = useNavigation()
  const {
    tray: paramTray,
    kids: paramKids,
    round: paramRound,
    health: paramHealth,
    trophies: paramTrophies,
  } = (params as ShopParams) || {}

  const initialTray = React.useMemo(
    () => (Array.isArray(paramTray) ? paramTray : Array.from({ length: TRAY_SIZE }, () => null)),
    [paramTray],
  )
  const initialKids = React.useMemo(() => (Array.isArray(paramKids) ? paramKids : []), [paramKids])
  const initialRound = typeof paramRound === 'number' ? paramRound : 1
  const initialHealth = typeof paramHealth === 'number' ? paramHealth : MAX_HEALTH
  const initialTrophies = typeof paramTrophies === 'number' ? paramTrophies : 0

  const [tray, setTray] = React.useState<Array<PlaceholderCard | null>>(initialTray)
  const [shopItems, setShopItems] = React.useState<PlaceholderCard[]>(() => rollShopItems(initialTray, 5))
  const [kids, setKids] = React.useState<PlaceholderKid[]>(initialKids)
  const [kidOptions, setKidOptions] = React.useState<PlaceholderKid[]>(() =>
    pickRandomUnique(PLACEHOLDER_KIDS, 3),
  )
  const [hasDraftedKidThisRound, setHasDraftedKidThisRound] = React.useState(false)
  const [round, setRound] = React.useState(initialRound)
  const [health] = React.useState<number>(initialHealth)
  const [trophies] = React.useState<number>(initialTrophies)
  const [gold, setGold] = React.useState<number>(10)

  const [activeCard, setActiveCard] = React.useState<PlaceholderCard | null>(null)
  const [activeKid, setActiveKid] = React.useState<PlaceholderKid | null>(null)
  const [activeDragKind, setActiveDragKind] = React.useState<'food' | 'kid' | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeSize, setActiveSize] = React.useState<{ width: number; height: number } | null>(null)
  const [activeOffset, setActiveOffset] = React.useState<{ x: number; y: number } | null>(null)
  const [selectedShopIndex, setSelectedShopIndex] = React.useState<number | null>(null)
  const [selectedTrayIndex, setSelectedTrayIndex] = React.useState<number | null>(null)
  const [selectedKidOptionIndex, setSelectedKidOptionIndex] = React.useState<number | null>(null)
  const [selectedKidIndex, setSelectedKidIndex] = React.useState<number | null>(null)
  const hasPickedKid = hasDraftedKidThisRound

  // Ensure only one thing is selected at a time across all areas
  type Selection =
    | { type: 'shop'; index: number }
    | { type: 'tray'; index: number }
    | { type: 'kid-option'; index: number }
    | { type: 'kid'; index: number }
    | null

  const setSelection = React.useCallback((sel: Selection) => {
    setSelectedShopIndex(sel?.type === 'shop' ? sel.index : null)
    setSelectedTrayIndex(sel?.type === 'tray' ? sel.index : null)
    setSelectedKidOptionIndex(sel?.type === 'kid-option' ? sel.index : null)
    setSelectedKidIndex(sel?.type === 'kid' ? sel.index : null)
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const resetActive = () => {
    setActiveCard(null)
    setActiveKid(null)
    setActiveDragKind(null)
    setActiveId(null)
    setActiveSize(null)
    setActiveOffset(null)
  }

  const handleDragStart = (e: DragStartEvent) => {
    setSelectedShopIndex(null)
    setSelectedTrayIndex(null)
    setSelectedKidOptionIndex(null)
    setSelectedKidIndex(null)

    const data = e.active.data.current as DragData | undefined
    if (data?.kind === 'food' && data.card) setActiveCard(data.card)
    if (data?.kind === 'kid' && data.kid) setActiveKid(data.kid)
    setActiveDragKind(data?.kind ?? null)

    const id = String(e.active.id)
    setActiveId(id)

    const el = document.querySelector<HTMLElement>(`[data-drag-id="${id}"]`)
    const rect = el?.getBoundingClientRect()
    if (!rect) {
      setActiveSize(null)
      setActiveOffset(null)
      return
    }

    let overlayW = rect.width
    let overlayH = rect.height

    // pointer position within element
    const ev = (e as any).activatorEvent as Event | undefined
    let clientX: number | null = null
    let clientY: number | null = null
    if (ev) {
      if (ev instanceof PointerEvent || ev instanceof MouseEvent) {
        clientX = (ev as PointerEvent).clientX
        clientY = (ev as PointerEvent).clientY
      } else if (typeof TouchEvent !== 'undefined' && ev instanceof TouchEvent) {
        if (ev.touches && ev.touches[0]) {
          clientX = ev.touches[0].clientX
          clientY = ev.touches[0].clientY
        }
      } else if ((ev as any).touches && (ev as any).touches[0]) {
        clientX = (ev as any).touches[0].clientX
        clientY = (ev as any).touches[0].clientY
      }
    }

    const rx = clientX != null && rect.width > 0 ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0.5
    const ry = clientY != null && rect.height > 0 ? Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)) : 0.5

    // If dragging from tray slot 5, shrink overlay to square slot dimensions for food cards only.
    if (data?.kind === 'food' && data.source?.type === 'tray' && data.source.index === TRAY_SIZE - 1) {
      const squareEl = document.querySelector<HTMLElement>('.trayGrid .slot.square')
      const r = squareEl?.getBoundingClientRect()
      if (r) {
        overlayW = r.width
        overlayH = r.height
      }
    }

    const dx = rx * (rect.width - overlayW)
    const dy = ry * (rect.height - overlayH)
    setActiveSize({ width: overlayW, height: overlayH })
    setActiveOffset({ x: dx, y: dy })
  }

  const handleFoodDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id ? String(e.over.id) : null
    const data = e.active.data.current as DragData | undefined
    if (!hasPickedKid && data?.source?.type === 'shop') return resetActive()
    if (!overId || data?.kind !== 'food') return resetActive()

    const idx = Number(overId.split('-')[1]) - 1
    if (!overId.startsWith('tray-') || Number.isNaN(idx) || idx < 0 || idx >= tray.length) return resetActive()

    if (data.source?.type === 'tray') {
      const from = data.source.index
      const to = idx
      if (from !== to && from >= 0 && from < tray.length && to >= 0 && to < tray.length) {
        setTray(prev => {
          const next = [...prev]
          const tmp = next[to]
          next[to] = next[from]
          next[from] = tmp || null
          return next
        })
      }
    } else if (tray[idx] == null) {
      if (data.source?.type === 'shop') {
        if (gold < FOOD_COST) return resetActive()
        setGold(g => g - FOOD_COST)
        setShopItems(prev => prev.filter((_, i) => i !== data.source!.index))
      }
      setTray(prev => {
        if (prev[idx]) return prev
        const next = [...prev]
        next[idx] = data.card
        return next
      })
    }

    resetActive()
  }

  const handleKidDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id ? String(e.over.id) : null
    const data = e.active.data.current as DragData | undefined
    if (!overId || data?.kind !== 'kid') return resetActive()

    if (!overId.startsWith('kid-')) return resetActive()
    const idx = Number(overId.split('-')[1])
    if (Number.isNaN(idx) || idx < 0 || idx > kids.length) return resetActive()

    if (data.source.type === 'kid') {
      // Reorder existing kid within lunch line
      const from = data.source.index
      setKids(prev => {
        if (from < 0 || from >= prev.length) return prev
        const next = [...prev]
        let insert = Math.max(0, Math.min(idx, next.length))
        const [moved] = next.splice(from, 1)
        if (insert > from) insert -= 1
        next.splice(insert, 0, moved)
        return next
      })
    } else if (data.source.type === 'kid-option') {
      // Draft kid by dropping an option onto the lunch line (append or insert)
      draftKidAt(data.source.index, idx)
    }

    resetActive()
  }

  const handleAnyDragEnd = (e: DragEndEvent) => {
    const kind = (e.active.data.current as { kind?: string } | undefined)?.kind
    if (kind === 'food') return handleFoodDragEnd(e)
    if (kind === 'kid') return handleKidDragEnd(e)
    resetActive()
  }

  const handleSell = () => {
    if (!hasPickedKid) return
    if (selectedTrayIndex != null) {
      setTray(prev => {
        const next = [...prev]
        next[selectedTrayIndex] = null
        return next
      })
      setGold(g => g + FOOD_SELL_VALUE)
      setSelectedTrayIndex(null)
      return
    }
  }

  const handleBackgroundMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // Ignore clicks on selectable items, their popovers, or bottom controls
    if (target.closest('[data-selectable="true"], .cardPopover, .bottomBar, .pickKidContent, button')) return
    setSelection(null)
  }

  const draftKidAt = React.useCallback(
    (optionIndex: number, insertIndex?: number) => {
      if (hasDraftedKidThisRound) return
      const kid = kidOptions[optionIndex]
      if (!kid) return
      // Single-entry draft: place kid at requested position (or append) and lock pick phase
      setKids(prev => {
        const target = Math.max(0, Math.min(insertIndex ?? prev.length, prev.length))
        const next = [...prev]
        next.splice(target, 0, kid)
        return next
      })
      setHasDraftedKidThisRound(true)
      setSelectedKidOptionIndex(null)
    },
    [kidOptions, hasDraftedKidThisRound],
  )

  const handlePickKid = (index: number) => {
    draftKidAt(index)
  }

  const handleLunchTime = () => {
    if (!hasDraftedKidThisRound) return
    const saved = saveTeamSnapshot({
      tray,
      kids,
      round,
      health,
      trophies,
    })
    const opponent = getRandomOpponentSnapshot(saved.id)
    setRound(r => r + 1)
    setKidOptions(() => pickRandomUnique(PLACEHOLDER_KIDS, 3))
    setSelectedKidOptionIndex(null)
    setHasDraftedKidThisRound(false)
    navigate(SCREENS.BATTLE, { tray, kids, opponent, round, health, trophies })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleAnyDragEnd}
        onDragCancel={resetActive}
    >
      <div className={`shop ${hasPickedKid ? 'kidPicked' : 'kidPicking'}`} onMouseDown={handleBackgroundMouseDown}>
        <div className="topbar">
          <button onClick={back} className="btn ghost">Back</button>
          <div className="miniStats" aria-label="session stats">
            <span className="statChip" title="Gold" aria-label={`Gold ${gold}`}>
              <span className="coinIcon" aria-hidden="true" />
              <span className="statText">{gold}</span>
            </span>
            <span className="statChip" title="Health" aria-label={`Health ${health} out of ${MAX_HEALTH}`}>
              <span aria-hidden="true">HP</span>
              <span className="statText">
                {health}/{MAX_HEALTH}
              </span>
            </span>
            <span className="statChip" title="Trophies" aria-label={`Trophies ${trophies} out of ${MAX_TROPHIES}`}>
              <span aria-hidden="true">TR</span>
              <span className="statText">
                {trophies}/{MAX_TROPHIES}
              </span>
            </span>
            <span className="statChip" title="Round">
              <span className="statText">Round {round}</span>
            </span>
          </div>
        </div>

        <section className="lunchLineSection">
          <div className="sectionLabel">Lunch Line</div>
          <div className="lunchLineRow">
            {kids.map((kid, i) => (
              <LunchLineSlot index={i} key={`kid-slot-${i}`} canHighlight={activeDragKind === 'kid'}>
                <div className="kidCardWrap">
                  <DraggableKid
                    id={`kid-item-${i}`}
                    kid={kid}
                    source={{ type: 'kid', index: i }}
                    hide={activeId === `kid-item-${i}`}
                    selected={selectedKidIndex === i}
                    onClick={() =>
                      setSelection(selectedKidIndex === i ? null : { type: 'kid', index: i })
                    }
                  />
                  {selectedKidIndex === i ? (
                    <CardPopover item={kid} onClose={() => setSelectedKidIndex(null)} />
                  ) : null}
                </div>
              </LunchLineSlot>
            ))}
            <LunchLineSlot index={kids.length} key="kid-slot-append" canHighlight={activeDragKind === 'kid'}>
              <div className="kidAddHint" aria-hidden="true">
                {kids.length === 0 ? 'Drop Kid' : '+'}
              </div>
            </LunchLineSlot>
          </div>
        </section>

        <section className="mid">
          <div className="traySection">
            <div className="sectionLabel">Hot Lunch Tray</div>
            <div className="trayFit">
              <div className="trayViewport">
                <div className="trayFrame">
                  <div className="trayGrid">
                    {Array.from({ length: TRAY_SIZE }, (_, i) => {
                      const idx = i + 1
                      const item = tray[i]
                      return (
                        <TraySlot index={idx} key={idx} canHighlight={activeDragKind === 'food'}>
                          {item && (
                            <div className="trayCardWrap">
                              <TrayItem
                                index={idx}
                                card={item}
                                hide={activeId === `tray-item-${idx}`}
                                selected={selectedTrayIndex === i}
                                onClick={() =>
                                  setSelection(
                                    selectedTrayIndex === i ? null : { type: 'tray', index: i },
                                  )
                                }
                              />
                              {selectedTrayIndex === i ? (
                                <CardPopover item={item} onClose={() => setSelectedTrayIndex(null)} />
                              ) : null}
                            </div>
                          )}
                        </TraySlot>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="shopsSection">
          {!hasPickedKid ? (
            <div className="row pickKid">
              <div className="sectionLabel small">Add a kid to your Lunch Line.</div>
              <div className="pickKidContent">
                <div className="kidOptionsRow">
                  {kidOptions.map((kid, i) => {
                    const selected = selectedKidOptionIndex === i
                    const locked = hasDraftedKidThisRound
                    return (
                      <div key={`kid-option-${i}`} className="kidOptionWrap">
                        <KidOptionToken
                          kid={kid}
                          index={i}
                          selected={selected}
                          locked={locked}
                          onClick={() =>
                            setSelection(selected ? null : { type: 'kid-option', index: i })
                          }
                        />
                        {selected ? (
                          <CardPopover item={kid} onClose={() => setSelectedKidOptionIndex(null)} />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
                <button
                  className="btn cta fullWidth"
                  disabled={selectedKidOptionIndex == null}
                  onClick={() => {
                    if (selectedKidOptionIndex == null) return
                    handlePickKid(selectedKidOptionIndex)
                  }}
                >
                  {hasDraftedKidThisRound ? 'Kid Drafted' : 'Add'}
                </button>
              </div>
            </div>
          ) : (
            <div className="row foodShop">
              <div className="sectionLabel small">Food Shop</div>
              <div className="shopRow">
                {shopItems.map((card, i) => {
                  const id = `shop-${i}`
                  const selected = selectedShopIndex === i
                  return (
                    <div key={id} className="shopCardWrap">
                        <DraggableCard
                          id={id}
                          card={card}
                          source={{ type: 'shop', index: i }}
                          hide={activeId === id}
                          selected={selected}
                          disabled={!hasPickedKid}
                          onClick={() => setSelection(selected ? null : { type: 'shop', index: i })}
                        />
                        {selected ? (
                          <CardPopover item={card} onClose={() => setSelectedShopIndex(null)} />
                        ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

          <section className="bottomBar">
            <button className="btn cta" disabled={!hasPickedKid} onClick={handleLunchTime}>
              Lunch Time
            </button>
            <button
              className={`btn ghost ${selectedTrayIndex != null ? 'hasIndicator' : ''}`}
              disabled={!hasPickedKid || selectedTrayIndex == null}
              onClick={handleSell}
            >
              Sell
            </button>
            <button className="btn ghost">Storage</button>
            <button
              className="btn warning"
              disabled={!hasPickedKid || gold < REROLL_COST}
              onClick={() => {
                if (!hasPickedKid || gold < REROLL_COST) return
                setGold(g => g - REROLL_COST)
                setSelectedShopIndex(null)
                setShopItems(() => rollShopItems(tray, 5))
                if (!hasDraftedKidThisRound) {
                  setSelectedKidOptionIndex(null)
                  setKidOptions(() => pickRandomUnique(PLACEHOLDER_KIDS, 3))
                }
              }}
            >
              Reroll
            </button>
          </section>
      </div>

      <DragOverlay
        dropAnimation={null}
        modifiers={React.useMemo<Modifier[] | undefined>(() => {
          if (!activeOffset) return undefined
          const adjust: Modifier = ({ transform }) => ({
            ...transform,
            x: transform.x + activeOffset.x,
            y: transform.y + activeOffset.y,
          })
          return [adjust]
        }, [activeOffset])}
        style={{ pointerEvents: 'none' }}
      >
        {activeCard ? (
          <div style={activeSize ? { width: activeSize.width, height: activeSize.height } : undefined}>
            <CardPreview card={activeCard} size={activeSize ? 'fill' : 'shop'} />
          </div>
        ) : activeKid ? (
          <div style={activeSize ? { width: activeSize.width, height: activeSize.height } : undefined}>
            <KidPreview kid={activeKid} size={activeSize ? 'fill' : 'shop'} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}


