import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import ReceiptUpload from './components/ReceiptUpload'

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    console.log('File uploaded:', file.name)
    // TODO: Process the receipt
  }

  const handleDeleteFile = () => {
    setUploadedFile(null)
    console.log('File deleted')
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ReceiptUpload onFileUpload={handleFileUpload} />
        {uploadedFile && (
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
        )}
      </main>
    </div>
  )
}

export default App
