import { Receipt } from '../types/receipt'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Process receipt using AWS Textract backend
 */
export async function processReceipt(file: File): Promise<Receipt> {
  const formData = new FormData()
  formData.append('receipt', file)

  try {
    const response = await fetch(`${API_URL}/api/process-receipt`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to process receipt')
    }

    const data = await response.json()
    return data.receipt
  } catch (error) {
    console.error('Error processing receipt:', error)
    throw error
  }
}
