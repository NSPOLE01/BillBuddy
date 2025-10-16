# BillBuddy

An AI-powered expense tracker with receipt scanning and bill splitting capabilities.

## Features

- **Receipt Scanning**: Upload receipt images and automatically extract items and prices
- **Bill Splitting**: Assign individual items to one or multiple people
- **Smart Calculations**: Automatically calculate how much each person owes
- **AWS Integration**: Leverages AWS services for scalable receipt processing

## Project Structure

```
BillBuddy/
├── frontend/           # React frontend application
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Page-level components
│       ├── services/   # API service calls
│       ├── hooks/      # Custom React hooks
│       ├── utils/      # Utility functions
│       ├── types/      # TypeScript type definitions
│       └── assets/     # Static assets (images, icons, etc.)
│
├── backend/            # Backend services
│   ├── src/
│   │   ├── functions/  # AWS Lambda functions
│   │   ├── services/   # Business logic services
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   └── infrastructure/ # IaC templates (CloudFormation/CDK/Terraform)
│
└── README.md
```

## Tech Stack

### Frontend
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite** (or Create React App): Build tool

### Backend
- **AWS Lambda**: Serverless functions
- **AWS Textract**: Receipt OCR and text extraction
- **AWS S3**: Receipt image storage
- **AWS API Gateway**: REST API
- **Amazon DynamoDB**: NoSQL database for storing receipts and splits

## Getting Started

(Instructions will be added as we build the project)
