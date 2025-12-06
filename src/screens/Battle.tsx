import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import type { PlaceholderCard } from '../data/placeholder-food-cards'
import type { PlaceholderKid } from '../data/placeholder-kid-cards'

type BattleParams = {
  tray?: Array<PlaceholderCard | null>
  kids?: PlaceholderKid[]
}

export default function Battle() {
  const { params, back } = useNavigation()
  const { tray: paramTray, kids: paramKids } = (params as BattleParams) || {}

  const tray = Array.isArray(paramTray) ? paramTray : Array.from({ length: 5 }, () => null)
  const traySize = tray.length
  const kids = Array.isArray(paramKids) ? paramKids : []

  return (
    <div
      style={{
        height: '100dvh',
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
        Opponent area (placeholder)
      </div>

      <section className="traySection">
        <div className="sectionLabel">Hot Lunch Tray</div>
        <div className="trayFit">
          <div className="trayViewport">
            <div className="trayGrid">
              {Array.from({ length: traySize }, (_, i) => {
                const idx = i + 1
                const item = tray[i]
                const slotCls = `slot ${idx === traySize ? 'rect' : 'square'}`
                return (
                  <div key={idx} className={slotCls} data-index={idx}>
                    {item ? (
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
                        }}
                        aria-label={item.title}
                      >
                        {item.title}
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
                <span className="kidEmoji">{kid.emoji}</span>
                <span className="kidName">{kid.title}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
