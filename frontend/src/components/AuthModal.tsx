import './AuthModal.css'

interface AuthModalProps {
  onClose: () => void
  onCreateAccount: () => void
}

export default function AuthModal({ onClose, onCreateAccount }: AuthModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Account Required</h2>
        <p className="modal-message">
          You need an account to view spending patterns and track your expenses over time.
        </p>
        <button className="modal-button" onClick={onCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  )
}
