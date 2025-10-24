import { Receipt, ReceiptItem } from '../types/receipt'

interface Person {
  id: string
  name: string
}

interface ItemAssignment {
  itemId: string
  personIds: string[]
  isEveryone?: boolean
}

interface PersonBreakdown {
  personId: string
  personName: string
  amountOwed: number
}

export interface ReceiptBreakdown {
  id: string
  userId: string
  merchantName: string
  date: string
  subtotal: number
  tax: number
  tip?: number
  total?: number
  userPaid: number
  peopleBreakdown: PersonBreakdown[]
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const receiptBreakdownApi = {
  async saveReceiptBreakdown(
    userId: string,
    receipt: Receipt,
    people: Person[],
    assignments: ItemAssignment[],
    items: ReceiptItem[]
  ): Promise<ReceiptBreakdown> {
    // Validate numeric fields to prevent NaN
    const payload = {
      userId,
      receipt: {
        merchantName: receipt.merchantName,
        date: receipt.date,
        subtotal: Number.isFinite(receipt.subtotal) ? receipt.subtotal : 0,
        tax: Number.isFinite(receipt.tax) ? receipt.tax : 0,
        tip: receipt.tip !== undefined && Number.isFinite(receipt.tip) ? receipt.tip : undefined,
        total: Number.isFinite(receipt.total) ? receipt.total : 0,
      },
      people,
      assignments,
      items: items.map(item => ({
        ...item,
        price: Number.isFinite(item.price) ? item.price : 0,
      })),
    }

    console.log('Saving receipt breakdown:', payload)

    const response = await fetch(`${API_URL}/api/receipt-breakdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save receipt breakdown')
    }

    const data = await response.json()
    return data.breakdown
  },

  async getUserReceiptBreakdowns(userId: string): Promise<ReceiptBreakdown[]> {
    const response = await fetch(`${API_URL}/api/receipt-breakdowns/${userId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch receipt breakdowns')
    }

    const data = await response.json()
    return data.breakdowns
  },

  async getUserReceiptBreakdownsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReceiptBreakdown[]> {
    const response = await fetch(
      `${API_URL}/api/receipt-breakdowns/${userId}?startDate=${startDate}&endDate=${endDate}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch receipt breakdowns')
    }

    const data = await response.json()
    return data.breakdowns
  },
}
