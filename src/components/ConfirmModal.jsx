import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel animate-scale-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)', 
            color: type === 'danger' ? 'var(--danger)' : 'var(--primary-color)',
            padding: '0.75rem',
            borderRadius: '12px',
            height: 'fit-content'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
