import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleTitleClick = () => {
    navigate('/')
  }

  return (
    <header className="header">
      <h1 className="app-title" onClick={handleTitleClick}>
        Bill Buddy
      </h1>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  )
}
