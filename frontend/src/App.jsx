import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AsteroidDetail from './components/AsteroidDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-void text-white grid-bg">
        <div className="fixed inset-0 scanline z-50 pointer-events-none" />
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asteroid/:id" element={<AsteroidDetail />} />
          </Routes>
        </main>
        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-dim text-xs tracking-widest">
            POWERED BY NASA NEOWS API — DATA CACHED ON POSTGRESQL
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
