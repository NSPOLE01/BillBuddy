import { ReceiptBreakdown, PersonBreakdown, SaveReceiptBreakdownRequest } from '../types/receiptBreakdown'
import { DynamoDBService } from './dynamodbService'

export class ReceiptBreakdownService {
  private dynamoDBService: DynamoDBService

  constructor() {
    this.dynamoDBService = new DynamoDBService()
  }

  calculateBreakdown(request: SaveReceiptBreakdownRequest): PersonBreakdown[] {
    const { people, assignments, items, receipt } = request
    const { subtotal, tax, tip } = receipt

    // Calculate how much each person owes
    const personTotals = new Map<string, number>()

    // Initialize all people with 0
    people.forEach(person => {
      personTotals.set(person.id, 0)
    })

    // Calculate item costs for each person
    assignments.forEach(assignment => {
      const item = items.find(i => i.id === assignment.itemId)
      if (!item) return

      const splitCount = assignment.personIds.length
      const pricePerPerson = item.price / splitCount

      assignment.personIds.forEach(personId => {
        const current = personTotals.get(personId) || 0
        personTotals.set(personId, current + pricePerPerson)
      })
    })

    // Add proportional tax and tip to each person
    const breakdown: PersonBreakdown[] = people.map(person => {
      const itemsTotal = personTotals.get(person.id) || 0
      const proportion = subtotal > 0 ? itemsTotal / subtotal : 0

      const personTax = tax * proportion
      const personTip = (tip || 0) * proportion
      const totalOwed = itemsTotal + personTax + personTip

      return {
        personId: person.id,
        personName: person.name,
        amountOwed: totalOwed,
      }
    })

    return breakdown
  }

  private parseAndNormalizeDate(dateString?: string): string {
    if (!dateString) {
      return new Date().toISOString().split('T')[0]
    }

    // Try to parse the date string
    const parsedDate = new Date(dateString)

    // Check if the date is valid
    if (!isNaN(parsedDate.getTime())) {
      // Return in YYYY-MM-DD format
      return parsedDate.toISOString().split('T')[0]
    }

    // If parsing failed, return today's date
    return new Date().toISOString().split('T')[0]
  }

  async saveReceiptBreakdown(
    userId: string,
    request: SaveReceiptBreakdownRequest
  ): Promise<ReceiptBreakdown> {
    // Validate numeric fields
    const subtotal = Number.isFinite(request.receipt.subtotal) ? request.receipt.subtotal : 0
    const tax = Number.isFinite(request.receipt.tax) ? request.receipt.tax : 0
    const tip = request.receipt.tip !== undefined && Number.isFinite(request.receipt.tip)
      ? request.receipt.tip
      : undefined

    // Calculate total if not provided
    const total = request.receipt.total && Number.isFinite(request.receipt.total)
      ? request.receipt.total
      : (subtotal + tax + (tip || 0))

    // Normalize date to ISO format (YYYY-MM-DD)
    const normalizedDate = this.parseAndNormalizeDate(request.receipt.date)

    const breakdown = this.calculateBreakdown({
      ...request,
      receipt: {
        ...request.receipt,
        subtotal,
        tax,
        tip,
        total,
      },
    })

    // Calculate how much the user paid (total of all amounts owed to them)
    const userPaid = breakdown.reduce((sum, person) => sum + person.amountOwed, 0)

    const receiptBreakdown: ReceiptBreakdown = {
      id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      merchantName: request.receipt.merchantName,
      date: normalizedDate,
      subtotal,
      tax,
      tip,
      total,
      userPaid: Number.isFinite(userPaid) ? userPaid : 0,
      peopleBreakdown: breakdown.map(person => ({
        ...person,
        amountOwed: Number.isFinite(person.amountOwed) ? person.amountOwed : 0,
      })),
      createdAt: new Date().toISOString(),
    }

    console.log('Saving receipt breakdown to DynamoDB:', JSON.stringify(receiptBreakdown, null, 2))

    await this.dynamoDBService.saveReceiptBreakdown(receiptBreakdown)

    return receiptBreakdown
  }

  async getUserReceiptBreakdowns(userId: string): Promise<ReceiptBreakdown[]> {
    return await this.dynamoDBService.getUserReceiptBreakdowns(userId)
  }

  async getUserReceiptBreakdownsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReceiptBreakdown[]> {
    return await this.dynamoDBService.getUserReceiptBreakdownsByDateRange(userId, startDate, endDate)
  }

  async deleteReceiptBreakdown(userId: string, receiptId: string): Promise<void> {
    return await this.dynamoDBService.deleteReceiptBreakdown(userId, receiptId)
  }
}
