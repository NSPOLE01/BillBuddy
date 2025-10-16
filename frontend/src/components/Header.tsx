import { useTheme } from '../context/ThemeContext'
import './Header.css'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <h1 className="app-title">Bill Buddy</h1>
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
