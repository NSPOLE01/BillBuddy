import { TextractClient, AnalyzeExpenseCommand, AnalyzeExpenseCommandInput } from '@aws-sdk/client-textract'

export class TextractService {
  private client: TextractClient

  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  }

  async analyzeReceipt(imageBytes: Buffer) {
    const params: AnalyzeExpenseCommandInput = {
      Document: {
        Bytes: imageBytes,
      },
    }

    try {
      const command = new AnalyzeExpenseCommand(params)
      const response = await this.client.send(command)
      return response
    } catch (error) {
      console.error('Error analyzing receipt with Textract:', error)
      throw error
    }
  }
}
