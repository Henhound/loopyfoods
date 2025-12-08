import React from 'react'
import type { KidFoodType } from '../data/placeholder-kid-cards'

export type CardPopoverItem = {
  title: string
  description?: string
  foodType?: KidFoodType
  image?: string
  baseStarValue?: number
}

export function CardPopover({
  item,
  onClose,
  onHoverStart,
  onHoverEnd,
}: {
  item: CardPopoverItem
  onClose: () => void
  onHoverStart?: () => void
  onHoverEnd?: () => void
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const anchor = el.parentElement as HTMLElement | null
    if (!anchor) return
    const margin = 8
    const place = () => {
      const a = anchor.getBoundingClientRect()
      const popW = el.offsetWidth
      const popH = el.offsetHeight
      const shell = anchor.closest<HTMLElement>('.mobile-shell')
      const shellRect = shell?.getBoundingClientRect()
      let boundLeft = shellRect ? shellRect.left + margin : margin
      let boundTop = shellRect ? shellRect.top + margin : margin
      let boundRight = shellRect ? shellRect.right - margin : window.innerWidth - margin
      let boundBottom = shellRect ? shellRect.bottom - margin : window.innerHeight - margin
      const traySection = anchor.closest<HTMLElement>('.traySection')
      const lunchLineSection = anchor.closest<HTMLElement>('.lunchLineSection')
      const shopRow = anchor.closest<HTMLElement>('.foodShop')
      if (traySection) {
        const tr = traySection.getBoundingClientRect()
        boundLeft = Math.max(boundLeft, tr.left + margin)
        boundRight = Math.min(boundRight, tr.right - margin)
        boundTop = Math.max(boundTop, tr.top + margin)
        boundBottom = Math.min(boundBottom, tr.bottom - margin)
      }
      const spaceAbove = a.top - boundTop
      const spaceBelow = boundBottom - a.bottom
      // Lunch line popovers drop below, shop cards bias upward, but flip if space is insufficient.
      let preferTop = lunchLineSection
        ? false
        : shopRow
          ? true
          : spaceAbove >= popH || spaceAbove >= spaceBelow
      if (preferTop && spaceAbove < popH && spaceBelow > spaceAbove) {
        preferTop = false
      } else if (!preferTop && spaceBelow < popH && spaceAbove > spaceBelow) {
        preferTop = true
      }
      const desiredTop = preferTop ? a.top - popH - margin : a.bottom + margin
      const desiredLeft = a.left + a.width / 2 - popW / 2
      const topVp = Math.max(boundTop, Math.min(desiredTop, boundBottom - popH))
      const leftVp = Math.max(boundLeft, Math.min(desiredLeft, boundRight - popW))
      el.style.top = `${topVp}px`
      el.style.left = `${leftVp}px`
      el.style.bottom = 'auto'
      el.style.right = 'auto'
      el.style.transform = 'none'
      el.style.position = 'fixed'
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place)
    }
  }, [])

  const foodLabels: Record<KidFoodType, string> = {
    sweet: 'Sweet',
    meat: 'Meat',
    veggie: 'Veggies',
    starch: 'Starch',
    gross: 'Gross',
  }
  const isKid = 'image' in item
  const typeLabel = isKid ? 'Likes' : 'Type'
  const typeText = item.foodType ? `${typeLabel}: ${foodLabels[item.foodType]}` : ''
  const baseStarText =
    !isKid && typeof item.baseStarValue === 'number'
      ? `Base Star Value: ${item.baseStarValue}`
      : ''
  const bodyLines =
    item.description != null && item.description !== ''
      ? [item.description]
      : [typeText, baseStarText].filter(Boolean)

  return (
    <div
      ref={ref}
      className="cardPopover"
      role="dialog"
      aria-label={`${item.title} details`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div className="cardPopoverHeader">
        <strong className="cardTitle">{item.title}</strong>
        <button className="popoverClose" aria-label="Close" onClick={onClose}>
          &times;
        </button>
      </div>
      {bodyLines.length ? (
        <div className="cardPopoverBody">
          {bodyLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
