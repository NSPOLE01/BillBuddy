export interface PersonBreakdown {
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

export interface SaveReceiptBreakdownRequest {
  receipt: {
    merchantName: string
    date?: string
    subtotal: number
    tax: number
    tip?: number
    total?: number
  }
  people: Array<{
    id: string
    name: string
  }>
  assignments: Array<{
    itemId: string
    personIds: string[]
    isEveryone?: boolean
  }>
  items: Array<{
    id: string
    name: string
    price: number
    quantity?: number
  }>
}
