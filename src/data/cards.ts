export type Card = {
  id: string
  title: string
  description: string
  color: string // CSS color or hex
}

export const CARDS: Card[] = [
  {
    id: 'basic/apple',
    title: 'Apple',
    description: 'A crisp bite. Simple and sweet.',
    color: '#f87171',
  },
  {
    id: 'basic/bread',
    title: 'Bread',
    description: 'Fills you up and keeps you going.',
    color: '#fbbf24',
  },
  {
    id: 'basic/chili',
    title: 'Chili',
    description: 'Adds heat to any dish.',
    color: '#ef4444',
  },
  {
    id: 'basic/taco',
    title: 'Taco',
    description: 'Portable joy wrapped in a shell.',
    color: '#10b981',
  },
  {
    id: 'basic/sushi',
    title: 'Sushi',
    description: 'Fresh and balanced flavors.',
    color: '#60a5fa',
  },
  {
    id: 'basic/burger',
    title: 'Burger',
    description: 'Stacked layers of comfort.',
    color: '#a78bfa',
  },
  {
    id: 'basic/salad',
    title: 'Salad',
    description: 'Light, crunchy, and green.',
    color: '#34d399',
  },
  {
    id: 'basic/pizza',
    title: 'Pizza',
    description: 'Endless toppings, endless smiles.',
    color: '#fb7185',
  },
  {
    id: 'basic/donut',
    title: 'Donut',
    description: 'A ring of sweet happiness.',
    color: '#f472b6',
  },
  {
    id: 'basic/coffee',
    title: 'Coffee',
    description: 'Warm focus in a cup.',
    color: '#6b7280',
  },
]

export const CARD_BY_ID = new Map<string, Card>(CARDS.map(c => [c.id, c]))

