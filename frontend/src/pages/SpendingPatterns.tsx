import { useState, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'
import { receiptBreakdownApi, ReceiptBreakdown } from '../services/receiptBreakdownApi'
import './SpendingPatterns.css'

export default function SpendingPatterns() {
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState<ReceiptBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days' | 'year'>('all')

  useEffect(() => {
    loadReceipts()
  }, [selectedPeriod])

  const loadReceipts = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()

      let fetchedReceipts: ReceiptBreakdown[]

      if (selectedPeriod === 'all') {
        fetchedReceipts = await receiptBreakdownApi.getUserReceiptBreakdowns(user.userId)
      } else {
        const endDate = new Date()
        const startDate = new Date()

        if (selectedPeriod === '30days') {
          startDate.setDate(startDate.getDate() - 30)
        } else if (selectedPeriod === '90days') {
          startDate.setDate(startDate.getDate() - 90)
        } else if (selectedPeriod === 'year') {
          startDate.setFullYear(startDate.getFullYear() - 1)
        }

        fetchedReceipts = await receiptBreakdownApi.getUserReceiptBreakdownsByDateRange(
          user.userId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      }

      setReceipts(fetchedReceipts)
    } catch (err) {
      console.error('Error loading receipts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }

  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.userPaid, 0)

  // Calculate who owes you the most
  const owedByPerson = new Map<string, number>()
  receipts.forEach(receipt => {
    receipt.peopleBreakdown.forEach(person => {
      const current = owedByPerson.get(person.personName) || 0
      owedByPerson.set(person.personName, current + person.amountOwed)
    })
  })

  const topDebtors = Array.from(owedByPerson.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <main className="spending-patterns-container">
      <div className="spending-patterns-content">
        <h1 className="spending-patterns-title">Spending Patterns</h1>

        <div className="period-selector">
          <button
            className={`period-button ${selectedPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('all')}
          >
            All Time
          </button>
          <button
            className={`period-button ${selectedPeriod === '30days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('30days')}
          >
            Last 30 Days
          </button>
          <button
            className={`period-button ${selectedPeriod === '90days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('90days')}
          >
            Last 90 Days
          </button>
          <button
            className={`period-button ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Last Year
          </button>
        </div>

        {loading && <p className="loading-message">Loading your receipts...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <h3 className="summary-card-title">Total Spent</h3>
                <p className="summary-card-value">${totalSpent.toFixed(2)}</p>
                <p className="summary-card-subtitle">{receipts.length} receipts</p>
              </div>

              {topDebtors.length > 0 && (
                <div className="summary-card">
                  <h3 className="summary-card-title">Top Debtor</h3>
                  <p className="summary-card-value">{topDebtors[0][0]}</p>
                  <p className="summary-card-subtitle">Owes ${topDebtors[0][1].toFixed(2)}</p>
                </div>
              )}
            </div>

            {topDebtors.length > 0 && (
              <div className="debtors-section">
                <h2 className="section-title">Who Owes You</h2>
                <div className="debtors-list">
                  {topDebtors.map(([name, amount]) => (
                    <div key={name} className="debtor-row">
                      <span className="debtor-name">{name}</span>
                      <span className="debtor-amount">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="receipts-section">
              <h2 className="section-title">Receipt History</h2>
              {receipts.length === 0 ? (
                <p className="empty-message">No receipts found for this period.</p>
              ) : (
                <div className="receipts-list">
                  {receipts.map(receipt => (
                    <div key={receipt.id} className="receipt-card">
                      <div className="receipt-header">
                        <h3 className="receipt-merchant">{receipt.merchantName}</h3>
                        <p className="receipt-date">{new Date(receipt.date).toLocaleDateString()}</p>
                      </div>
                      <div className="receipt-details">
                        <div className="receipt-total">
                          <span>Total:</span>
                          <span>${(receipt.total ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="receipt-breakdown">
                          {receipt.peopleBreakdown?.map(person => (
                            <div key={person.personId} className="breakdown-row">
                              <span>{person.personName}</span>
                              <span>${(person.amountOwed ?? 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="go-back-button" onClick={() => navigate('/')}>
              Go Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}
