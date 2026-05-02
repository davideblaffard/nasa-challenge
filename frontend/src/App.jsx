import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AsteroidDetail from './components/AsteroidDetail'
import LandingPage from './components/LandingPage'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-void text-silver grid-bg font-pixel">
      <div className="fixed inset-0 scanline z-50 pointer-events-none" />
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t-2 border-dim/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-dim text-[8px] leading-6">
          POWERED BY NASA NEOWS API — DATA CACHED ON POSTGRESQL
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/asteroid/:id" element={<AppLayout><AsteroidDetail /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
