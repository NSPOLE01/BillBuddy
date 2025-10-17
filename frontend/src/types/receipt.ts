export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity?: number
}

export interface Receipt {
  id: string
  merchantName: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip?: number
  total: number
  date?: string
}
