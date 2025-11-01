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
import { PLACEHOLDER_JUDGES, type PlaceholderJudge } from '../data/placeholder-judge-cards'

type DragFoodSource = { type: 'shop'; index: number } | { type: 'tray'; index: number }
type DragJudgeSource = { type: 'judge-shop'; index: number } | { type: 'judge'; index: number }
type DragData =
  | { kind: 'food'; card: PlaceholderCard; source?: DragFoodSource }
  | { kind: 'judge'; judge: PlaceholderJudge; source?: DragJudgeSource }

const TRAY_SIZE = 5 as const

function pickRandomWithReplacement<T>(source: readonly T[], count: number): T[] {
  const out: T[] = []
  if (!source.length || count <= 0) return out
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * source.length)
    out.push(source[idx])
  }
  return out
}

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

function JudgeSlot({ index, children }: { index: number; children?: React.ReactNode }) {
  const id = `judge-${index}`
  const { setNodeRef, isOver } = useDroppable({ id })
  const style: React.CSSProperties = isOver
    ? { outline: '2px dashed var(--accent)', outlineOffset: -2 }
    : {}
  return (
    <div ref={setNodeRef} className="slot circle" data-index={index} style={style}>
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
  onClick,
}: {
  id: string
  card: PlaceholderCard
  source?: DragFoodSource
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { kind: 'food', card, source },
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

function DraggableJudge({
  id,
  judge,
  source,
  hide,
  selected,
  onClick,
}: {
  id: string
  judge: PlaceholderJudge
  source?: DragJudgeSource
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { kind: 'judge', judge, source },
  })
  const style: React.CSSProperties = {
    width: 'var(--slot-s)',
    height: 'var(--slot-s)',
    borderRadius: 999,
    border: '1px solid var(--border-color)',
    background: '#fff',
    color: '#111',
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
    fontSize: 22,
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      aria-label={judge.title}
      aria-pressed={selected ? true : undefined}
      onClick={onClick}
      data-selectable="true"
      data-drag-id={id}
    >
      <span aria-hidden="true">{judge.emoji}</span>
    </div>
  )
}

function JudgeItem({
  index,
  judge,
  hide,
  selected,
  onClick,
}: {
  index: number
  judge: PlaceholderJudge
  hide?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `judge-item-${index}`,
    data: { kind: 'judge', judge, source: { type: 'judge', index: index - 1 } },
  })
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    border: '1px solid var(--border-color)',
    background: '#fff',
    color: '#111',
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
    fontSize: 24,
  }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      aria-label={judge.title}
      aria-pressed={selected ? true : undefined}
      onClick={onClick}
      data-selectable="true"
      data-drag-id={`judge-item-${index}`}
    >
      <span aria-hidden="true">{judge.emoji}</span>
    </div>
  )
}

function JudgePreview({ judge, size }: { judge: PlaceholderJudge; size: 'shop' | 'fill' }) {
  const dim: React.CSSProperties =
    size === 'shop'
      ? { width: 'var(--slot-s)', height: 'var(--slot-s)' }
      : { width: '100%', height: '100%' }
  return (
    <div
      style={{
        ...dim,
        borderRadius: 999,
        background: '#fff',
        border: '1px solid var(--border-color)',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        color: '#111',
        fontSize: 24,
      }}
    >
      <span aria-hidden="true">{judge.emoji}</span>
    </div>
  )
}

export default function Shop() {
  const { back } = useNavigation()

  const [tray, setTray] = React.useState<Array<PlaceholderCard | null>>(
    Array.from({ length: TRAY_SIZE }, () => null),
  )
  const [shopItems, setShopItems] = React.useState<PlaceholderCard[]>(() =>
    pickRandomWithReplacement(PLACEHOLDER_CARDS, 5),
  )
  const [judges, setJudges] = React.useState<Array<PlaceholderJudge | null>>(
    Array.from({ length: 3 }, () => null),
  )
  const [judgeShopItems, setJudgeShopItems] = React.useState<PlaceholderJudge[]>(() =>
    pickRandomWithReplacement(PLACEHOLDER_JUDGES, 2),
  )

  const [activeCard, setActiveCard] = React.useState<PlaceholderCard | null>(null)
  const [activeJudge, setActiveJudge] = React.useState<PlaceholderJudge | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeSize, setActiveSize] = React.useState<{ width: number; height: number } | null>(null)
  const [activeOffset, setActiveOffset] = React.useState<{ x: number; y: number } | null>(null)
  const [selectedShopIndex, setSelectedShopIndex] = React.useState<number | null>(null)
  const [selectedTrayIndex, setSelectedTrayIndex] = React.useState<number | null>(null)
  const [selectedJudgeShopIndex, setSelectedJudgeShopIndex] = React.useState<number | null>(null)
  const [selectedJudgeIndex, setSelectedJudgeIndex] = React.useState<number | null>(null)

  // Ensure only one thing is selected at a time across all areas
  type Selection =
    | { type: 'shop'; index: number }
    | { type: 'tray'; index: number }
    | { type: 'judge-shop'; index: number }
    | { type: 'judge'; index: number }
    | null

  const setSelection = React.useCallback((sel: Selection) => {
    setSelectedShopIndex(sel?.type === 'shop' ? sel.index : null)
    setSelectedTrayIndex(sel?.type === 'tray' ? sel.index : null)
    setSelectedJudgeShopIndex(sel?.type === 'judge-shop' ? sel.index : null)
    setSelectedJudgeIndex(sel?.type === 'judge' ? sel.index : null)
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const resetActive = () => {
    setActiveCard(null)
    setActiveJudge(null)
    setActiveId(null)
    setActiveSize(null)
    setActiveOffset(null)
  }

  const handleDragStart = (e: DragStartEvent) => {
    setSelectedShopIndex(null)
    setSelectedTrayIndex(null)
    setSelectedJudgeShopIndex(null)
    setSelectedJudgeIndex(null)

    const data = e.active.data.current as DragData | undefined
    if (data?.kind === 'food' && data.card) setActiveCard(data.card)
    if (data?.kind === 'judge' && data.judge) setActiveJudge(data.judge)

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
      setTray(prev => {
        if (prev[idx]) return prev
        const next = [...prev]
        next[idx] = data.card
        return next
      })
      if (data.source?.type === 'shop') {
        setShopItems(prev => prev.filter((_, i) => i !== data.source!.index))
      }
    }

    resetActive()
  }

  const handleJudgeDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id ? String(e.over.id) : null
    const data = e.active.data.current as DragData | undefined
    if (!overId || data?.kind !== 'judge') return resetActive()

    const idx = Number(overId.split('-')[1]) - 1
    if (!overId.startsWith('judge-') || Number.isNaN(idx) || idx < 0 || idx >= judges.length) return resetActive()

    if (data.source?.type === 'judge') {
      const from = data.source.index
      const to = idx
      if (from !== to && from >= 0 && from < judges.length && to >= 0 && to < judges.length) {
        setJudges(prev => {
          const next = [...prev]
          const tmp = next[to]
          next[to] = next[from]
          next[from] = tmp || null
          return next
        })
      }
    } else if (judges[idx] == null) {
      setJudges(prev => {
        if (prev[idx]) return prev
        const next = [...prev]
        next[idx] = data.judge
        return next
      })
      if (data.source?.type === 'judge-shop') {
        setJudgeShopItems(prev => prev.filter((_, i) => i !== data.source!.index))
      }
    }

    resetActive()
  }

  const handleAnyDragEnd = (e: DragEndEvent) => {
    const kind = (e.active.data.current as { kind?: string } | undefined)?.kind
    if (kind === 'food') return handleFoodDragEnd(e)
    if (kind === 'judge') return handleJudgeDragEnd(e)
    resetActive()
  }

  const handleSell = () => {
    if (selectedTrayIndex != null) {
      setTray(prev => {
        const next = [...prev]
        next[selectedTrayIndex] = null
        return next
      })
      setSelectedTrayIndex(null)
      return
    }
    if (selectedJudgeIndex != null) {
      setJudges(prev => {
        const next = [...prev]
        next[selectedJudgeIndex] = null
        return next
      })
      setSelectedJudgeIndex(null)
      return
    }
  }

  const handleBackgroundMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // Ignore clicks on selectable items or their popovers
    if (target.closest('[data-selectable="true"], .cardPopover')) return
    setSelection(null)
  }

  function CardPopover({
    item,
    onClose,
  }: {
    item: { title: string; description: string }
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
      <div ref={ref} className="cardPopover" role="dialog" aria-label={`${item.title} details`}>
        <div className="cardPopoverHeader">
          <strong className="cardTitle">{item.title}</strong>
          <button className="popoverClose" aria-label="Close" onClick={onClose}>
            A-
          </button>
        </div>
        <div className="cardPopoverBody">{item.description}</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleAnyDragEnd}
      onDragCancel={resetActive}
    >
      <div className="shop" onMouseDown={handleBackgroundMouseDown}>
        <div className="topbar">
          <button onClick={back} className="btn ghost">Back</button>
          <div className="miniStats" aria-label="session stats">
            <span title="Gold">Gold 10</span>
            <span title="Health">Health 2/5</span>
            <span title="Trophies">Trophies 3/10</span>
            <span title="Round">Round 1</span>
            <span title="Star Target">Target 100</span>
          </div>
        </div>

        <section className="judgesSection">
          <div className="sectionLabel">Judges</div>
          <div className="judgeRow">
            {judges.map((j, i) => {
              const idx = i + 1
              return (
                <JudgeSlot index={idx} key={idx}>
                  {j && (
                    <div className="trayCardWrap">
                        <JudgeItem
                          index={idx}
                          judge={j}
                          hide={activeId === `judge-item-${idx}`}
                          selected={selectedJudgeIndex === i}
                          onClick={() =>
                            setSelection(selectedJudgeIndex === i ? null : { type: 'judge', index: i })
                          }
                        />
                        {selectedJudgeIndex === i ? (
                          <CardPopover item={j} onClose={() => setSelectedJudgeIndex(null)} />
                        ) : null}
                    </div>
                  )}
                </JudgeSlot>
              )
            })}
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
        </section>

        <section className="shopsSection">
          <div className="judgeRowWrap">
            <div className="panelBox judgeShopBox">
              <div className="sectionLabel small">Judge Shop</div>
              <div className="shopRow">
                {judgeShopItems.map((j, i) => {
                  const id = `judge-shop-${i}`
                  const selected = selectedJudgeShopIndex === i
                  return (
                    <div key={id} className="shopCardWrap">
                        <DraggableJudge
                          id={id}
                          judge={j}
                          source={{ type: 'judge-shop', index: i }}
                          hide={activeId === id}
                          selected={selected}
                          onClick={() =>
                            setSelection(selected ? null : { type: 'judge-shop', index: i })
                          }
                        />
                        {selected ? (
                          <CardPopover item={j} onClose={() => setSelectedJudgeShopIndex(null)} />
                        ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="panelBox actionsZone">
              <div className="actionsRow">
                <button className="btn subtle">Upgrade Tray</button>
                <button
                  className="btn warning"
                  onClick={() => {
                    setSelectedShopIndex(null)
                    setShopItems(() => pickRandomWithReplacement(PLACEHOLDER_CARDS, 5))
                  }}
                >
                  Reroll
                </button>
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
        </section>

          <section className="bottomBar">
            <button className="btn cta">Lunch Time</button>
            <button
              className="btn ghost"
              disabled={selectedTrayIndex == null && selectedJudgeIndex == null}
              onClick={handleSell}
            >
              Sell
            </button>
            <button className="btn ghost">Storage</button>
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
        ) : activeJudge ? (
          <div style={activeSize ? { width: activeSize.width, height: activeSize.height } : undefined}>
            <JudgePreview judge={activeJudge} size={activeSize ? 'fill' : 'shop'} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

