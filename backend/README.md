# BillBuddy Backend

Express server with AWS Textract integration for receipt processing.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials:
   - Copy `.env.example` to `.env`
   - Add your AWS credentials:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION` (default: us-east-1)

3. Make sure you have AWS Textract permissions enabled for your IAM user/role

## Development

Run the development server:
```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### POST /api/process-receipt
Process a receipt image with AWS Textract

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'receipt' file field

**Response:**
```json
{
  "receipt": {
    "id": "uuid",
    "merchantName": "Store Name",
    "items": [
      { "id": "uuid", "name": "Item", "price": 10.99 }
    ],
    "subtotal": 10.99,
    "tax": 0.96,
    "tip": 1.98,
    "total": 13.93,
    "date": "1/15/2025"
  }
}
```

## AWS Textract

This backend uses AWS Textract's AnalyzeExpense API to extract:
- Merchant/vendor name
- Line items with names and prices
- Tax, tip, and total amounts
- Receipt date

Make sure your AWS account has Textract enabled and you have the necessary permissions.
