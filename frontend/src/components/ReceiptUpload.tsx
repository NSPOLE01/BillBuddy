import { useRef, useState } from 'react'
import './ReceiptUpload.css'

interface ReceiptUploadProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
  onDisabledClick?: () => void
}

export default function ReceiptUpload({ onFileUpload, disabled = false, onDisabledClick }: ReceiptUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled) {
      return
    }

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) {
      onFileUpload(e.dataTransfer.files[0]) // This will trigger the banner
      return
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
    if (!validTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, or HEIC)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    onFileUpload(file)
  }

  const onButtonClick = () => {
    if (disabled) {
      onDisabledClick?.()
      return
    }
    inputRef.current?.click()
  }

  const handleClick = () => {
    if (disabled) {
      onDisabledClick?.()
    }
  }

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="file-input"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="upload-content">
          <div className="upload-icon">📸</div>
          <p className="upload-text">Drag and drop your receipt here</p>
          <p className="upload-subtext">or</p>
          <button className="upload-button" onClick={onButtonClick} disabled={disabled}>
            Choose File
          </button>
          <p className="upload-hint">Supports JPEG, PNG (Max 10MB)</p>
        </div>
      </div>
    </div>
  )
}
