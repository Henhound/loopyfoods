import React from 'react'
import '../styles/shop.css'
import { useNavigation } from '../app/navigation'

export default function Shop() {
  const { back } = useNavigation()
  return (
    <div className="shop">
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
              <button className="btn warning">Reroll</button>
            </div>
          </div>
        </div>
        <div className="row foodShop">
          <div className="sectionLabel small">Food Shop</div>
          <div className="shopRow">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="slot square" />
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
