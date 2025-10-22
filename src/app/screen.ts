// src/app/screen.ts

// Using a const object instead of an enum avoids isolatedModules/erasableSyntaxOnly issues
export const SCREENS = {
  MAIN_MENU: 'MAIN_MENU',
  SHOP: 'SHOP',
} as const

// Infer a union type from SCREENS
export type Screen = (typeof SCREENS)[keyof typeof SCREENS]
