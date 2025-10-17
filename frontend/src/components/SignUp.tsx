import { useState } from 'react'
import { signUp, confirmSignUp } from 'aws-amplify/auth'
import './Login.css'

interface SignUpProps {
  onLoginClick: () => void
  onSignUpSuccess: () => void
}

export default function SignUp({ onLoginClick, onSignUpSuccess }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Generate a username from email (remove @ and everything after)
      const generatedUsername = email.split('@')[0] + Math.random().toString(36).substring(2, 6)
      setUsername(generatedUsername)

      await signUp({
        username: generatedUsername,
        password: password,
        options: {
          userAttributes: {
            email: email,
            given_name: firstName,
            family_name: lastName,
          },
        },
      })
      setNeedsConfirmation(true)
      setSuccess('Account created! Please check your email for a confirmation code.')
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await confirmSignUp({
        username: username,
        confirmationCode: confirmationCode,
      })
      setSuccess('Email confirmed! You can now log in.')
      setTimeout(() => {
        onSignUpSuccess()
      }, 2000)
    } catch (err: any) {
      console.error('Confirmation error:', err)
      setError(err.message || 'Failed to confirm email')
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Confirm Email</h2>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleConfirmation} className="auth-form">
            <div className="form-group">
              <label htmlFor="confirmationCode" className="form-label">
                Confirmation Code
              </label>
              <input
                id="confirmationCode"
                type="text"
                className="form-input"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                placeholder="Enter code from email"
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Email'}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">Already have an account?</span>
          </div>

          <button
            className="auth-secondary-button"
            onClick={onLoginClick}
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-text">Already have an account?</span>
        </div>

        <button
          className="auth-secondary-button"
          onClick={onLoginClick}
        >
          Log In
        </button>
      </div>
    </div>
  )
}
