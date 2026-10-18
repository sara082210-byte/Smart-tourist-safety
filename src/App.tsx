import './App.css'
import Navbar from '../components/Navbar'
import { usePath } from './router'
import { routes } from './routes'

function App() {
  const path = usePath()
  const Page = routes[path] ?? routes['/']
  const isDashboard = path === '/dashboard'

  return (
    <div className={`app-shell ${isDashboard ? 'app-shell--dashboard' : ''}`}>
      {!isDashboard && <Navbar currentPath={path} />}
      <main className={`app-main ${isDashboard ? 'app-main--dashboard' : ''}`}>
        <Page />
      </main>
    </div>
  )
}

export default App