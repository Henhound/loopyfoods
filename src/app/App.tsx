import MainMenu from '../screens/MainMenu'
import Shop from '../screens/Shop'
import { SCREENS } from './screen'
import { NavigationProvider, useNavigation } from './navigation'

//To run the app: npm run dev:lan

function Screens() {
  const { screen } = useNavigation()
  switch (screen) {
    case SCREENS.MAIN_MENU:
      return <MainMenu />
    case SCREENS.SHOP:
      return <Shop />
    default:
      return null
  }
}

export default function App() {
  return (
    <NavigationProvider>
      <div className="mobile-shell">
        <Screens />
      </div>
    </NavigationProvider>
  )
}
