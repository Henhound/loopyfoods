import React from 'react'

import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import type { PlaceholderCard } from '../data/placeholder-food-cards'
import type { PlaceholderKid } from '../data/placeholder-kid-cards'
import type { TeamSnapshot } from '../app/teamStorage'
import { CardPopover } from '../components/CardPopover'

/* eslint-disable no-unused-vars -- allow named callback parameters inside shared type signatures */
type BattleParams = {
  tray?: Array<PlaceholderCard | null>
  kids?: PlaceholderKid[]
  opponent?: TeamSnapshot | null
  round?: number
  health?: number
  trophies?: number
}

type TrayViewProps = {
  label: string
  items: Array<PlaceholderCard | null>
  variant?: 'player' | 'opponent'
  framed?: boolean
  starPoints?: number | null
  selectedIndex?: number | null
  onSelect?: (_index: number) => void
  renderPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
}

type OpponentSummaryProps = {
  snapshot: TeamSnapshot
  starPoints: number | null
  selectedTrayIndex?: number | null
  onTraySelect?: (_index: number) => void
  renderTrayPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
  selectedKidIndex?: number | null
  onKidSelect?: (_index: number) => void
  renderKidPopover?: (_kid: PlaceholderKid, _index: number) => React.ReactNode
}

type PlayerBoardProps = {
  tray: Array<PlaceholderCard | null>
  kids: PlaceholderKid[]
  starPoints: number
  selectedTrayIndex?: number | null
  onTraySelect?: (_index: number) => void
  renderTrayPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
  selectedKidIndex?: number | null
  onKidSelect?: (_index: number) => void
  renderKidPopover?: (_kid: PlaceholderKid, _index: number) => React.ReactNode
}
/* eslint-enable no-unused-vars */

const trayCardStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 10,
  border: '1px solid var(--border-color)',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 700,
  userSelect: 'none',
  padding: '4px 8px',
  boxSizing: 'border-box',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  textAlign: 'center',
  lineHeight: 1.1,
  fontSize: 13,
  maxWidth: '100%',
  maxHeight: '100%',
  textShadow: '0 1px 2px rgba(0,0,0,0.45), 0 0 4px rgba(0,0,0,0.35)',
} as const

const calcStarPoints = (cards: Array<PlaceholderCard | null>): number =>
  cards.reduce((sum, card) => sum + (card?.baseStarValue ?? 0), 0)

function TrayView({
  label,
  items,
  variant = 'player',
  framed = true,
  starPoints,
  selectedIndex,
  onSelect,
  renderPopover,
}: TrayViewProps) {
  const traySize = items.length
  const viewportClass = `trayViewport${variant === 'opponent' ? ' trayThemeOpponent' : ''}`

  const content = (
    <>
      <div className="trayHeader">
        <div className="sectionLabel">{label}</div>
        <div className="starPill" aria-label={`${label} star points`}>
          <span className="starPillLabel">Star Points</span>
          <span className="starPillValue">{starPoints ?? '--'}</span>
        </div>
      </div>
      <div className="trayFit">
        <div className={viewportClass}>
          <div className="trayFrame">
            <div className="trayGrid">
              {Array.from({ length: traySize }, (_, i) => {
                const idx = i + 1
                const item = items[i]
                const slotCls = `slot ${idx === traySize ? 'rect' : 'square'}`
                const isSelected = selectedIndex === i
                return (
                  <div key={idx} className={slotCls} data-index={idx}>
                    {item ? (
                      <div className="trayCardWrap">
                        <div
                          style={{
                            ...trayCardStyle,
                            background: item.color,
                            cursor: onSelect ? 'pointer' : 'default',
                          }}
                          aria-label={item.title}
                          role={onSelect ? 'button' : undefined}
                          data-selectable={onSelect ? 'true' : undefined}
                          aria-pressed={isSelected ? true : undefined}
                          onClick={onSelect ? () => onSelect(i) : undefined}
                        >
                          {item.title}
                        </div>
                        {isSelected && renderPopover ? renderPopover(item, i) : null}
                      </div>
                    ) : (
                      <span>{idx}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  if (framed) {
    return <section className="traySection">{content}</section>
  }

  return <div className="trayInline">{content}</div>
}

function OpponentSummary({
  snapshot,
  starPoints,
  selectedTrayIndex,
  onTraySelect,
  renderTrayPopover,
  selectedKidIndex,
  onKidSelect,
  renderKidPopover,
}: OpponentSummaryProps) {
  return (
    <div className="battleOpponent">
      <div className="battleOpponentBody">
        <TrayView
          label="Opponent Tray"
          items={snapshot.tray}
          variant="opponent"
          framed={false}
          starPoints={starPoints ?? calcStarPoints(snapshot.tray)}
          selectedIndex={selectedTrayIndex}
          onSelect={onTraySelect}
          renderPopover={renderTrayPopover}
        />
        <div className="battleOpponentLunchLine">
          <div className="sectionLabel small">Lunch Line</div>
          <div className="lunchLineRow">
            {snapshot.kids.length === 0 ? (
              <div className="emptyLunchLine" role="status">
                No kids saved.
              </div>
            ) : (
              snapshot.kids.map((kid, i) => (
                <div
                  key={`opp-kid-${kid.title}-${i}`}
                  className="kidChip"
                  role={onKidSelect ? 'button' : undefined}
                  data-selectable={onKidSelect ? 'true' : undefined}
                  aria-pressed={selectedKidIndex === i ? true : undefined}
                  onClick={onKidSelect ? () => onKidSelect(i) : undefined}
                  style={{ cursor: onKidSelect ? 'pointer' : 'default' }}
                >
                  <img className="kidChipImg" src={kid.image} alt={kid.title} />
                  <span className="kidName">{kid.title}</span>
                  {selectedKidIndex === i && renderKidPopover ? renderKidPopover(kid, i) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerBoard({
  tray,
  kids,
  starPoints,
  selectedTrayIndex,
  onTraySelect,
  renderTrayPopover,
  selectedKidIndex,
  onKidSelect,
  renderKidPopover,
}: PlayerBoardProps) {
  return (
    <div className="battlePlayer">
      <div className="battleOpponentBody">
        <TrayView
          label="Hot Lunch Tray"
          items={tray}
          starPoints={starPoints}
          framed={false}
          selectedIndex={selectedTrayIndex}
          onSelect={onTraySelect}
          renderPopover={renderTrayPopover}
        />
        <div className="battleOpponentLunchLine">
          <div className="sectionLabel small">Lunch Line</div>
          <div className="lunchLineRow">
            {kids.length === 0 ? (
              <div className="emptyLunchLine" role="status">
                No kids drafted yet.
              </div>
            ) : (
              kids.map((kid, i) => (
                <div
                  key={`battle-kid-${i}`}
                  className="kidChip"
                  role={onKidSelect ? 'button' : undefined}
                  data-selectable={onKidSelect ? 'true' : undefined}
                  aria-pressed={selectedKidIndex === i ? true : undefined}
                  onClick={onKidSelect ? () => onKidSelect(i) : undefined}
                  style={{ cursor: onKidSelect ? 'pointer' : 'default' }}
                >
                  <img className="kidChipImg" src={kid.image} alt={kid.title} />
                  <span className="kidName">{kid.title}</span>
                  {selectedKidIndex === i && renderKidPopover ? renderKidPopover(kid, i) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Battle() {
  const { params, back } = useNavigation()
  const {
    tray: paramTray,
    kids: paramKids,
    opponent: paramOpponent,
    round: paramRound,
    health: paramHealth,
    trophies: paramTrophies,
  } = (params as BattleParams) || {}

  const tray = Array.isArray(paramTray) ? paramTray : Array.from({ length: 5 }, () => null)
  const kids = Array.isArray(paramKids) ? paramKids : []
  const opponent = paramOpponent ?? null
  const playerRound = typeof paramRound === 'number' ? paramRound : opponent?.round ?? null
  const playerHealth = typeof paramHealth === 'number' ? paramHealth : null
  const playerTrophies = typeof paramTrophies === 'number' ? paramTrophies : opponent?.trophies ?? null
  const playerStarPoints = calcStarPoints(tray)
  const opponentStarPoints = opponent ? calcStarPoints(opponent.tray) : null
  const roundDisplay = playerRound ?? '--'
  const healthDisplay = playerHealth ?? '--'
  const trophiesDisplay = playerTrophies ?? '--'
  const [selection, setSelection] = React.useState<
    | { scope: 'player-tray' | 'opponent-tray' | 'player-kid' | 'opponent-kid'; index: number }
    | null
  >(null)

  const toggleSelection = React.useCallback(
    (scope: 'player-tray' | 'opponent-tray' | 'player-kid' | 'opponent-kid', index: number) => {
      setSelection(prev => (prev && prev.scope === scope && prev.index === index ? null : { scope, index }))
    },
    [],
  )

  const clearSelection = React.useCallback(() => setSelection(null), [])

  const handleBackgroundMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-selectable="true"], .cardPopover, button')) return
    clearSelection()
  }

  return (
    <div
      className="battleScreen"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        padding: 10,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap)',
      }}
      onMouseDown={handleBackgroundMouseDown}
    >
      <div className="topbar">
        <button onClick={back} className="btn ghost">
          Back
        </button>
        <div className="miniStats" aria-label="battle info">
          <span className="statChip" title="Round">
            <span className="statText">Round {roundDisplay}</span>
          </span>
          <span className="statChip" title="Health">
            <span aria-hidden="true">HP</span>
            <span className="statText">{healthDisplay}</span>
          </span>
          <span className="statChip" title="Trophies">
            <span aria-hidden="true">TR</span>
            <span className="statText">{trophiesDisplay}</span>
          </span>
        </div>
      </div>

      <div className="panelStack">
        <div className="panelBox" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          {opponent ? (
            <OpponentSummary
              snapshot={opponent}
              starPoints={opponentStarPoints}
              selectedTrayIndex={selection?.scope === 'opponent-tray' ? selection.index : null}
              onTraySelect={idx => toggleSelection('opponent-tray', idx)}
              renderTrayPopover={item => <CardPopover item={item} onClose={clearSelection} />}
              selectedKidIndex={selection?.scope === 'opponent-kid' ? selection.index : null}
              onKidSelect={idx => toggleSelection('opponent-kid', idx)}
              renderKidPopover={kid => <CardPopover item={kid} onClose={clearSelection} />}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No stored opponent yet. Play a round to seed local storage.
            </div>
          )}
        </div>
        <div className="panelBox battlePlayerPanel">
          <PlayerBoard
            tray={tray}
            kids={kids}
            starPoints={playerStarPoints}
            selectedTrayIndex={selection?.scope === 'player-tray' ? selection.index : null}
            onTraySelect={idx => toggleSelection('player-tray', idx)}
            renderTrayPopover={item => <CardPopover item={item} onClose={clearSelection} />}
            selectedKidIndex={selection?.scope === 'player-kid' ? selection.index : null}
            onKidSelect={idx => toggleSelection('player-kid', idx)}
            renderKidPopover={kid => <CardPopover item={kid} onClose={clearSelection} />}
          />
        </div>
      </div>
    </div>
  )
}
