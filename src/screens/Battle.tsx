import React from 'react'

import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import { SCREENS } from '../app/screen'
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
  consumedFlags?: boolean[]
  activeSlot?: number | null
  onSelect?: (_index: number) => void
  renderPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
}

type OpponentSummaryProps = {
  snapshot: TeamSnapshot
  starPoints: number | null
  selectedTrayIndex?: number | null
  consumedTrayFlags?: boolean[]
  activeTraySlot?: number | null
  onTraySelect?: (_index: number) => void
  renderTrayPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
  selectedKidIndex?: number | null
  activeKidIndex?: number | null
  onKidSelect?: (_index: number) => void
  renderKidPopover?: (_kid: PlaceholderKid, _index: number) => React.ReactNode
}

type PlayerBoardProps = {
  tray: Array<PlaceholderCard | null>
  kids: PlaceholderKid[]
  starPoints: number
  selectedTrayIndex?: number | null
  consumedTrayFlags?: boolean[]
  activeTraySlot?: number | null
  onTraySelect?: (_index: number) => void
  renderTrayPopover?: (_item: PlaceholderCard, _index: number) => React.ReactNode
  selectedKidIndex?: number | null
  activeKidIndex?: number | null
  onKidSelect?: (_index: number) => void
  renderKidPopover?: (_kid: PlaceholderKid, _index: number) => React.ReactNode
}
/* eslint-enable no-unused-vars */

type TeamRuntimeState = {
  tray: Array<PlaceholderCard | null>
  kids: PlaceholderKid[]
  consumed: boolean[]
  kidIndex: number
  slotCursor: number
  done: boolean
}

type Bite = { kidIndex: number; slotIndex: number; food: PlaceholderCard }

type BattleLogEntry = {
  id: number
  team: 'player' | 'opponent'
  kidTitle: string
  foodTitle: string
  stars: number
  slotIndex: number
  kidIndex: number
}

type LastAction = { team: 'player' | 'opponent'; slotIndex: number; kidIndex: number; step: number }

type BattleState = {
  player: TeamRuntimeState
  opponent: TeamRuntimeState
  playerStars: number
  opponentStars: number
  log: BattleLogEntry[]
  step: number
  ended: boolean
  winner: 'player' | 'opponent' | 'tie' | null
  nextTeam: 'player' | 'opponent'
  lastAction: LastAction | null
}

function alignTeamState(
  state: TeamRuntimeState,
  startKidIndex = state.kidIndex,
  startSlotCursor = state.slotCursor,
): TeamRuntimeState {
  let kidIndex = startKidIndex
  let slotCursor = startSlotCursor

  while (kidIndex < state.kids.length) {
    const kid = state.kids[kidIndex]
    for (let s = slotCursor; s < state.tray.length; s++) {
      const food = state.tray[s]
      if (food && !state.consumed[s] && food.foodType === kid.foodType) {
        return { ...state, kidIndex, slotCursor: s, done: false }
      }
    }
    kidIndex += 1
    slotCursor = 0
  }

  return { ...state, kidIndex, slotCursor: 0, done: true }
}

function createTeamState(tray: Array<PlaceholderCard | null>, kids: PlaceholderKid[]): TeamRuntimeState {
  const base: TeamRuntimeState = {
    tray,
    kids,
    consumed: Array.from({ length: tray.length }, () => false),
    kidIndex: 0,
    slotCursor: 0,
    done: kids.length === 0 || tray.length === 0,
  }
  return alignTeamState(base, 0, 0)
}

function findNextBite(state: TeamRuntimeState): Bite | null {
  if (state.done) return null
  const kid = state.kids[state.kidIndex]
  if (!kid) return null
  for (let s = state.slotCursor; s < state.tray.length; s++) {
    const food = state.tray[s]
    if (food && !state.consumed[s] && food.foodType === kid.foodType) {
      return { kidIndex: state.kidIndex, slotIndex: s, food }
    }
  }
  // If cursor passed any remaining match, align will mark done on next step
  return null
}

function applyBite(state: TeamRuntimeState, bite: Bite): TeamRuntimeState {
  const consumed = [...state.consumed]
  consumed[bite.slotIndex] = true
  const next = alignTeamState(
    { ...state, consumed },
    bite.kidIndex,
    bite.slotIndex + 1,
  )
  return next
}

function computeWinner(playerStars: number, opponentStars: number): 'player' | 'opponent' | 'tie' {
  if (playerStars === opponentStars) return 'tie'
  return playerStars > opponentStars ? 'player' : 'opponent'
}

type BattleAction = { type: 'STEP' }

function reduceBattle(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'STEP': {
      if (state.ended) return state

      const teamOrder: Array<'player' | 'opponent'> =
        state.nextTeam === 'player' ? ['player', 'opponent'] : ['opponent', 'player']

      let chosenTeam: 'player' | 'opponent' | null = null
      let bite: Bite | null = null

      for (const team of teamOrder) {
        const candidate = findNextBite(team === 'player' ? state.player : state.opponent)
        if (candidate) {
          chosenTeam = team
          bite = candidate
          break
        }
      }

      if (!bite || !chosenTeam) {
        const playerDone = state.player.done || !findNextBite(state.player)
        const opponentDone = state.opponent.done || !findNextBite(state.opponent)
        const ended = playerDone && opponentDone
        const winner = ended ? computeWinner(state.playerStars, state.opponentStars) : state.winner
        return {
          ...state,
          player: { ...state.player, done: playerDone },
          opponent: { ...state.opponent, done: opponentDone },
          ended,
          winner,
        }
      }

      let playerState = state.player
      let opponentState = state.opponent
      let playerStars = state.playerStars
      let opponentStars = state.opponentStars

      if (chosenTeam === 'player') {
        playerState = applyBite(playerState, bite)
        playerStars += bite.food.baseStarValue
      } else {
        opponentState = applyBite(opponentState, bite)
        opponentStars += bite.food.baseStarValue
      }

      const step = state.step + 1
      const logEntry: BattleLogEntry = {
        id: step,
        team: chosenTeam,
        kidTitle: (chosenTeam === 'player' ? state.player.kids : state.opponent.kids)[bite.kidIndex]?.title ?? 'Kid',
        foodTitle: bite.food.title,
        stars: bite.food.baseStarValue,
        slotIndex: bite.slotIndex,
        kidIndex: bite.kidIndex,
      }

      const playerDone = playerState.done
      const opponentDone = opponentState.done
      const ended = playerDone && opponentDone
      const winner = ended ? computeWinner(playerStars, opponentStars) : null

      const nextTeam: 'player' | 'opponent' =
        chosenTeam === 'player' ? 'opponent' : 'player'

      return {
        ...state,
        player: playerState,
        opponent: opponentState,
        playerStars,
        opponentStars,
        log: [...state.log, logEntry],
        step,
        ended,
        winner,
        nextTeam,
        lastAction: { team: chosenTeam, slotIndex: bite.slotIndex, kidIndex: bite.kidIndex, step },
      }
    }
    default:
      return state
  }
}

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

function TrayView({
  label,
  items,
  variant = 'player',
  framed = true,
  starPoints,
  selectedIndex,
  consumedFlags,
  activeSlot,
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
                const isConsumed = consumedFlags?.[i] ?? false
                const isActive = activeSlot === i
                const slotCls = `slot ${idx === traySize ? 'rect' : 'square'}${isConsumed ? ' isEaten' : ''}${
                  isActive ? ' isActive' : ''
                }`
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
                            opacity: isConsumed ? 0.35 : 1,
                            boxShadow: isActive ? '0 0 0 2px var(--accent), 0 4px 12px rgba(0,0,0,0.16)' : undefined,
                            transform: isActive ? 'translateY(-1px)' : undefined,
                            transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 160ms ease',
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
  consumedTrayFlags,
  activeTraySlot,
  onTraySelect,
  renderTrayPopover,
  selectedKidIndex,
  activeKidIndex,
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
          starPoints={starPoints ?? 0}
          selectedIndex={selectedTrayIndex}
          consumedFlags={consumedTrayFlags}
          activeSlot={activeTraySlot}
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
                  data-active={activeKidIndex === i ? 'true' : undefined}
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
  consumedTrayFlags,
  activeTraySlot,
  onTraySelect,
  renderTrayPopover,
  selectedKidIndex,
  activeKidIndex,
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
          consumedFlags={consumedTrayFlags}
          activeSlot={activeTraySlot}
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
                  data-active={activeKidIndex === i ? 'true' : undefined}
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
  const { params, back, reset } = useNavigation()
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
  const opponentTray = opponent?.tray ?? Array.from({ length: tray.length }, () => null)
  const opponentKids = opponent?.kids ?? []
  const playerRound = typeof paramRound === 'number' ? paramRound : opponent?.round ?? null
  const playerHealth = typeof paramHealth === 'number' ? paramHealth : null
  const playerTrophies = typeof paramTrophies === 'number' ? paramTrophies : opponent?.trophies ?? null
  const roundDisplay = playerRound ?? '--'
  const healthDisplay = playerHealth ?? '--'
  const trophiesDisplay = playerTrophies ?? '--'

  const initialBattleState = React.useMemo<BattleState>(() => {
    const playerState = createTeamState(tray, kids)
    const opponentState = createTeamState(opponentTray, opponentKids)
    const ended = playerState.done && opponentState.done
    return {
      player: playerState,
      opponent: opponentState,
      playerStars: 0,
      opponentStars: opponent ? 0 : 0,
      log: [],
      step: 0,
      ended,
      winner: ended ? computeWinner(0, opponent ? 0 : 0) : null,
      nextTeam: 'player',
      lastAction: null,
    }
  }, [kids, opponent, opponentKids, opponentTray, tray])

  const [battleState, dispatch] = React.useReducer(reduceBattle, initialBattleState)
  const [fastForward, setFastForward] = React.useState(false)
  const fastForwardRef = React.useRef<number | null>(null)

  const [selection, setSelection] = React.useState<
    | { scope: 'player-tray' | 'opponent-tray' | 'player-kid' | 'opponent-kid'; index: number }
    | null
  >(null)

  const playerStarPoints = battleState.playerStars
  const opponentStarPoints = opponent ? battleState.opponentStars : null

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

  const handleStep = React.useCallback(() => {
    dispatch({ type: 'STEP' })
  }, [])

  React.useEffect(() => {
    if (!fastForward || battleState.ended) return undefined
    fastForwardRef.current = window.setTimeout(() => dispatch({ type: 'STEP' }), 1000)
    return () => {
      if (fastForwardRef.current) window.clearTimeout(fastForwardRef.current)
    }
  }, [fastForward, battleState.ended, battleState.step])

  React.useEffect(() => {
    if (battleState.ended && fastForward) {
      setFastForward(false)
    }
  }, [battleState.ended, fastForward])

  React.useEffect(
    () => () => {
      if (fastForwardRef.current) window.clearTimeout(fastForwardRef.current)
    },
    [],
  )

  const handleBackToShop = React.useCallback(() => {
    reset(SCREENS.SHOP, { tray, kids, round: (playerRound ?? 1) + 1, health: playerHealth, trophies: playerTrophies })
  }, [kids, playerHealth, playerRound, playerTrophies, reset, tray])

  const playerActiveSlot = battleState.player.done ? null : battleState.player.slotCursor
  const opponentActiveSlot = battleState.opponent.done ? null : battleState.opponent.slotCursor
  const playerActiveKid = battleState.player.done ? null : battleState.player.kidIndex
  const opponentActiveKid = battleState.opponent.done ? null : battleState.opponent.kidIndex

  const winnerLabel =
    battleState.winner === 'player'
      ? 'You win!'
      : battleState.winner === 'opponent'
        ? 'Opponent wins'
        : battleState.winner === 'tie'
          ? 'Tie game'
          : null

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
        <div className="topbarLeft">
          <button onClick={back} className="btn ghost">
            Back
          </button>
          <div className="battleControls" aria-label="battle controls">
            <button type="button" className="btn mini" onClick={handleStep} disabled={battleState.ended}>
              1 step
            </button>
            <button
              type="button"
              className="btn mini"
              onClick={() => setFastForward(ff => !ff)}
              disabled={battleState.ended}
              aria-pressed={fastForward}
            >
              {fastForward ? 'Stop' : 'Fast forward'}
            </button>
          </div>
        </div>
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
          <span className="statChip" title="Fast forward state">
            <span aria-hidden="true">FF</span>
            <span className="statText">{fastForward && !battleState.ended ? 'On' : 'Off'}</span>
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
              consumedTrayFlags={battleState.opponent.consumed}
              activeTraySlot={opponentActiveSlot}
              onTraySelect={idx => toggleSelection('opponent-tray', idx)}
              renderTrayPopover={item => <CardPopover item={item} onClose={clearSelection} />}
              selectedKidIndex={selection?.scope === 'opponent-kid' ? selection.index : null}
              activeKidIndex={opponentActiveKid}
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
            consumedTrayFlags={battleState.player.consumed}
            activeTraySlot={playerActiveSlot}
            onTraySelect={idx => toggleSelection('player-tray', idx)}
            renderTrayPopover={item => <CardPopover item={item} onClose={clearSelection} />}
            selectedKidIndex={selection?.scope === 'player-kid' ? selection.index : null}
            activeKidIndex={playerActiveKid}
            onKidSelect={idx => toggleSelection('player-kid', idx)}
            renderKidPopover={kid => <CardPopover item={kid} onClose={clearSelection} />}
          />
        </div>
      </div>

      <div className="panelBox battleLogBox">
        <div className="battleLogHeader">
          <div className="sectionLabel">Battle Log</div>
          <div className="battleSummary">
            <span className="statChip small">
              <span className="statText">You: {playerStarPoints}</span>
            </span>
            <span className="statChip small">
              <span className="statText">Opponent: {opponentStarPoints ?? '--'}</span>
            </span>
            {winnerLabel ? <span className="winnerLabel">{winnerLabel}</span> : null}
          </div>
        </div>
        <div className="battleLogList" role="log" aria-live="polite">
          {battleState.log.length === 0 ? (
            <div className="emptyLog">Step through the battle to see actions.</div>
          ) : (
            <ul>
              {battleState.log
                .slice()
                .reverse()
                .map(entry => (
                  <li key={entry.id} className={`logItem ${entry.team === 'player' ? 'logPlayer' : 'logOpponent'}`}>
                    <span className="logStep">#{entry.id}</span>
                    <span className="logTeam">{entry.team === 'player' ? 'You' : 'Opponent'}</span>
                    <span className="logText">
                      {entry.kidTitle} ate {entry.foodTitle} (+{entry.stars}⭐)
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {battleState.ended ? (
        <div className="battleFooter">
          <button className="btn cta fullWidth" onClick={handleBackToShop}>
            Back to the shop
          </button>
        </div>
      ) : null}
    </div>
  )
}
