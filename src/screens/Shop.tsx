import React from 'react'
import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
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
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { PLACEHOLDER_CARDS, type PlaceholderCard } from '../data/cards'

type DragCardSource = { type: 'shop'; index: number } | { type: 'tray'; index: number }
type DragCardData = { kind: 'card'; card: PlaceholderCard; source?: DragCardSource }
const TRAY_SIZE = 5 as const

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

function DraggableCard({
  id,
  card,
  source,
}: {
  id: string
  card: PlaceholderCard
  source?: DragCardSource
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
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} role="button" aria-label={card.title}>
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

function TrayItem({ index, card, hide }: { index: number; card: PlaceholderCard; hide?: boolean }) {
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
  }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} role="button" aria-label={card.title}>
      {card.title}
    </div>
  )
}

export default function Shop() {
  const { back } = useNavigation()

  const [tray, setTray] = React.useState<Array<PlaceholderCard | null>>(
    Array.from({ length: TRAY_SIZE }, () => null),
  )
  const [shopItems, setShopItems] = React.useState<PlaceholderCard[]>(
    PLACEHOLDER_CARDS.slice(0, 5),
  )
  const [activeCard, setActiveCard] = React.useState<PlaceholderCard | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as DragCardData | undefined
    if (data?.kind === 'card' && data.card) setActiveCard(data.card)
    setActiveId(String(e.active.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id ? String(e.over.id) : null
    const data = e.active.data.current as DragCardData | undefined
    const card = data?.card

    if (!card || !overId || !overId.startsWith('tray-')) {
      setActiveCard(null)
      setActiveId(null)
      return
    }

    const idx = Number(overId.split('-')[1]) - 1 // zero-based
    if (Number.isNaN(idx) || idx < 0 || idx >= tray.length) {
      setActiveCard(null)
      setActiveId(null)
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

    setActiveCard(null)
    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveCard(null)
    setActiveId(null)
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
          <button onClick={back} className="btn ghost">Back</button>
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
                          <TrayItem index={idx} card={item} hide={activeId === `tray-item-${idx}`} />
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
              {shopItems.map((card, i) => (
                <DraggableCard
                  key={`shop-${i}`}
                  id={`shop-${i}`}
                  card={card}
                  source={{ type: 'shop', index: i }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bottomBar">
          <button className="btn cta">Lunch Time</button>
          <button className="btn ghost">Sell</button>
          <button className="btn ghost">Storage</button>
        </section>
      </div>
      <DragOverlay>{activeCard ? <CardPreview card={activeCard} size="shop" /> : null}</DragOverlay>
    </DndContext>
  )
}
