// Minimal placeholder judge registry for UI scaffolding

export type PlaceholderJudge = {
  title: string
  description: string
  emoji: string // Emoji representing the judge's vibe
}

export const PLACEHOLDER_JUDGES: PlaceholderJudge[] = [
  {
    title: 'Chef Ada',
    description: 'Methodical palate. Rewards precise combos and clean plating.',
    emoji: '🧪',
  },
  {
    title: 'Critic Bruno',
    description: 'Loves bold flavors. Bonuses for spice and risk-taking.',
    emoji: '🌶️',
  },
  {
    title: 'Guru Chai',
    description: 'Seeks balance. Prefers harmony between sweet and savory.',
    emoji: '🧘',
  },
  {
    title: 'Diva Dolce',
    description: 'Sweet tooth. Extra points for desserts and glazes.',
    emoji: '🍰',
  },
  {
    title: 'Captain Umami',
    description: 'Depth hunter. Amplifies stews, broths, and aged flavors.',
    emoji: '🌊',
  },
]

