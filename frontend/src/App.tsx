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

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ReceiptUpload onFileUpload={handleFileUpload} />
        {uploadedFile && (
          <div className="file-info">
            <p>Uploaded: {uploadedFile.name}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
