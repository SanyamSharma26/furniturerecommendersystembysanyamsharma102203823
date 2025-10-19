import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Recommend from './pages/Recommend'
import Analytics from './pages/Analytics'
import './styles.css'

function App(){
  return (
    <BrowserRouter>
      <nav className="nav"><Link to="/">Recommend</Link><Link to="/analytics">Analytics</Link></nav>
      <Routes>
        <Route path='/' element={<Recommend/>} />
        <Route path='/analytics' element={<Analytics/>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
