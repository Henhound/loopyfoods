import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import type { PlaceholderCard } from '../data/placeholder-food-cards'
import type { PlaceholderKid } from '../data/placeholder-kid-cards'
import type { TeamSnapshot } from '../app/teamStorage'

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

const calcStarPoints = (cards: Array<PlaceholderCard | null>): number =>
  cards.reduce((sum, card) => sum + (card?.baseStarValue ?? 0), 0)

function TrayView({ label, items, variant = 'player', framed = true, starPoints }: TrayViewProps) {
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
                return (
                  <div key={idx} className={slotCls} data-index={idx}>
                    {item ? (
                      <div className="trayCardWrap">
                        <div style={{ ...trayCardStyle, background: item.color }} aria-label={item.title}>
                          {item.title}
                        </div>
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

function OpponentSummary({ snapshot, starPoints }: { snapshot: TeamSnapshot; starPoints: number | null }) {
  return (
    <div className="battleOpponent">
      <div className="battleOpponentBody">
        <TrayView
          label="Opponent Tray"
          items={snapshot.tray}
          variant="opponent"
          framed={false}
          starPoints={starPoints ?? calcStarPoints(snapshot.tray)}
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
                <div key={`opp-kid-${kid.title}-${i}`} className="kidChip">
                  <img className="kidChipImg" src={kid.image} alt={kid.title} />
                  <span className="kidName">{kid.title}</span>
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
}: {
  tray: Array<PlaceholderCard | null>
  kids: PlaceholderKid[]
  starPoints: number
}) {
  return (
    <div className="battlePlayer">
      <div className="battleOpponentBody">
        <TrayView label="Hot Lunch Tray" items={tray} starPoints={starPoints} framed={false} />
        <div className="battleOpponentLunchLine">
          <div className="sectionLabel small">Lunch Line</div>
          <div className="lunchLineRow">
            {kids.length === 0 ? (
              <div className="emptyLunchLine" role="status">
                No kids drafted yet.
              </div>
            ) : (
              kids.map((kid, i) => (
                <div key={`battle-kid-${i}`} className="kidChip">
                  <img className="kidChipImg" src={kid.image} alt={kid.title} />
                  <span className="kidName">{kid.title}</span>
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
            <OpponentSummary snapshot={opponent} starPoints={opponentStarPoints} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No stored opponent yet. Play a round to seed local storage.
            </div>
          )}
        </div>
        <div className="panelBox battlePlayerPanel">
          <PlayerBoard tray={tray} kids={kids} starPoints={playerStarPoints} />
        </div>
      </div>
    </div>
  )
}
