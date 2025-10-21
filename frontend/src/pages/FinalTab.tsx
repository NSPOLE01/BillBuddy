import { useLocation, useNavigate } from 'react-router-dom'
import { Receipt } from '../types/receipt'
import './FinalTab.css'

interface Person {
  id: string
  name: string
}

interface ItemAssignment {
  itemId: string
  personIds: string[]
  isEveryone?: boolean
}

interface FinalTabState {
  receipt: Receipt
  people: Person[]
  assignments: ItemAssignment[]
}

export default function FinalTab() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as FinalTabState | undefined

  if (!state || !state.receipt || !state.people || !state.assignments) {
    navigate('/split-bill')
    return null
  }

  const { receipt, people, assignments } = state

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

  const total = receipt.items.reduce((sum, item) => sum + item.price, 0) + receipt.tax + (receipt.tip || 0)

  const handleGoBack = () => {
    navigate('/split-bill', { state: { receipt, people, assignments } })
  }

  return (
    <main className="final-tab-container">
      <div className="final-tab-content">
        <div className="final-tab-card">
          <h2 className="final-tab-merchant">{receipt.merchantName}</h2>
          {receipt.date && <p className="final-tab-date">{receipt.date}</p>}

          <div className="final-tab-section">
            <h3 className="final-tab-section-title">Summary</h3>
            <div className="final-tab-list">
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
        <button className="final-tab-back-button" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    </main>
  )
}
