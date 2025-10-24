import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import { ReceiptBreakdown } from '../types/receiptBreakdown'

export class DynamoDBService {
  private client: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })

    this.client = DynamoDBDocumentClient.from(dynamoClient)
    this.tableName = process.env.RECEIPTS_TABLE_NAME || 'BillBuddyReceipts'
  }

  async saveReceiptBreakdown(breakdown: ReceiptBreakdown): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: breakdown,
    })

    await this.client.send(command)
  }

  async getReceiptBreakdown(userId: string, receiptId: string): Promise<ReceiptBreakdown | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        userId,
        id: receiptId,
      },
    })

    const response = await this.client.send(command)
    return (response.Item as ReceiptBreakdown) || null
  }

  async getUserReceiptBreakdowns(userId: string): Promise<ReceiptBreakdown[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by createdAt descending
    })

    const response = await this.client.send(command)
    const items = (response.Items as ReceiptBreakdown[]) || []
    console.log(`Found ${items.length} total receipts for user ${userId}`)
    items.forEach(item => console.log(`  - Receipt ID: ${item.id}, Date: ${item.date}, Type: ${typeof item.date}`))
    return items
  }

  async getUserReceiptBreakdownsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReceiptBreakdown[]> {
    console.log(`Querying receipts for user ${userId} between ${startDate} and ${endDate}`)

    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': startDate,
        ':endDate': endDate,
      },
      ScanIndexForward: false,
    })

    const response = await this.client.send(command)
    const items = (response.Items as ReceiptBreakdown[]) || []
    console.log(`Found ${items.length} receipts in date range`)
    items.forEach(item => console.log(`  - Receipt date: ${item.date}`))
    return items
  }
}
