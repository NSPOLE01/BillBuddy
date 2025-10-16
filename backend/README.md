# BillBuddy Backend

AWS-based serverless backend for receipt processing and bill splitting.

## Architecture

- **AWS Textract**: Extract text and data from receipt images
- **AWS Lambda**: Serverless compute for business logic
- **AWS S3**: Store receipt images
- **AWS API Gateway**: RESTful API endpoints
- **Amazon DynamoDB**: Store receipts, items, and split information

## Folder Structure

- **functions/**: Lambda function handlers
  - `uploadReceipt/`: Handle receipt upload to S3
  - `processReceipt/`: Process receipt with Textract
  - `createSplit/`: Create and manage bill splits
  - `getReceipts/`: Retrieve receipt history

- **services/**: Business logic
  - `textractService.ts`: Textract integration
  - `receiptParser.ts`: Parse Textract output into structured data
  - `splitCalculator.ts`: Calculate bill splits

- **infrastructure/**: IaC templates for AWS resources

- **types/**: Shared TypeScript types

- **utils/**: Helper functions
