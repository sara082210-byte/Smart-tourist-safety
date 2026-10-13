import './App.css'
import Navbar from '../components/Navbar'
import { usePath } from './router'
import { routes } from './routes'

function App() {
  const path = usePath()
  const Page = routes[path] ?? routes['/']

  return (
    <div className="app-shell">
      <Navbar currentPath={path} />
      <main className="app-main">
        <Page />
      </main>
    </div>
  )
}

export default App