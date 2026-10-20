import './App.css'
import Navbar from '../components/Navbar'
import { usePath } from './router'
import { routes } from './routes'

import { DestinationProvider } from './context/DestinationContext'

function App() {
  const path = usePath()
  const Page = routes[path] ?? routes['/']
  const isDashboard = path === '/dashboard'

  return (
    <DestinationProvider>
      <div className={`app-shell ${isDashboard ? 'app-shell--dashboard' : ''}`}>
        {!isDashboard && <Navbar currentPath={path} />}
        <main className={`app-main ${isDashboard ? 'app-main--dashboard' : ''}`}>
          <Page />
        </main>
      </div>
    </DestinationProvider>
  )
}

export default App