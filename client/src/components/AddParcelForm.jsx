// Inline form to register a new expected parcel (Module 1 Forms & Module 4 React State)
import React, { useState } from 'react';

function AddParcelForm({ onAdd, onCancel }) {
  const [itemDescription, setItemDescription] = useState('');
  const [sender, setSender] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!itemDescription.trim() || itemDescription.trim().length < 2) {
      setError('Item description must be at least 2 characters.');
      return;
    }
    if (!sender.trim() || sender.trim().length < 2) {
      setError('Sender must be at least 2 characters.');
      return;
    }
    try {
      await onAdd({
        itemDescription: itemDescription.trim(),
        sender: sender.trim(),
        expectedDate: expectedDate || undefined
      });
      setItemDescription('');
      setSender('');
      setExpectedDate('');
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-parcel-inline-form">
      <div className="add-form-header">
        <strong>New parcel</strong>
        {onCancel && (
          <button type="button" className="close-text-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && <div className="panel-error-line">{error}</div>}
      <input
        type="text"
        className="panel-input"
        placeholder="Item description (e.g. Phone Case)"
        value={itemDescription}
        onChange={(e) => setItemDescription(e.target.value)}
      />
      <input
        type="text"
        className="panel-input"
        placeholder="Sender (e.g. Amazon)"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <input
        type="date"
        className="panel-input"
        title="Expected on (optional)"
        value={expectedDate}
        onChange={(e) => setExpectedDate(e.target.value)}
      />
      <button type="submit" className="btn-primary-action">
        Save parcel
      </button>
    </form>
  );
}

export default AddParcelForm;
