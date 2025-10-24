import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Receipt, ReceiptItem } from '../types/receipt'
import './ManualReceipt.css'

interface ManualReceiptState {
  merchantName?: string
  date?: string
  items?: ReceiptItem[]
  tax?: string
  tip?: string
}

export default function ManualReceipt() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ManualReceiptState | undefined

  const [merchantName, setMerchantName] = useState(state?.merchantName || '')
  const [date, setDate] = useState(state?.date || '')
  const [items, setItems] = useState<ReceiptItem[]>(state?.items || [])
  const [tax, setTax] = useState(state?.tax || '')
  const [tip, setTip] = useState(state?.tip || '')

  // Form for adding new item
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (itemName.trim() === '' || itemPrice === '') return

    const price = parseFloat(itemPrice)
    if (isNaN(price) || price <= 0) return

    const quantity = parseInt(itemQuantity) || 1
    const totalPrice = price * quantity

    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      price: totalPrice,
      quantity: quantity > 1 ? quantity : undefined
    }

    setItems([...items, newItem])
    setItemName('')
    setItemPrice('')
    setItemQuantity('')
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleSubmit = () => {
    if (merchantName.trim() === '' || items.length === 0) return

    const taxValue = parseFloat(tax) || 0
    const tipValue = parseFloat(tip) || 0
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const total = subtotal + taxValue + tipValue

    const receipt: Receipt = {
      id: `receipt-${Date.now()}`,
      merchantName: merchantName.trim(),
      items: items,
      subtotal: subtotal,
      tax: taxValue,
      tip: tipValue > 0 ? tipValue : undefined,
      total: total,
      date: date || undefined
    }

    navigate('/results', { state: { receipt, isManualEntry: true } })
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const taxValue = parseFloat(tax) || 0
  const tipValue = parseFloat(tip) || 0
  const total = subtotal + taxValue + tipValue

  const canSubmit = merchantName.trim() !== '' && items.length > 0

  const handleTipPercentage = (percentage: number) => {
    const calculatedTip = subtotal * (percentage / 100)
    setTip(calculatedTip.toFixed(2))
  }

  return (
    <main className="manual-receipt-container">
      <div className="manual-receipt-content">
        <div className="manual-receipt-card">
          <h2 className="manual-receipt-title">Add Receipt Manually</h2>

          <div className="form-section">
            <label className="form-label">Merchant Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Starbucks"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-section">
            <label className="form-label">Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label className="form-label">Items *</label>
            <div className="add-item-section">
              <form onSubmit={(e) => handleAddItem(e)} className="add-item-row">
                <input
                  type="text"
                  className="item-name-input"
                  placeholder="Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <input
                  type="number"
                  className="item-price-input"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <input
                  type="number"
                  className="item-quantity-input"
                  placeholder="Qty"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  min="1"
                />
                <button type="submit" className="add-item-button">
                  Add
                </button>
              </form>
            </div>

            {items.length > 0 && (
              <div className="items-list">
                {items.map(item => (
                  <div key={item.id} className="item-display">
                    <div className="item-display-info">
                      <span className="item-display-name">
                        {item.name}
                        {item.quantity && item.quantity > 1 && (
                          <span className="item-display-quantity"> x{item.quantity}</span>
                        )}
                      </span>
                      <span className="item-display-price">${item.price.toFixed(2)}</span>
                    </div>
                    <button
                      className="remove-item-button"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Tax</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-section">
            <label className="form-label">Tip (Optional)</label>
            <div className="tip-percentage-buttons">
              <button
                type="button"
                className="tip-percentage-button"
                onClick={() => handleTipPercentage(10)}
              >
                10%
              </button>
              <button
                type="button"
                className="tip-percentage-button"
                onClick={() => handleTipPercentage(15)}
              >
                15%
              </button>
              <button
                type="button"
                className="tip-percentage-button"
                onClick={() => handleTipPercentage(20)}
              >
                20%
              </button>
              <button
                type="button"
                className="tip-percentage-button"
                onClick={() => handleTipPercentage(25)}
              >
                25%
              </button>
            </div>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          {items.length > 0 && (
            <div className="totals-preview">
              <div className="total-preview-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-preview-row">
                <span>Tax:</span>
                <span>${taxValue.toFixed(2)}</span>
              </div>
              {tipValue > 0 && (
                <div className="total-preview-row">
                  <span>Tip:</span>
                  <span>${tipValue.toFixed(2)}</span>
                </div>
              )}
              <div className="total-preview-row total-preview-final">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <button
          className={`submit-receipt-button ${!canSubmit ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Continue to Results
        </button>

        <button className="go-back-button" onClick={() => navigate('/')}>
          Go Back
        </button>
      </div>
    </main>
  )
}
