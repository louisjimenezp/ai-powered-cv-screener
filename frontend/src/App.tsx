import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CVScreenerProvider } from './contexts/CVScreenerContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import UploadCVs from './components/UploadCVs'
import ChatInterface from './components/ChatInterface'
import ApiDebugInfo from './components/ApiDebugInfo'
import { ROUTES } from './utils/routes'

function App() {
  return (
    <CVScreenerProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.CHAT} element={<ChatInterface />} />
            <Route path={ROUTES.UPLOAD} element={<UploadCVs />} />
          </Routes>
        </Layout>
        <ApiDebugInfo />
      </Router>
    </CVScreenerProvider>
  )
}

export default App
