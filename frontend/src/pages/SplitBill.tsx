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
  const [showFinalTab, setShowFinalTab] = useState(false)

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
          // If item was assigned to "everyone", replace with specific person
          if (updatedAssignments[existingIndex].isEveryone) {
            updatedAssignments[existingIndex] = {
              itemId,
              personIds: [person!.id],
              isEveryone: false
            }
          } else {
            // Add person to existing assignment if not already there
            if (!updatedAssignments[existingIndex].personIds.includes(person!.id)) {
              updatedAssignments[existingIndex] = {
                ...updatedAssignments[existingIndex],
                personIds: [...updatedAssignments[existingIndex].personIds, person!.id],
                isEveryone: false
              }
            }
          }
        } else {
          // Create new assignment
          updatedAssignments.push({
            itemId,
            personIds: [person!.id],
            isEveryone: false
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
            <button className="view-final-tab-button" onClick={() => setShowFinalTab(true)}>
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

      {/* Final Tab Modal */}
      {showFinalTab && (
        <div className="modal-overlay" onClick={() => setShowFinalTab(false)}>
          <div className="modal-content final-tab-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowFinalTab(false)}>
              ✕
            </button>
            <h3 className="modal-title">Final Tab</h3>

            <div className="final-tab-content">
              {people.map(person => {
                const personTotal = calculatePersonTotal(person.id)
                return (
                  <div key={person.id} className="final-tab-row">
                    <span className="final-tab-person-name">{person.name}</span>
                    <span className="final-tab-amount">${personTotal.toFixed(2)}</span>
                  </div>
                )
              })}
              <div className="final-tab-total-row">
                <span className="final-tab-total-label">Total</span>
                <span className="final-tab-total-value">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
