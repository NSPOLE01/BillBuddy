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
      // The email is stored in the user attributes
      const userInfo = await getCurrentUser()
      setUserEmail(userInfo.signInDetails?.loginId || 'User')
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleTitleClick = () => {
    navigate('/')
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
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
