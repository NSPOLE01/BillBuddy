import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Receipt } from '../types/receipt'
import './ListGroup.css'

interface Person {
  id: string
  name: string
}

export default function ListGroup() {
  const location = useLocation()
  const navigate = useNavigate()
  const receipt = location.state?.receipt as Receipt | undefined

  const [people, setPeople] = useState<Person[]>([])
  const [personName, setPersonName] = useState('')

  if (!receipt) {
    navigate('/results')
    return null
  }

  const handleAddPerson = () => {
    if (personName.trim() === '') return

    // Check if person already exists
    const exists = people.find(p => p.name.toLowerCase() === personName.trim().toLowerCase())
    if (exists) {
      setPersonName('')
      return
    }

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: personName.trim()
    }

    setPeople([...people, newPerson])
    setPersonName('')
  }

  const handleRemovePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId))
  }

  const handleContinue = () => {
    if (people.length === 0) return
    navigate('/split-bill', { state: { receipt, people } })
  }

  return (
    <main className="list-group-container">
      <div className="list-group-content">
        <div className="list-group-card">
          <h2 className="list-group-title">List Your Group</h2>
          <p className="list-group-subtitle">Who did you dine/shop with?</p>

          <div className="add-person-section">
            <input
              type="text"
              className="person-name-input"
              placeholder="Enter person's name"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              autoFocus
            />
            <button className="add-person-button" onClick={handleAddPerson}>
              Add Person
            </button>
          </div>

          {people.length > 0 && (
            <div className="people-list-section">
              <h3 className="people-list-title">Your Group ({people.length})</h3>
              <div className="people-list">
                {people.map(person => (
                  <div key={person.id} className="person-item">
                    <span className="person-item-name">{person.name}</span>
                    <button
                      className="remove-person-button"
                      onClick={() => handleRemovePerson(person.id)}
                      aria-label={`Remove ${person.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="button-group">
            {people.length > 0 && (
              <button className="continue-split-button" onClick={handleContinue}>
                Continue to Split Bill
              </button>
            )}
            <button className="go-back-button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
