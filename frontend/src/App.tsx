import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CVScreenerProvider } from './contexts/CVScreenerContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import UploadCVs from './components/UploadCVs'
import ChatInterface from './components/ChatInterface'
import ApiDebugInfo from './components/ApiDebugInfo'

function App() {
  return (
    <CVScreenerProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadCVs />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </Layout>
        <ApiDebugInfo />
      </Router>
    </CVScreenerProvider>
  )
}

export default App
