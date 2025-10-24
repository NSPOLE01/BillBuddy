import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { TextractService } from './services/textractService'
import { ReceiptParser } from './services/receiptParser'
import { ReceiptBreakdownService } from './services/receiptBreakdownService'

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'))
      return
    }
    cb(null, true)
  },
})

// Initialize services
const textractService = new TextractService()
const receiptParser = new ReceiptParser()
const receiptBreakdownService = new ReceiptBreakdownService()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Process receipt endpoint
app.post('/api/process-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('Processing receipt:', req.file.originalname)

    // Analyze receipt with Textract
    const textractResponse = await textractService.analyzeReceipt(req.file.buffer)

    // Parse Textract response into structured receipt data
    const receipt = receiptParser.parseTextractResponse(textractResponse)

    console.log('Receipt processed successfully:', receipt.id)

    res.json({ receipt })
  } catch (error) {
    console.error('Error processing receipt:', error)
    res.status(500).json({
      error: 'Failed to process receipt',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Save receipt breakdown endpoint
app.post('/api/receipt-breakdown', async (req, res) => {
  try {
    const { userId, ...breakdownRequest } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    console.log('Saving receipt breakdown for user:', userId)

    const breakdown = await receiptBreakdownService.saveReceiptBreakdown(userId, breakdownRequest)

    console.log('Receipt breakdown saved successfully:', breakdown.id)

    res.json({ breakdown })
  } catch (error) {
    console.error('Error saving receipt breakdown:', error)
    res.status(500).json({
      error: 'Failed to save receipt breakdown',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Get user's receipt breakdowns endpoint
app.get('/api/receipt-breakdowns/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { startDate, endDate } = req.query

    console.log('Fetching receipt breakdowns for user:', userId)

    let breakdowns
    if (startDate && endDate) {
      breakdowns = await receiptBreakdownService.getUserReceiptBreakdownsByDateRange(
        userId,
        startDate as string,
        endDate as string
      )
    } else {
      breakdowns = await receiptBreakdownService.getUserReceiptBreakdowns(userId)
    }

    console.log(`Found ${breakdowns.length} receipt breakdowns`)

    res.json({ breakdowns })
  } catch (error) {
    console.error('Error fetching receipt breakdowns:', error)
    res.status(500).json({
      error: 'Failed to fetch receipt breakdowns',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.listen(port, () => {
  console.log(`BillBuddy backend server running on port ${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
})
