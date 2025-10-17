import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'
import './App.css'
import './aws-config'
import Header from './components/Header'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Home from './pages/Home'
import ReceiptProcessing from './pages/ReceiptProcessing'
import ReceiptResults from './pages/ReceiptResults'
import SpendingPatterns from './pages/SpendingPatterns'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      await getCurrentUser()
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleSignUpSuccess = () => {
    setShowSignUp(false)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <BrowserRouter>
        <div className="app">
          <Header isAuthenticated={false} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <p>Loading...</p>
          </div>
        </div>
      </BrowserRouter>
    )
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="app">
          <Header isAuthenticated={false} />
          {showSignUp ? (
            <SignUp
              onLoginClick={() => setShowSignUp(false)}
              onSignUpSuccess={handleSignUpSuccess}
            />
          ) : (
            <Login
              onSignUpClick={() => setShowSignUp(true)}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header isAuthenticated={true} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<ReceiptProcessing />} />
          <Route path="/results" element={<ReceiptResults />} />
          <Route path="/spending-patterns" element={<SpendingPatterns />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
