import React from 'react'
import '../styles/shop.css'

const SquareSlot: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div className="slot" style={{ width: size, height: size }} />
)

type Props = { onBack: () => void }

export default function Shop({ onBack }: Props) {
  return (
    <div className="shop">
      {/* Tiny top bar with Back */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={onBack} className="btn" style={{ background: '#777', color: '#fff' }}>
          ← Back to Menu
        </button>
      </div>

      {/* Header */}
      <section className="header">
        <div>Gold: 10</div>
        <div>Health: 2/5</div>
        <div>Trophies: 3/10</div>
        <div>Round: 1</div>
      </section>

      {/* Main two-column area */}
      <section className="main">
        <div className="leftCol">
          <div className="panel judgesPanel">
            <div className="panelTitle">Judges</div>
            <div className="rowSlots">
              {[0, 1, 2].map(i => (
                <SquareSlot key={i} />
              ))}
            </div>
          </div>

          <div className="panel shopPanel">
            <div className="panelTitle">Shop</div>

            <div className="subPanel">
              <div className="subTitle">Judge Cards</div>
              <div className="colSlots">
                {[0, 1, 2].map(i => (
                  <SquareSlot key={i} />
                ))}
              </div>
              <button className="btn danger">Find Judges</button>
            </div>

            <div className="subPanel">
              <div className="subTitle">Food Cards</div>
              <div className="colSlots">
                {[0, 1, 2, 3, 4].map(i => (
                  <SquareSlot key={i} />
                ))}
              </div>
              <button className="btn primary">Reroll Food Cards</button>
            </div>
          </div>
        </div>

        <div className="panel loopPanel">
          <div className="panelTitle">Food Loop</div>
          <div className="loopScroll">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <SquareSlot key={i} size={64} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

