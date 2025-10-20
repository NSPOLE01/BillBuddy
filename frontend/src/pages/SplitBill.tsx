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
  isEveryone?: boolean // Flag to track if explicitly assigned to everyone
}

interface SplitBillState {
  receipt: Receipt
  people: Person[]
  assignments?: ItemAssignment[]
}

export default function SplitBill() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SplitBillState | undefined

  const receipt = state?.receipt
  const initialPeople = state?.people || []
  const initialAssignments = state?.assignments || []

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [people] = useState<Person[]>(initialPeople)
  const [assignments, setAssignments] = useState<ItemAssignment[]>(initialAssignments)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [assignToEveryone, setAssignToEveryone] = useState(false)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  useEffect(() => {
    if (!receipt || people.length === 0) {
      navigate('/list-group')
      return
    }
  }, [receipt, people, navigate])

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
      // Build updated assignments array
      let updatedAssignments = [...assignments]
      const allPersonIds = people.map(p => p.id)

      selectedItems.forEach(itemId => {
        const existingIndex = updatedAssignments.findIndex(a => a.itemId === itemId)
        if (existingIndex !== -1) {
          // Update existing assignment - replace with everyone
          updatedAssignments[existingIndex] = {
            itemId,
            personIds: allPersonIds,
            isEveryone: true
          }
        } else {
          // Create new assignment
          updatedAssignments.push({
            itemId,
            personIds: allPersonIds,
            isEveryone: true
          })
        }
      })

      setAssignments(updatedAssignments)
    } else {
      // Assign to specific person
      if (!selectedPersonId) return

      // Build updated assignments array
      let updatedAssignments = [...assignments]

      selectedItems.forEach(itemId => {
        const existingIndex = updatedAssignments.findIndex(a => a.itemId === itemId)
        if (existingIndex !== -1) {
          // If item was assigned to "everyone", replace with specific person
          if (updatedAssignments[existingIndex].isEveryone) {
            updatedAssignments[existingIndex] = {
              itemId,
              personIds: [selectedPersonId],
              isEveryone: false
            }
          } else {
            // Add person to existing assignment if not already there
            if (!updatedAssignments[existingIndex].personIds.includes(selectedPersonId)) {
              updatedAssignments[existingIndex] = {
                ...updatedAssignments[existingIndex],
                personIds: [...updatedAssignments[existingIndex].personIds, selectedPersonId],
                isEveryone: false
              }
            }
          }
        } else {
          // Create new assignment
          updatedAssignments.push({
            itemId,
            personIds: [selectedPersonId],
            isEveryone: false
          })
        }
      })

      setAssignments(updatedAssignments)
    }

    // Reset
    setShowAssignModal(false)
    setSelectedItems([])
    setSelectedPersonId('')
    setAssignToEveryone(false)
  }

  const getItemAssignedPeople = (itemId: string): Person[] => {
    const assignment = assignments.find(a => a.itemId === itemId)
    if (!assignment) return []
    return people.filter(p => assignment.personIds.includes(p.id))
  }

  const isItemAssignedToEveryone = (itemId: string): boolean => {
    const assignment = assignments.find(a => a.itemId === itemId)
    if (!assignment) return false
    return assignment.isEveryone === true
  }

  const handleUnassignPerson = (itemId: string, personId: string) => {
    setAssignments(assignments.map(a => {
      if (a.itemId === itemId) {
        const updatedPersonIds = a.personIds.filter(id => id !== personId)
        // If no one is assigned, remove the assignment entirely
        if (updatedPersonIds.length === 0) {
          return null as any
        }
        return { ...a, personIds: updatedPersonIds }
      }
      return a
    }).filter(a => a !== null))
  }

  const handleUnassignEveryone = (itemId: string) => {
    setAssignments(assignments.filter(a => a.itemId !== itemId))
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

  const allItemsAssigned = receipt.items.every(item =>
    assignments.some(a => a.itemId === item.id)
  )

  const handleViewFinalTab = () => {
    if (!allItemsAssigned) {
      setShowWarningBanner(true)
      setTimeout(() => setShowWarningBanner(false), 3000)
      return
    }
    navigate('/final-tab', { state: { receipt, people, assignments } })
  }

  return (
    <main className="results-container">
      {showWarningBanner && (
        <div className="warning-banner">
          Please assign all items before proceeding
        </div>
      )}
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
                const assignedToEveryone = isItemAssignedToEveryone(item.id)

                return (
                  <div key={item.id} className="item-container">
                    <div className={`item-row ${isSelected ? 'item-selected' : ''}`}>
                      <span
                        className="item-name"
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        {item.name}
                        {item.quantity && item.quantity > 1 && (
                          <span className="item-quantity"> x{item.quantity}</span>
                        )}
                      </span>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    {assignedPeople.length > 0 && (
                      <div className="assigned-people-chips">
                        {assignedToEveryone ? (
                          <div className="person-chip">
                            <span className="person-chip-name">Everyone</span>
                            <button
                              className="person-chip-unassign"
                              onClick={() => handleUnassignEveryone(item.id)}
                              aria-label="Unassign Everyone"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          assignedPeople.map(person => (
                            <div key={person.id} className="person-chip">
                              <span className="person-chip-name">{person.name}</span>
                              <button
                                className="person-chip-unassign"
                                onClick={() => handleUnassignPerson(item.id, person.id)}
                                aria-label={`Unassign ${person.name}`}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
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

        <div className="button-group">
          {people.length > 0 && (
            <button
              className={`view-final-tab-button ${!allItemsAssigned ? 'disabled' : ''}`}
              onClick={handleViewFinalTab}
            >
              View Final Tab
            </button>
          )}
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
                <select
                  className="person-select"
                  value={selectedPersonId}
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  autoFocus
                >
                  <option value="">Select a person...</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
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
              disabled={!assignToEveryone && !selectedPersonId}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
