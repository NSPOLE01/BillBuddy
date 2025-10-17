import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import './Header.css'

interface HeaderProps {
  isAuthenticated?: boolean
  onSignOut?: () => void
}

export default function Header({ isAuthenticated = false, onSignOut }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserEmail()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showDropdown && !target.closest('.user-menu')) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const fetchUserEmail = async () => {
    try {
      const user = await getCurrentUser()
      const attributes = await getCurrentUser()
      const userInfo = await getCurrentUser()
      setUserEmail(userInfo.signInDetails?.loginId || 'User')
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleTitleClick = () => {
    navigate('/')
  }

  const handleChartClick = () => {
    navigate('/spending-patterns')
    setShowDropdown(false)
  }

  const handleReceiptClick = () => {
    navigate('/')
    setShowDropdown(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
      if (onSignOut) {
        onSignOut()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="header">
      <h1 className="app-title" onClick={handleTitleClick}>
        Bill Buddy
      </h1>
      <div className="header-actions">
        {isAuthenticated && userEmail && (
          <div className={`user-menu ${showDropdown ? 'open' : ''}`}>
            <button
              className="user-email"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {userEmail}
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
        {isAuthenticated && (
          <button
            className="receipt-button"
            onClick={handleReceiptClick}
            aria-label="Process receipt"
            title="Process Receipt"
          >
            🧾
          </button>
        )}
        {isAuthenticated && (
          <button
            className="chart-button"
            onClick={handleChartClick}
            aria-label="View spending patterns"
            title="Spending Patterns"
          >
            📈
          </button>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Change Mode"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
