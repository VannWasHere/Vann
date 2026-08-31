import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AllProjects from './pages/AllProjects'
import ThemeSwitch from './components/ThemeSwitch'
import CRTOverlay from './components/CRTOverlay'
import { ThemeProvider } from './theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
        </Routes>
        <ThemeSwitch />
        <CRTOverlay />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
