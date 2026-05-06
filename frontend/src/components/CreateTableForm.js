import { useState } from 'react';

const emptyForm = {
  table_number: '',
  capacity: '',
  status: 'free'
};

export default function CreateTableForm({ onCreated, apiRequest }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('Creating table...');

    try {
      await apiRequest('/tables', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity)
        })
      });

      setForm(emptyForm);
      setStatus('Table created successfully.');
      if (onCreated) onCreated();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <div>
          <h2>Create Table</h2>
          <p className="muted">Add seating tables for table-based orders.</p>
        </div>
      </div>

      <form className="form-body" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-group">
            <label htmlFor="table-number">Table Number</label>
            <input
              id="table-number"
              value={form.table_number}
              onChange={(event) => setField('table_number', event.target.value)}
              placeholder="T01"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="table-capacity">Capacity</label>
            <input
              id="table-capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(event) => setField('capacity', event.target.value)}
              placeholder="4"
              required
            />
          </div>

          <div className="input-group full-col">
            <label htmlFor="table-status">Status</label>
            <select
              id="table-status"
              value={form.status}
              onChange={(event) => setField('status', event.target.value)}
            >
              <option value="free">Free</option>
              <option value="occupied">Occupied</option>
              <option value="billing">Billing</option>
            </select>
          </div>
        </div>

        <button className="btn-primary full" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Table'}
        </button>

        {status && (
          <p className={`status-msg ${status.includes('successfully') ? 'success' : 'error'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
