import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Receipt } from '../types/receipt'
import './SplitBill.css'

interface Person {
  id: string
  name: string
}

interface ItemAssignment {
  itemId: string
  personIds: string[] // Can be split among multiple people
}

export default function SplitBill() {
  const location = useLocation()
  const navigate = useNavigate()
  const receipt = location.state?.receipt as Receipt | undefined

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [assignments, setAssignments] = useState<ItemAssignment[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [personName, setPersonName] = useState('')
  const [assignToEveryone, setAssignToEveryone] = useState(false)

  useEffect(() => {
    if (!receipt) {
      navigate('/results')
      return
    }
  }, [receipt, navigate])

  if (!receipt) {
    return null
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAssignClick = () => {
    if (selectedItems.length === 0) return
    setShowAssignModal(true)
  }

  const handleAssignItems = () => {
    if (assignToEveryone) {
      // Split among all people
      if (people.length === 0) {
        setShowAssignModal(false)
        setSelectedItems([])
        return
      }

      // Build updated assignments array
      let updatedAssignments = [...assignments]
      const allPersonIds = people.map(p => p.id)

      selectedItems.forEach(itemId => {
        const existingIndex = updatedAssignments.findIndex(a => a.itemId === itemId)
        if (existingIndex !== -1) {
          // Update existing assignment
          updatedAssignments[existingIndex] = {
            ...updatedAssignments[existingIndex],
            personIds: allPersonIds
          }
        } else {
          // Create new assignment
          updatedAssignments.push({
            itemId,
            personIds: allPersonIds
          })
        }
      })

      setAssignments(updatedAssignments)
    } else {
      // Assign to specific person
      if (personName.trim() === '') return

      let person = people.find(p => p.name.toLowerCase() === personName.trim().toLowerCase())
      let updatedPeople = [...people]

      if (!person) {
        // Create new person
        person = {
          id: `person-${Date.now()}`,
          name: personName.trim()
        }
        updatedPeople.push(person)
        setPeople(updatedPeople)
      }

      // Build updated assignments array
      let updatedAssignments = [...assignments]

      selectedItems.forEach(itemId => {
        const existingIndex = updatedAssignments.findIndex(a => a.itemId === itemId)
        if (existingIndex !== -1) {
          // Add person to existing assignment if not already there
          if (!updatedAssignments[existingIndex].personIds.includes(person!.id)) {
            updatedAssignments[existingIndex] = {
              ...updatedAssignments[existingIndex],
              personIds: [...updatedAssignments[existingIndex].personIds, person!.id]
            }
          }
        } else {
          // Create new assignment
          updatedAssignments.push({
            itemId,
            personIds: [person!.id]
          })
        }
      })

      setAssignments(updatedAssignments)
    }

    // Reset
    setShowAssignModal(false)
    setSelectedItems([])
    setPersonName('')
    setAssignToEveryone(false)
  }

  const getItemAssignedPeople = (itemId: string): Person[] => {
    const assignment = assignments.find(a => a.itemId === itemId)
    if (!assignment) return []
    return people.filter(p => assignment.personIds.includes(p.id))
  }

  const calculatePersonTotal = (personId: string): number => {
    let total = 0

    assignments.forEach(assignment => {
      if (assignment.personIds.includes(personId)) {
        const item = receipt.items.find(i => i.id === assignment.itemId)
        if (item) {
          const splitCount = assignment.personIds.length
          total += item.price / splitCount
        }
      }
    })

    // Add proportional tax and tip
    const subtotal = receipt.items.reduce((sum, item) => sum + item.price, 0)
    if (subtotal > 0) {
      const proportion = total / subtotal
      total += receipt.tax * proportion
      if (receipt.tip) {
        total += receipt.tip * proportion
      }
    }

    return total
  }

  const subtotal = receipt.items.reduce((sum, item) => sum + item.price, 0)
  const total = subtotal + receipt.tax + (receipt.tip || 0)

  return (
    <main className="results-container">
      <div className="results-content">
        {/* Receipt Card */}
        <div className="receipt-card">
          <h2 className="merchant-name">{receipt.merchantName}</h2>
          {receipt.date && <p className="receipt-date">{receipt.date}</p>}

          <div className="items-section">
            <h3 className="section-title">Items</h3>
            <div className="items-list">
              {receipt.items.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                const assignedPeople = getItemAssignedPeople(item.id)

                return (
                  <div key={item.id} className={`item-row ${isSelected ? 'item-selected' : ''}`}>
                    <span
                      className="item-name"
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      {item.name}
                      {item.quantity && item.quantity > 1 && (
                        <span className="item-quantity"> x{item.quantity}</span>
                      )}
                      {assignedPeople.length > 0 && (
                        <span className="item-assigned-indicator">
                          {' '}→ {assignedPeople.map(p => p.name).join(', ')}
                          {assignedPeople.length > 1 && ` (split ${assignedPeople.length} ways)`}
                        </span>
                      )}
                    </span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="totals-section">
            <div className="total-row subtotal-row">
              <div className="total-label-group">
                <span className="total-label">Subtotal</span>
              </div>
              <div className="total-value-group">
                <span className="total-value">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="total-row">
              <div className="total-label-group">
                <span className="total-label">Tax</span>
              </div>
              <div className="total-value-group">
                <span className="total-value">${receipt.tax.toFixed(2)}</span>
              </div>
            </div>
            {receipt.tip !== undefined && (
              <div className="total-row tip-row">
                <div className="total-label-group">
                  <span className="total-label">Tip</span>
                </div>
                <div className="total-value-group">
                  <span className="total-value">${receipt.tip.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">Total</span>
              <span className="total-value">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {people.length > 0 && (
          <div className="receipt-card">
            <h3 className="section-title">Summary</h3>
            <div className="summary-list">
              {people.map(person => (
                <div key={person.id} className="summary-row">
                  <span className="summary-person-name">{person.name}</span>
                  <span className="summary-amount">${calculatePersonTotal(person.id).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="button-group">
          <button className="go-back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>

      {/* Assign Button (Fixed at bottom) */}
      {selectedItems.length > 0 && (
        <div className="assign-button-container">
          <button className="assign-button" onClick={handleAssignClick}>
            Assign {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
          </button>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowAssignModal(false)}>
              ✕
            </button>
            <h3 className="modal-title">Assign Items</h3>

            <div className="assign-options">
              <div className="assign-option">
                <input
                  type="radio"
                  id="assign-person"
                  name="assign-type"
                  checked={!assignToEveryone}
                  onChange={() => setAssignToEveryone(false)}
                />
                <label htmlFor="assign-person">Assign to specific person</label>
              </div>

              {!assignToEveryone && (
                <input
                  type="text"
                  className="person-input"
                  placeholder="Enter person's name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssignItems()}
                  autoFocus
                />
              )}

              <div className="assign-option">
                <input
                  type="radio"
                  id="assign-everyone"
                  name="assign-type"
                  checked={assignToEveryone}
                  onChange={() => setAssignToEveryone(true)}
                />
                <label htmlFor="assign-everyone">Split among everyone</label>
              </div>
            </div>

            <button
              className="modal-assign-button"
              onClick={handleAssignItems}
              disabled={!assignToEveryone && personName.trim() === ''}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
