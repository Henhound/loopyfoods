import React from 'react'
import type { Card } from '../data/cards'

function textColorFor(bg: string): string {
  const hex = bg.trim()
  const m6 = /^#([0-9a-fA-F]{6})$/.exec(hex)
  const m3 = /^#([0-9a-fA-F]{3})$/.exec(hex)
  let r: number, g: number, b: number
  if (m6) {
    r = parseInt(m6[1].slice(0, 2), 16)
    g = parseInt(m6[1].slice(2, 4), 16)
    b = parseInt(m6[1].slice(4, 6), 16)
  } else if (m3) {
    r = parseInt(m3[1][0] + m3[1][0], 16)
    g = parseInt(m3[1][1] + m3[1][1], 16)
    b = parseInt(m3[1][2] + m3[1][2], 16)
  } else {
    // Fallback for non-hex colors
    return '#fff'
  }
  // YIQ contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? '#111' : '#fff'
}

export function CardView({ card, showTitle = true }: { card: Card; showTitle?: boolean }) {
  const fg = textColorFor(card.color)
  return (
    <div
      className="card"
      style={{ background: card.color, color: fg }}
      aria-label={card.title}
    >
      {showTitle ? <div className="cardTitle">{card.title}</div> : null}
    </div>
  )
}

export default CardView
