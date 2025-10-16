import { useEffect } from 'react'
import './Banner.css'

interface BannerProps {
  message: string
  onClose: () => void
}

export default function Banner({ message, onClose }: BannerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000) // Auto-close after 3 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="banner">
      <p>{message}</p>
      <button className="banner-close" onClick={onClose} aria-label="Close banner">
        ✕
      </button>
    </div>
  )
}
