import { useState } from 'react'
import { signUp, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth'
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

  const handleGoogleSignUp = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' })
    } catch (err: any) {
      console.error('Google sign up error:', err)
      setError(err.message || 'Failed to sign up with Google')
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
          <span className="auth-divider-text">or</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignUp}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

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
