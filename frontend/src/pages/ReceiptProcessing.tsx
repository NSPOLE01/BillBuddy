import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { processReceipt } from '../services/receiptService'
import './ReceiptProcessing.css'

export default function ReceiptProcessing() {
  const location = useLocation()
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState<string>('')
  const file = location.state?.file as File | undefined

  useEffect(() => {
    if (!file) {
      navigate('/')
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)

    // Process the receipt
    const processFile = async () => {
      try {
        const receipt = await processReceipt(file)
        // Navigate to results page with receipt data
        navigate('/results', { state: { receipt } })
      } catch (error) {
        console.error('Error processing receipt:', error)
        // TODO: Show error message to user
        navigate('/')
      }
    }

    processFile()

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file, navigate])

  if (!file) {
    return null
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <main className="processing-container">
      <div className="processing-content">
        <div className="receipt-preview">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Receipt preview"
              className="receipt-image"
            />
          )}
          <div className="overlay">
            <div className="spinner"></div>
            <p className="processing-text">Processing receipt...</p>
          </div>
        </div>
        <button className="cancel-button" onClick={handleCancel}>
          ‹ Cancel and Go Back
        </button>
      </div>
    </main>
  )
}
