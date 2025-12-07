// Placeholder food registry for UI scaffolding

import type { KidFoodType } from './placeholder-kid-cards'

export type PlaceholderCard = {
  title: string
  foodType: KidFoodType
  baseStarValue: number
  color: string // CSS color (hex or named)
}

export const PLACEHOLDER_CARDS: PlaceholderCard[] = [
  { title: 'Cheese Pizza Slice', foodType: 'starch', baseStarValue: 1, color: '#fb923c' },
  { title: 'Tater Tots', foodType: 'starch', baseStarValue: 2, color: '#f59e0b' },
  { title: 'Buttered Noodles', foodType: 'starch', baseStarValue: 3, color: '#fef08a' },
  { title: 'Garlic Breadstick', foodType: 'starch', baseStarValue: 4, color: '#fbbf24' },
  { title: 'Mac & Cheese Cup', foodType: 'starch', baseStarValue: 5, color: '#facc15' },
  { title: 'Buttermilk Biscuit', foodType: 'starch', baseStarValue: 6, color: '#fcd34d' },

  { title: 'Chicken Nuggets', foodType: 'meat', baseStarValue: 1, color: '#f97316' },
  { title: 'Turkey Meatballs', foodType: 'meat', baseStarValue: 2, color: '#ea580c' },
  { title: 'Grilled Chicken Sandwich', foodType: 'meat', baseStarValue: 3, color: '#fb7185' },
  { title: 'Pepperoni Calzone', foodType: 'meat', baseStarValue: 4, color: '#b91c1c' },
  { title: 'BBQ Riblet', foodType: 'meat', baseStarValue: 5, color: '#b45309' },
  { title: 'Hot Dog Roller', foodType: 'meat', baseStarValue: 6, color: '#ef4444' },

  { title: 'Chocolate Pudding Cup', foodType: 'sweet', baseStarValue: 1, color: '#92400e' },
  { title: 'Strawberry Yogurt Cup', foodType: 'sweet', baseStarValue: 2, color: '#ec4899' },
  { title: 'Birthday Cupcake', foodType: 'sweet', baseStarValue: 3, color: '#a855f7' },
  { title: 'Cinnamon Swirl Roll', foodType: 'sweet', baseStarValue: 4, color: '#c084fc' },
  { title: 'Fruit Gel Cup', foodType: 'sweet', baseStarValue: 5, color: '#22d3ee' },
  { title: 'Rice Krispie Treat', foodType: 'sweet', baseStarValue: 6, color: '#fde047' },

  { title: 'Carrot Sticks', foodType: 'veggie', baseStarValue: 1, color: '#f97316' },
  { title: 'Steamed Broccoli', foodType: 'veggie', baseStarValue: 2, color: '#22c55e' },
  { title: 'Cucumber Slices', foodType: 'veggie', baseStarValue: 3, color: '#10b981' },
  { title: 'Roasted Corn Cup', foodType: 'veggie', baseStarValue: 4, color: '#84cc16' },
  { title: 'Garden Side Salad', foodType: 'veggie', baseStarValue: 5, color: '#65a30d' },
  { title: 'Green Bean Medley', foodType: 'veggie', baseStarValue: 6, color: '#4ade80' },

  { title: 'Mystery Meatloaf', foodType: 'gross', baseStarValue: 1, color: '#6b7280' },
  { title: 'Soggy Fish Sticks', foodType: 'gross', baseStarValue: 2, color: '#0ea5e9' },
  { title: 'Lukewarm Peas', foodType: 'gross', baseStarValue: 3, color: '#16a34a' },
  { title: 'Cafeteria Gravy Spill', foodType: 'gross', baseStarValue: 4, color: '#a3a3a3' },
  { title: 'Cold Brussels Mash', foodType: 'gross', baseStarValue: 5, color: '#334155' },
  { title: 'Unidentified Lunch Slurry', foodType: 'gross', baseStarValue: 6, color: '#6366f1' },
]
