import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LobbyPage from './pages/LobbyPage'
import BattlePage from './pages/BattlePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/battle/:roomId" element={<BattlePage />} />
    </Routes>
  </BrowserRouter>
)
