import { useState, useCallback } from 'react'

import MainMenu from '../screens/MainMenu'
import Shop from '../screens/Shop'
import { SCREENS } from './screen'
import type { Screen } from './screen'

export default function App() {
  const [screen, setScreen] = useState<Screen>(SCREENS.MAIN_MENU)

  const goToShop = useCallback(() => setScreen(SCREENS.SHOP), [])
  const goToMenu = useCallback(() => setScreen(SCREENS.MAIN_MENU), [])

  return (
    <div className="mobile-shell">
      {screen === SCREENS.MAIN_MENU && <MainMenu onStart={goToShop} />}
      {screen === SCREENS.SHOP && <Shop onBack={goToMenu} />}
    </div>
  )
}
