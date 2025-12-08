import React from 'react'

import type { KidFoodType } from '../data/placeholder-kid-cards'

const ICONS: Record<KidFoodType, string> = {
  sweet: '🍭',
  meat: '🍖',
  starch: '🍞',
  veggie: '🥦',
  gross: '🤢',
}

const LABELS: Record<KidFoodType, string> = {
  sweet: 'Sweet',
  meat: 'Meat',
  starch: 'Starch',
  veggie: 'Veggie',
  gross: 'Gross',
}

export function FoodTypeBadge({ type }: { type: KidFoodType }) {
  return (
    <span className={`foodTypeBadge type-${type}`} aria-label={`${LABELS[type]} food`}>
      <span aria-hidden="true">{ICONS[type]}</span>
    </span>
  )
}

export function FoodStarBadge({ value }: { value: number }) {
  return (
    <span className="foodStarBadge" aria-label={`Base star value ${value}`}>
      {value}
    </span>
  )
}
