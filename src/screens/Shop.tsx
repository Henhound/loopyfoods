import React, { useEffect, useRef, useState } from 'react'
import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import { CARDS, type Card } from '../data/cards'
import CardView from '../components/CardView'

const SHOP_SIZE = 5
function generateOffers(): Card[] {
  return Array.from({ length: SHOP_SIZE }, () => CARDS[Math.floor(Math.random() * CARDS.length)])
}

export default function Shop() {
  const { back } = useNavigation()
  const [offers, setOffers] = useState<Card[]>(() => generateOffers())
  const [selected, setSelected] = useState<number | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)
  const [offsetX, setOffsetX] = useState(0)

  useEffect(() => {
    function measure() {
      const el = popRef.current
      if (!el) return
      // reset offset before measuring
      el.style.setProperty('--offsetX', '0px')
      const rect = el.getBoundingClientRect()
      const margin = 8
      let dx = 0
      if (rect.left < margin) dx += margin - rect.left
      if (rect.right > window.innerWidth - margin)
        dx -= rect.right - (window.innerWidth - margin)
      setOffsetX(dx)
      el.style.setProperty('--offsetX', `${dx}px`)
    }
    if (selected != null) {
      // measure after mount/paint
      requestAnimationFrame(measure)
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
  }, [selected, offers])
  return (
    <div className="shop" onClick={() => setSelected(null)}>
      <div className="topbar">
        <button onClick={back} className="btn ghost">Back</button>
        <div className="miniStats" aria-label="session stats">
          <span title="Gold">🪙 10</span>
          <span title="Health">❤️ 2/5</span>
          <span title="Trophies">🏆 3/10</span>
          <span title="Round">🔄 1</span>
          <span title="Star Target">⭐ 100</span>
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
                <div className="slot square" data-index="1">
                  <span>1</span>
                </div>
                <div className="slot square" data-index="2">
                  <span>2</span>
                </div>
                <div className="slot square" data-index="3">
                  <span>3</span>
                </div>
                <div className="slot square" data-index="4">
                  <span>4</span>
                </div>
                <div className="slot rect" data-index="5">
                  <span>5</span>
                </div>
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
              <button
                className="btn warning"
                onClick={e => {
                  e.stopPropagation()
                  setSelected(null)
                  setOffers(generateOffers())
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
            {offers.map((c, i) => (
              <div
                key={`${c.id}-${i}`}
                className="slot square"
                style={{ position: 'relative', outline: selected === i ? '2px solid var(--accent)' : 'none' }}
                onClick={e => {
                  e.stopPropagation()
                  setSelected(i)
                }}
                role="button"
                aria-pressed={selected === i}
              >
                <CardView card={c} showTitle={false} />
                {selected === i && (
                  <div
                    ref={popRef}
                    className="cardPopover"
                    onClick={e => e.stopPropagation()}
                    style={{ ['--offsetX' as any]: `${offsetX}px` }}
                  >
                    <div className="cardPopoverHeader">
                      <div className="cardPopoverTitle">{c.title}</div>
                      <button className="cardPopoverClose" onClick={() => setSelected(null)} aria-label="Close">
                        ×
                      </button>
                    </div>
                    <div className="cardPopoverBody">
                      <div className="swatch" style={{ background: c.color }} aria-hidden />
                      <div className="desc">{c.description}</div>
                    </div>
                  </div>
                )}
              </div>
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
  )
}
