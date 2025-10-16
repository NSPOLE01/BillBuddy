import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import ReceiptUpload from './components/ReceiptUpload'
import Banner from './components/Banner'

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  const handleFileUpload = (file: File) => {
    if (uploadedFile) {
      // Show banner if trying to upload when file already exists
      setShowBanner(true)
      return
    }
    setUploadedFile(file)
    console.log('File uploaded:', file.name)
    // TODO: Process the receipt
  }

  const handleDeleteFile = () => {
    setUploadedFile(null)
    console.log('File deleted')
  }

  const handleProceed = () => {
    console.log('Proceeding with file:', uploadedFile?.name)
    // TODO: Navigate to next step or process the receipt
  }

  return (
    <div className="app">
      {showBanner && (
        <Banner
          message="Only one file can be uploaded at a time. Please delete the current file first."
          onClose={() => setShowBanner(false)}
        />
      )}
      <Header />
      <main className="main-content">
        <ReceiptUpload onFileUpload={handleFileUpload} disabled={!!uploadedFile} />
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
      </main>
    </div>
  )
}

export default App
