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

  async saveReceiptBreakdown(
    userId: string,
    request: SaveReceiptBreakdownRequest
  ): Promise<ReceiptBreakdown> {
    const breakdown = this.calculateBreakdown(request)

    // Calculate how much the user paid (total of all amounts owed to them)
    const userPaid = breakdown.reduce((sum, person) => sum + person.amountOwed, 0)

    const receiptBreakdown: ReceiptBreakdown = {
      id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      merchantName: request.receipt.merchantName,
      date: request.receipt.date || new Date().toISOString().split('T')[0],
      subtotal: request.receipt.subtotal,
      tax: request.receipt.tax,
      tip: request.receipt.tip,
      total: request.receipt.total,
      userPaid,
      peopleBreakdown: breakdown,
      createdAt: new Date().toISOString(),
    }

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
}
