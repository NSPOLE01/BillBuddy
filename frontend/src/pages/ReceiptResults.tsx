import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Receipt, ReceiptItem } from '../types/receipt'
import './ReceiptResults.css'

export default function ReceiptResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialReceipt = location.state?.receipt as Receipt | undefined
  const isManualEntry = location.state?.isManualEntry as boolean | undefined

  const [merchantName, setMerchantName] = useState('')
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [tax, setTax] = useState(0)
  const [tip, setTip] = useState<number | undefined>(undefined)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingMerchant, setEditingMerchant] = useState(false)
  const [editingTax, setEditingTax] = useState(false)
  const [editingTip, setEditingTip] = useState(false)
  const [manualSubtotal, setManualSubtotal] = useState<number | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState<string>('')
  const [editingTaxValue, setEditingTaxValue] = useState<string>('')
  const [editingTipValue, setEditingTipValue] = useState<string>('')
  const [editingSubtotalValue, setEditingSubtotalValue] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')

  useEffect(() => {
    if (!initialReceipt) {
      navigate('/')
      return
    }
    setMerchantName(initialReceipt.merchantName)
    setItems(initialReceipt.items)
    setTax(initialReceipt.tax)
    setTip(initialReceipt.tip)
  }, [initialReceipt, navigate])

  if (!initialReceipt) {
    return null
  }

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.price, 0)
  const subtotal = manualSubtotal !== null ? manualSubtotal : calculatedSubtotal
  const total = subtotal + tax + (tip || 0)

  const handleItemNameChange = (id: string, newName: string) => {
    setItems(items.map(item => item.id === id ? { ...item, name: newName } : item))
  }

  const handleItemQuantityChange = (id: string, newQuantity: string) => {
    if (newQuantity === '') {
      setItems(items.map(item => item.id === id ? { ...item, quantity: undefined } : item))
    } else {
      const qty = parseInt(newQuantity)
      if (!isNaN(qty) && qty > 0) {
        setItems(items.map(item => item.id === id ? { ...item, quantity: qty } : item))
      }
    }
  }

  const handleItemPriceChange = (id: string, newPrice: string) => {
    // Allow only numbers and one decimal point anywhere
    const decimalCount = (newPrice.match(/\./g) || []).length
    if (newPrice === '' || (decimalCount <= 1 && /^[\d.]*$/.test(newPrice))) {
      setEditingPriceValue(newPrice)
      const price = newPrice === '' || newPrice === '.' ? 0 : parseFloat(newPrice)
      setItems(items.map(item => item.id === id ? { ...item, price: isNaN(price) ? 0 : price } : item))
    }
  }

  const handleItemPriceEditStart = (itemId: string, currentPrice: number) => {
    setEditingItemId(itemId)
    setEditingPriceValue(currentPrice.toString())
  }

  const handleItemPriceEditEnd = () => {
    setEditingItemId(null)
    setEditingPriceValue('')
  }

  const handleAddTip = () => {
    setTip(0)
    setEditingTip(false)
  }

  const handleTipPercentage = (percentage: number) => {
    const tipAmount = subtotal * (percentage / 100)
    setTip(tipAmount)
    setEditingTip(false)
  }

  const handleTipChange = (newTip: string) => {
    // Allow only numbers and one decimal point anywhere
    const decimalCount = (newTip.match(/\./g) || []).length
    if (newTip === '' || (decimalCount <= 1 && /^[\d.]*$/.test(newTip))) {
      setEditingTipValue(newTip)
      const tipValue = newTip === '' || newTip === '.' ? 0 : parseFloat(newTip)
      setTip(isNaN(tipValue) ? 0 : tipValue)
    }
  }

  const handleTipEditStart = () => {
    setEditingTip(true)
    setEditingTipValue(tip !== undefined ? tip.toString() : '0')
  }

  const handleTipEditEnd = () => {
    setEditingTip(false)
    setEditingTipValue('')
  }

  const handleRemoveTip = () => {
    setTip(undefined)
    setEditingTip(false)
  }

  const confirmDelete = (action: () => void) => {
    setDeleteAction(() => action)
    setShowDeleteModal(true)
  }

  const handleProceedDelete = () => {
    if (deleteAction) {
      deleteAction()
    }
    setShowDeleteModal(false)
    setDeleteAction(null)
  }

  const handleCloseModal = () => {
    setShowDeleteModal(false)
    setDeleteAction(null)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    if (editingItemId === id) {
      setEditingItemId(null)
    }
  }

  const handleRemoveSubtotal = () => {
    setManualSubtotal(null)
  }

  const handleRemoveTax = () => {
    setTax(0)
    setEditingTax(false)
  }

  const handleSubtotalChange = (newSubtotal: string) => {
    // Allow only numbers and one decimal point anywhere
    const decimalCount = (newSubtotal.match(/\./g) || []).length
    if (newSubtotal === '' || (decimalCount <= 1 && /^[\d.]*$/.test(newSubtotal))) {
      setEditingSubtotalValue(newSubtotal)
      const subtotalValue = newSubtotal === '' || newSubtotal === '.' ? 0 : parseFloat(newSubtotal)
      setManualSubtotal(isNaN(subtotalValue) ? 0 : subtotalValue)
    }
  }

  const handleSubtotalEditStart = (currentSubtotal: number) => {
    setManualSubtotal(currentSubtotal)
    setEditingSubtotalValue(currentSubtotal.toString())
  }

  const handleSubtotalEditEnd = () => {
    setManualSubtotal(null)
    setEditingSubtotalValue('')
  }

  const handleTaxChange = (newTax: string) => {
    // Allow only numbers and one decimal point anywhere
    const decimalCount = (newTax.match(/\./g) || []).length
    if (newTax === '' || (decimalCount <= 1 && /^[\d.]*$/.test(newTax))) {
      setEditingTaxValue(newTax)
      const taxValue = newTax === '' || newTax === '.' ? 0 : parseFloat(newTax)
      setTax(isNaN(taxValue) ? 0 : taxValue)
    }
  }

  const handleTaxEditStart = () => {
    setEditingTax(true)
    setEditingTaxValue(tax.toString())
  }

  const handleTaxEditEnd = () => {
    setEditingTax(false)
    setEditingTaxValue('')
  }

  const handleAddItem = () => {
    setIsAddingItem(true)
    setNewItemName('')
    setNewItemPrice('')
  }

  const handleNewItemPriceChange = (newPrice: string) => {
    const decimalCount = (newPrice.match(/\./g) || []).length
    if (newPrice === '' || (decimalCount <= 1 && /^[\d.]*$/.test(newPrice))) {
      setNewItemPrice(newPrice)
    }
  }

  const handleSaveNewItem = () => {
    if (newItemName.trim() === '' || newItemPrice === '') {
      return
    }
    const price = parseFloat(newItemPrice)
    if (isNaN(price)) {
      return
    }
    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      price: price
    }
    setItems([...items, newItem])
    setIsAddingItem(false)
    setNewItemName('')
    setNewItemPrice('')
  }

  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemName('')
    setNewItemPrice('')
  }

  return (
    <main className="results-container">
      <div className="results-content">
        <div className="receipt-card">
          {editingMerchant ? (
            <input
              type="text"
              className="merchant-name-input"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              onBlur={() => setEditingMerchant(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingMerchant(false)}
              autoFocus
            />
          ) : (
            <h2 className="merchant-name" onClick={() => setEditingMerchant(true)}>
              {merchantName}
            </h2>
          )}
          {initialReceipt.date && <p className="receipt-date">{initialReceipt.date}</p>}

          <div className="items-section">
            <h3 className="section-title">Items</h3>
            <div className="items-list">
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <button
                    className="remove-item-button"
                    onClick={() => confirmDelete(() => handleRemoveItem(item.id))}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                  {editingItemId === item.id ? (
                    <>
                      <input
                        type="text"
                        className="item-name-input"
                        value={item.name}
                        onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleItemPriceEditEnd()}
                        autoFocus
                      />
                      <input
                        type="number"
                        className="item-quantity-input"
                        value={item.quantity || 1}
                        onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleItemPriceEditEnd()}
                        min="1"
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        className="item-price-input"
                        value={editingPriceValue}
                        onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleItemPriceEditEnd()}
                      />
                    </>
                  ) : (
                    <>
                      <span className="item-name" onClick={() => handleItemPriceEditStart(item.id, item.price)}>
                        {item.name}
                        <span className="item-quantity"> x{item.quantity || 1}</span>
                      </span>
                      <span className="item-price" onClick={() => handleItemPriceEditStart(item.id, item.price)}>
                        ${item.price.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              ))}
              {isAddingItem && (
                <div className="item-row">
                  <button
                    className="remove-item-button"
                    onClick={handleCancelAddItem}
                    aria-label="Cancel add item"
                  >
                    ✕
                  </button>
                  <input
                    type="text"
                    className="item-name-input"
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewItem()}
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    className="item-price-input"
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={(e) => handleNewItemPriceChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewItem()}
                  />
                </div>
              )}
            </div>
            {!isAddingItem && (
              <button className="add-item-button" onClick={handleAddItem}>
                + Add Item
              </button>
            )}
          </div>

          <div className="totals-section">
            <div className="total-row subtotal-row">
              <div className="total-label-group">
                {manualSubtotal !== null && (
                  <button
                    className="remove-total-button"
                    onClick={() => confirmDelete(handleRemoveSubtotal)}
                    aria-label="Remove manual subtotal"
                  >
                    ✕
                  </button>
                )}
                <span className="total-label">Subtotal</span>
              </div>
              <div className="total-value-group">
                {manualSubtotal !== null ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    className="total-input"
                    value={editingSubtotalValue}
                    onChange={(e) => handleSubtotalChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubtotalEditEnd()}
                    autoFocus
                  />
                ) : (
                  <span className="total-value" onClick={() => handleSubtotalEditStart(subtotal)}>
                    ${subtotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="total-row">
              <div className="total-label-group">
                <span className="total-label">Tax</span>
              </div>
              <div className="total-value-group">
                {editingTax ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    className="total-input"
                    value={editingTaxValue}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTaxEditEnd()}
                    autoFocus
                  />
                ) : (
                  <span className="total-value" onClick={handleTaxEditStart}>
                    ${tax.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {tip !== undefined ? (
              <div className="total-row tip-row">
                <div className="total-label-group">
                  <button
                    className="remove-total-button"
                    onClick={() => confirmDelete(handleRemoveTip)}
                    aria-label="Remove tip"
                  >
                    ✕
                  </button>
                  <span className="total-label">Tip</span>
                </div>
                <div className="total-value-group">
                  {editingTip ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      className="total-input"
                      value={editingTipValue}
                      onChange={(e) => handleTipChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTipEditEnd()}
                      autoFocus
                    />
                  ) : (
                    <span className="total-value" onClick={handleTipEditStart}>
                      ${tip.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="tip-options">
                <span className="tip-label-text">Tip</span>
                <div className="tip-percentage-buttons">
                  <button className="tip-percentage-button" onClick={() => handleTipPercentage(10)}>
                    10%
                  </button>
                  <button className="tip-percentage-button" onClick={() => handleTipPercentage(15)}>
                    15%
                  </button>
                  <button className="tip-percentage-button" onClick={() => handleTipPercentage(20)}>
                    20%
                  </button>
                  <button className="tip-percentage-button" onClick={() => handleTipPercentage(25)}>
                    25%
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  className="tip-custom-input"
                  placeholder="0.00"
                  value={editingTipValue}
                  onChange={(e) => handleTipChange(e.target.value)}
                  onFocus={() => {
                    if (tip === undefined) {
                      setTip(0)
                      setEditingTip(true)
                      setEditingTipValue('0')
                    } else {
                      setEditingTip(true)
                      setEditingTipValue(tip.toString())
                    }
                  }}
                  onBlur={() => {
                    if (tip === 0 || editingTipValue === '' || editingTipValue === '0') {
                      setTip(undefined)
                    }
                    setEditingTip(false)
                    setEditingTipValue('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (tip === 0 || editingTipValue === '' || editingTipValue === '0') {
                        setTip(undefined)
                      }
                      setEditingTip(false)
                      setEditingTipValue('')
                      e.currentTarget.blur()
                    }
                  }}
                />
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">Total</span>
              <span className="total-value">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button
            className="continue-button"
            onClick={() => navigate('/list-group', {
              state: {
                receipt: {
                  merchantName,
                  items,
                  tax,
                  tip,
                  date: initialReceipt.date
                }
              }
            })}
          >
            Create My Group
          </button>
          <button
            className="go-back-button"
            onClick={() => {
              if (isManualEntry) {
                navigate('/manual-receipt', {
                  state: {
                    merchantName,
                    date: initialReceipt.date,
                    items,
                    tax: tax.toString(),
                    tip: tip !== undefined ? tip.toString() : ''
                  }
                })
              } else {
                navigate(-1)
              }
            }}
          >
            Go Back
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={handleCloseModal} aria-label="Close modal">
              ✕
            </button>
            <h3 className="modal-title">Confirm Deletion</h3>
            <p className="modal-message">You cannot undo this action. Are you sure you want to proceed?</p>
            <div className="modal-buttons">
              <button className="modal-proceed-button" onClick={handleProceedDelete}>
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
