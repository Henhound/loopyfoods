import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import type { PlaceholderCard } from '../data/placeholder-food-cards'
import type { PlaceholderKid } from '../data/placeholder-kid-cards'
import type { TeamSnapshot } from '../app/teamStorage'

type BattleParams = {
  tray?: Array<PlaceholderCard | null>
  kids?: PlaceholderKid[]
  opponent?: TeamSnapshot | null
}

function OpponentSummary({ snapshot }: { snapshot: TeamSnapshot }) {
  const traySize = snapshot.tray.length
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700 }}>Local Opponent</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Round {snapshot.round} • HP {snapshot.health} • TR {snapshot.trophies}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <div>
          <div className="sectionLabel small">Lunch Line</div>
          <div className="lunchLineRow" style={{ paddingBottom: 0 }}>
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
        <div>
          <div className="sectionLabel small">Hot Lunch Tray</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {Array.from({ length: traySize }, (_, i) => {
              const card = snapshot.tray[i]
              return (
                <div
                  key={`opp-tray-${i}`}
                  className={`slot ${i === traySize - 1 ? 'rect' : 'square'}`}
                  style={{ minHeight: '56px' }}
                >
                  {card ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                        border: '1px solid var(--border-color)',
                        background: card.color,
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        padding: '4px 8px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        fontSize: 13,
                        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                      }}
                      aria-label={card.title}
                    >
                      {card.title}
                    </div>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Battle() {
  const { params, back } = useNavigation()
  const { tray: paramTray, kids: paramKids, opponent: paramOpponent } = (params as BattleParams) || {}

  const tray = Array.isArray(paramTray) ? paramTray : Array.from({ length: 5 }, () => null)
  const traySize = tray.length
  const kids = Array.isArray(paramKids) ? paramKids : []
  const opponent = paramOpponent ?? null

  return (
    <div
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        padding: 10,
        background: 'var(--bg)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: 'var(--gap)',
      }}
    >
      <div className="topbar">
        <button onClick={back} className="btn ghost">
          Back
        </button>
        <div className="miniStats" aria-label="battle info">
          <span>Battle</span>
        </div>
      </div>

      <div className="panelBox" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        {opponent ? (
          <OpponentSummary snapshot={opponent} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            No stored opponent yet. Play a round to seed local storage.
          </div>
        )}
      </div>

      <section className="traySection">
        <div className="sectionLabel">Hot Lunch Tray</div>
        <div className="trayFit">
          <div className="trayViewport">
            <div className="trayFrame">
              <div className="trayGrid">
                {Array.from({ length: traySize }, (_, i) => {
                  const idx = i + 1
                  const item = tray[i]
                  const slotCls = `slot ${idx === traySize ? 'rect' : 'square'}`
                  return (
                    <div key={idx} className={slotCls} data-index={idx}>
                      {item ? (
                        <div className="trayCardWrap">
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 10,
                              border: '1px solid var(--border-color)',
                              background: item.color,
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
                              textShadow:
                                '0 1px 2px rgba(0,0,0,0.45), 0 0 4px rgba(0,0,0,0.35)',
                            }}
                            aria-label={item.title}
                          >
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
      </section>

      <section className="lunchLineSection battleLunchLine">
        <div className="sectionLabel">Lunch Line</div>
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
      </section>
    </div>
  )
}
