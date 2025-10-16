import { AnalyzeExpenseResponse } from '@aws-sdk/client-textract'
import { Receipt, ReceiptItem } from '../types/receipt'
import { v4 as uuidv4 } from 'uuid'

export class ReceiptParser {
  parseTextractResponse(response: AnalyzeExpenseResponse): Receipt {
    const expenseDocuments = response.ExpenseDocuments || []

    if (expenseDocuments.length === 0) {
      throw new Error('No expense document found in Textract response')
    }

    const expenseDoc = expenseDocuments[0]

    // Extract merchant name
    const merchantName = this.extractMerchantName(expenseDoc)

    // Extract line items
    const items = this.extractLineItems(expenseDoc)

    // Extract summary fields (tax, tip, total, etc.)
    const summary = this.extractSummaryFields(expenseDoc)

    const receipt: Receipt = {
      id: uuidv4(),
      merchantName: merchantName || 'Unknown Merchant',
      items: items,
      subtotal: summary.subtotal,
      tax: summary.tax,
      tip: summary.tip,
      total: summary.total,
      date: summary.date,
    }

    return receipt
  }

  private extractMerchantName(expenseDoc: any): string {
    const summaryFields = expenseDoc.SummaryFields || []

    // Look for vendor/merchant name in summary fields
    const vendorField = summaryFields.find((field: any) =>
      field.Type?.Text?.toLowerCase().includes('vendor') ||
      field.Type?.Text?.toLowerCase().includes('merchant') ||
      field.Type?.Text?.toLowerCase().includes('name')
    )

    return vendorField?.ValueDetection?.Text || 'Unknown Merchant'
  }

  private extractLineItems(expenseDoc: any): ReceiptItem[] {
    const lineItemGroups = expenseDoc.LineItemGroups || []
    const items: ReceiptItem[] = []

    for (const group of lineItemGroups) {
      const lineItems = group.LineItems || []

      for (const lineItem of lineItems) {
        const fields = lineItem.LineItemExpenseFields || []

        let itemName = ''
        let itemPrice = 0

        for (const field of fields) {
          const fieldType = field.Type?.Text?.toLowerCase() || ''
          const fieldValue = field.ValueDetection?.Text || ''

          if (fieldType.includes('item') || fieldType.includes('description')) {
            itemName = fieldValue
          } else if (fieldType.includes('price') || fieldType.includes('amount')) {
            itemPrice = this.parsePrice(fieldValue)
          }
        }

        if (itemName && itemPrice > 0) {
          items.push({
            id: uuidv4(),
            name: itemName,
            price: itemPrice,
          })
        }
      }
    }

    return items
  }

  private extractSummaryFields(expenseDoc: any): {
    subtotal: number
    tax: number
    tip?: number
    total: number
    date?: string
  } {
    const summaryFields = expenseDoc.SummaryFields || []

    let subtotal = 0
    let tax = 0
    let tip: number | undefined
    let total = 0
    let date: string | undefined

    for (const field of summaryFields) {
      const fieldType = field.Type?.Text?.toLowerCase() || ''
      const fieldValue = field.ValueDetection?.Text || ''

      if (fieldType.includes('subtotal')) {
        subtotal = this.parsePrice(fieldValue)
      } else if (fieldType.includes('tax')) {
        tax = this.parsePrice(fieldValue)
      } else if (fieldType.includes('tip') || fieldType.includes('gratuity')) {
        tip = this.parsePrice(fieldValue)
      } else if (fieldType.includes('total')) {
        total = this.parsePrice(fieldValue)
      } else if (fieldType.includes('date')) {
        date = fieldValue
      }
    }

    // If total is 0, calculate from components
    if (total === 0) {
      total = subtotal + tax + (tip || 0)
    }

    // If subtotal is 0 but we have total and tax, calculate subtotal
    if (subtotal === 0 && total > 0) {
      subtotal = total - tax - (tip || 0)
    }

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      tip: tip !== undefined ? parseFloat(tip.toFixed(2)) : undefined,
      total: parseFloat(total.toFixed(2)),
      date,
    }
  }

  private parsePrice(priceString: string): number {
    // Remove currency symbols and commas
    const cleaned = priceString.replace(/[$,]/g, '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
}
