import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'
import { Receipt } from '../types/receipt'
import { receiptBreakdownApi } from '../services/receiptBreakdownApi'
import './ListGroup.css'

interface Person {
  id: string
  name: string
}

export default function ListGroup() {
  const location = useLocation()
  const navigate = useNavigate()
  const receipt = location.state?.receipt as Receipt | undefined
  const initialPeople = location.state?.people as Person[] | undefined

  const [people, setPeople] = useState<Person[]>(initialPeople || [])
  const [personName, setPersonName] = useState('')
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [showDuplicateBanner, setShowDuplicateBanner] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const loadExistingNames = async () => {
      try {
        const user = await getCurrentUser()
        const names = await receiptBreakdownApi.getUniquePersonNames(user.userId)
        setExistingNames(names)
      } catch (error) {
        console.log('Could not load existing names:', error)
      }
    }

    loadExistingNames()
  }, [])

  if (!receipt) {
    navigate('/results')
    return null
  }

  const handleAddPerson = () => {
    if (personName.trim() === '') return

    // Check if person already exists in current group
    const existsInGroup = people.find(p => p.name.toLowerCase() === personName.trim().toLowerCase())
    if (existsInGroup) {
      setShowDuplicateBanner(true)
      setTimeout(() => setShowDuplicateBanner(false), 3000)
      return
    }

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: personName.trim()
    }

    setPeople([...people, newPerson])
    setPersonName('')
    setShowDropdown(false)
  }

  const handleSelectName = (name: string) => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: name.trim()
    }

    setPeople([...people, newPerson])
    setPersonName('')
    setShowDropdown(false)
  }

  const filteredNames = existingNames.filter(name => {
    const notInCurrentGroup = !people.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (personName.trim() === '') {
      return notInCurrentGroup
    }
    return name.toLowerCase().includes(personName.toLowerCase()) && notInCurrentGroup
  })

  const handleRemovePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId))
  }

  const handleContinue = () => {
    if (people.length === 0) return
    navigate('/split-bill', { state: { receipt, people } })
  }

  return (
    <main className="list-group-container">
      {showDuplicateBanner && (
        <div className="duplicate-banner">
          That name already exists. Please add a different name or add a last name.
        </div>
      )}
      <div className="list-group-content">
        <div className="list-group-card">
          <h2 className="list-group-title">List Your Group</h2>
          <p className="list-group-subtitle">Who did you dine/shop with?</p>

          <div className="add-person-section">
            <div className="person-input-container">
              <input
                type="text"
                className="person-name-input"
                placeholder="Enter person's name"
                value={personName}
                onChange={(e) => {
                  setPersonName(e.target.value)
                  setShowDropdown(true)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoFocus
              />
              {showDropdown && filteredNames.length > 0 && (
                <div className="names-dropdown">
                  {filteredNames.map(name => (
                    <div
                      key={name}
                      className="dropdown-item"
                      onClick={() => handleSelectName(name)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        </div>

        {people.length > 0 && (
          <button className="continue-split-button" onClick={handleContinue}>
            Continue to Split Bill
          </button>
        )}

        <button className="go-back-button" onClick={() => navigate('/results', { state: { receipt } })}>
          Go Back
        </button>
      </div>
    </main>
  )
}
