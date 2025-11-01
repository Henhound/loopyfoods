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
import { PLACEHOLDER_CARDS, type PlaceholderCard } from '../data/placeholder-food-cards'

/**
 * dnd-kit drag metadata for cards. We keep track of where a drag started
 * (shop or tray) so we can apply the correct logic on drop.
 */
type DragCardSource = { type: 'shop'; index: number } | { type: 'tray'; index: number }
type DragCardData = { kind: 'card'; card: PlaceholderCard; source?: DragCardSource }
const TRAY_SIZE = 5 as const

/**
 * A single droppable slot in the tray grid.
 * Index is 1-based in the UI to align with labels; we convert to 0-based
 * where needed when updating state.
 */
function TraySlot({ index, children }: { index: number; children?: React.ReactNode }) {
  const id = `tray-${index}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const cls = `slot ${index === TRAY_SIZE ? 'rect' : 'square'}`
  const style: React.CSSProperties = isOver
    ? { outline: '2px dashed var(--accent)', outlineOffset: -2 }
    : {}
  return (
    <div ref={setNodeRef} className={cls} data-index={index} style={style}>
      {children ?? <span>{index}</span>}
    </div>
  )
}

/**
 * Draggable representation of a shop card.
 * Pass `hide` to visually hide the origin while the overlay is dragging.
 */
function DraggableCard({
  id,
  card,
  source,
  hide,
  selected,
  onClick,
}: {
  id: string
  card: PlaceholderCard
  source?: DragCardSource
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { kind: 'card', card, source },
  })
  const style: React.CSSProperties = {
    width: 'var(--slot-s)',
    height: 'var(--slot-s)',
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
      data-drag-id={id}
    >
      {card.title}
    </div>
  )
}

/**
 * Visual used inside DragOverlay and to fill a tray slot.
 */
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

/**
 * Draggable item already placed in the tray grid.
 * The `hide` flag hides the original while it is being dragged so only the overlay is visible.
 */
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
    data: { kind: 'card', card, source: { type: 'tray', index: index - 1 } },
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
      data-drag-id={`tray-item-${index}`}
    >
      {card.title}
    </div>
  )
}

export default function Shop() {
  const { back } = useNavigation()

  const [tray, setTray] = React.useState<Array<PlaceholderCard | null>>(
    Array.from({ length: TRAY_SIZE }, () => null),
  )
  const [shopItems, setShopItems] = React.useState<PlaceholderCard[]>(PLACEHOLDER_CARDS.slice(0, 5))
  const [activeCard, setActiveCard] = React.useState<PlaceholderCard | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeSize, setActiveSize] = React.useState<{ width: number; height: number } | null>(null)
  const [activeOffset, setActiveOffset] = React.useState<{ x: number; y: number } | null>(null)
  const [selectedShopIndex, setSelectedShopIndex] = React.useState<number | null>(null)
  const [selectedTrayIndex, setSelectedTrayIndex] = React.useState<number | null>(null)

  // Pointer-only sensor with small activation distance to prevent accidental drags.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  // Small helper to clear active drag state.
  const resetActive = () => {
    setActiveCard(null)
    setActiveId(null)
    setActiveSize(null)
    setActiveOffset(null)
  }

  // Record which card/id is actively being dragged so we can render an overlay
  // and optionally hide the original element during the drag.
  const handleDragStart = (e: DragStartEvent) => {
    // Clear selection when a drag begins
    setSelectedShopIndex(null)
    setSelectedTrayIndex(null)
    const data = e.active.data.current as DragCardData | undefined
    if (data?.kind === 'card' && data.card) setActiveCard(data.card)
    const id = String(e.active.id)
    setActiveId(id)
    // Measure size for overlay. Special case: if dragging from tray slot 5 (rect),
    // use the size of a square tray slot so the overlay isn't oversized.
    const el = document.querySelector<HTMLElement>(`[data-drag-id="${id}"]`)
    const rect = el?.getBoundingClientRect()
    if (!rect) {
      setActiveSize(null)
      setActiveOffset(null)
      return
    }

    // Default overlay matches original size, no offset.
    let overlayW = rect.width
    let overlayH = rect.height

    // Compute pointer position within original element at drag start.
    const ev = (e as unknown as { activatorEvent?: Event }).activatorEvent
    let clientX: number | null = null
    let clientY: number | null = null
    if (ev) {
      if (ev instanceof PointerEvent || ev instanceof MouseEvent) {
        clientX = ev.clientX
        clientY = ev.clientY
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

    const rx =
      clientX != null && rect.width > 0
        ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        : 0.5
    const ry =
      clientY != null && rect.height > 0
        ? Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        : 0.5

    // If dragging from tray slot 5, shrink overlay to square slot dimensions.
    if (data?.source?.type === 'tray' && data.source.index === TRAY_SIZE - 1) {
      const squareEl = document.querySelector<HTMLElement>('.trayGrid .slot.square')
      const r = squareEl?.getBoundingClientRect()
      if (r) {
        overlayW = r.width
        overlayH = r.height
      }
    }

    // Offset overlay so the pointer remains over the same relative point.
    const dx = rx * (rect.width - overlayW)
    const dy = ry * (rect.height - overlayH)

    setActiveSize({ width: overlayW, height: overlayH })
    setActiveOffset({ x: dx, y: dy })
  }

  // On drop: accept shop->tray into empty slot; allow tray<->tray swap; ignore others.
  const handleDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id ? String(e.over.id) : null
    const data = e.active.data.current as DragCardData | undefined
    const card = data?.card

    if (!card || !overId || !overId.startsWith('tray-')) {
      resetActive()
      return
    }

    const idx = Number(overId.split('-')[1]) - 1 // zero-based
    if (Number.isNaN(idx) || idx < 0 || idx >= tray.length) {
      resetActive()
      return
    }

    if (data?.source?.type === 'tray') {
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
      // From shop -> tray only into empty slot
      setTray(prev => {
        if (prev[idx]) return prev
        const next = [...prev]
        next[idx] = card
        return next
      })
      if (data?.source?.type === 'shop') {
        setShopItems(prev => prev.filter((_, i) => i !== data.source!.index))
      }
    }

    resetActive()
  }

  const handleDragCancel = () => {
    resetActive()
  }

  function CardPopover({
    card,
    onClose,
  }: {
    card: PlaceholderCard
    onClose: () => void
  }) {
    const ref = React.useRef<HTMLDivElement | null>(null)
    React.useLayoutEffect(() => {
      const el = ref.current
      if (!el) return
      const anchor = el.parentElement as HTMLElement | null
      if (!anchor) return
      const margin = 8
      const place = () => {
        const a = anchor.getBoundingClientRect()
        const popW = el.offsetWidth
        const popH = el.offsetHeight
        let boundLeft = margin
        let boundTop = margin
        let boundRight = window.innerWidth - margin
        let boundBottom = window.innerHeight - margin
        const traySection = anchor.closest<HTMLElement>('.traySection')
        if (traySection) {
          const tr = traySection.getBoundingClientRect()
          boundLeft = Math.max(boundLeft, tr.left + margin)
          boundRight = Math.min(boundRight, tr.right - margin)
          boundTop = Math.max(boundTop, tr.top + margin)
          boundBottom = Math.min(boundBottom, tr.bottom - margin)
        }
        const spaceAbove = a.top - boundTop
        const spaceBelow = boundBottom - a.bottom
        const preferTop = spaceAbove >= popH || spaceAbove >= spaceBelow
        const sideTop = preferTop
        const desiredTop = sideTop ? a.top - popH - margin : a.bottom + margin
        const desiredLeft = a.left + a.width / 2 - popW / 2
        const topVp = Math.max(boundTop, Math.min(desiredTop, boundBottom - popH))
        const leftVp = Math.max(boundLeft, Math.min(desiredLeft, boundRight - popW))
        const relTop = topVp - a.top
        const relLeft = leftVp - a.left
        el.style.top = `${relTop}px`
        el.style.left = `${relLeft}px`
        el.style.bottom = 'auto'
        el.style.transform = 'none'
      }
      place()
      window.addEventListener('resize', place)
      window.addEventListener('scroll', place)
      return () => {
        window.removeEventListener('resize', place)
        window.removeEventListener('scroll', place)
      }
    }, [])
    return (
      <div ref={ref} className="cardPopover" role="dialog" aria-label={`${card.title} details`}>
        <div className="cardPopoverHeader">
          <strong className="cardTitle">{card.title}</strong>
          <button className="popoverClose" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cardPopoverBody">{card.description}</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="shop">
        <div className="topbar">
          <button onClick={back} className="btn ghost">
            Back
          </button>
          <div className="miniStats" aria-label="session stats">
            <span title="Gold">Gold 10</span>
            <span title="Health">Health 2/5</span>
            <span title="Trophies">Trophies 3/10</span>
            <span title="Round">Round 1</span>
            <span title="Star Target">Target 100</span>
          </div>
        </div>

        {/* selection info removed for more space */}

        <section className="judgesSection">
          <div className="sectionLabel">Judges</div>
          <div className="judgeRow">
            {[0, 1, 2].map(i => (
              <div key={i} className="slot circle" />
            ))}
          </div>
        </section>

        <section className="mid">
          <div className="traySection">
            <div className="sectionLabel">Food Loop</div>
            <div className="trayFit">
              <div className="trayViewport">
                <div className="trayGrid">
                  {Array.from({ length: TRAY_SIZE }, (_, i) => {
                    const idx = i + 1
                    const item = tray[i]
                    return (
                      <TraySlot index={idx} key={idx}>
                        {item && (
                          <div className="trayCardWrap">
                            <TrayItem
                              index={idx}
                              card={item}
                              hide={activeId === `tray-item-${idx}`}
                              selected={selectedTrayIndex === i}
                              onClick={() => setSelectedTrayIndex(s => (s === i ? null : i))}
                            />
                            {selectedTrayIndex === i ? (
                              <CardPopover card={item} onClose={() => setSelectedTrayIndex(null)} />
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
        </section>

        <section className="shopsSection">
          <div className="judgeRowWrap">
            <div className="panelBox judgeShopBox">
              <div className="sectionLabel small">Judge Shop</div>
              <div className="shopRow">
                {[0, 1].map(i => (
                  <div key={i} className="slot circle" />
                ))}
              </div>
            </div>
            <div className="panelBox actionsZone">
              <div className="actionsRow">
                <button className="btn subtle">Upgrade Tray</button>
                <button className="btn warning">Reroll</button>
              </div>
            </div>
          </div>
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
                      onClick={() => setSelectedShopIndex(s => (s === i ? null : i))}
                    />
                    {selected ? (
                      <CardPopover card={card} onClose={() => setSelectedShopIndex(null)} />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bottomBar">
          <button className="btn cta">Lunch Time</button>
          <button className="btn ghost">Sell</button>
          <button className="btn ghost">Storage</button>
        </section>
      </div>
      {/* Disable default return animation to avoid snap-back on valid drops. */}
      {/** Apply an offset when the overlay size differs (slot 5 case) to keep it under the pointer. */}
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
          <div
            style={activeSize ? { width: activeSize.width, height: activeSize.height } : undefined}
          >
            <CardPreview card={activeCard} size={activeSize ? 'fill' : 'shop'} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
