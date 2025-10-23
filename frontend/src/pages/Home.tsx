import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReceiptUpload from '../components/ReceiptUpload'
import Banner from '../components/Banner'
import './Home.css'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const navigate = useNavigate()

  const handleFileUpload = (file: File) => {
    if (uploadedFile) {
      // Show banner if trying to upload when file already exists
      setShowBanner(true)
      return
    }
    setUploadedFile(file)
    console.log('File uploaded:', file.name)
  }

  const handleDeleteFile = () => {
    setUploadedFile(null)
    console.log('File deleted')
  }

  const handleProceed = () => {
    if (uploadedFile) {
      // Navigate to processing page with the file
      navigate('/process', { state: { file: uploadedFile } })
    }
  }

  return (
    <>
      {showBanner && (
        <Banner
          message="Only one file can be uploaded at a time. Please delete the current file first."
          onClose={() => setShowBanner(false)}
        />
      )}
      <main className="main-content">
        <ReceiptUpload
          onFileUpload={handleFileUpload}
          disabled={!!uploadedFile}
          onDisabledClick={() => setShowBanner(true)}
        />
        {uploadedFile && (
          <>
            <div className="file-info">
              <p>{uploadedFile.name}</p>
              <button
                className="delete-button"
                onClick={handleDeleteFile}
                aria-label="Delete file"
              >
                ✕
              </button>
            </div>
            <button className="proceed-button" onClick={handleProceed}>
              Proceed
            </button>
          </>
        )}
        {!uploadedFile && (
          <button
            className="manual-receipt-button"
            onClick={() => navigate('/manual-receipt')}
          >
            Add Receipt Manually
          </button>
        )}
      </main>
    </>
  )
}
