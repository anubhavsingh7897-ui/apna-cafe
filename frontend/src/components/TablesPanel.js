import { useState } from 'react';

const statusOptions = ['free', 'occupied', 'billing'];

export default function TablesPanel({ tables, onRefresh, onUpdateTable }) {
  const [savingId, setSavingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  async function updateTable(table, updates) {
    if (!onUpdateTable) return;

    setSavingId(table.id);
    setStatusMessage('');

    try {
      await onUpdateTable(table.id, {
        table_number: table.table_number,
        capacity: table.capacity,
        status: table.status,
        ...updates
      });
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Cafe Tables</h2>
          <p className="muted">{tables.length} tables configured</p>
        </div>
        <button className="btn-secondary sm" type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {statusMessage && <p className="status-msg error">{statusMessage}</p>}

      {tables.length === 0 ? (
        <div className="empty-state">
          <p>No tables added yet.</p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => (
            <article className="table-card" key={table.id}>
              <div className="table-card-head">
                <div>
                  <h3>Table {table.table_number}</h3>
                  <p>{table.capacity} seats</p>
                </div>
                <span className={`table-status status-${table.status}`}>
                  {table.status}
                </span>
              </div>

              <div className="table-actions">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`filter-chip ${table.status === status ? 'active' : ''}`}
                    onClick={() => updateTable(table, { status })}
                    disabled={savingId === table.id}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="input-group">
                <label htmlFor={`capacity-${table.id}`}>Capacity</label>
                <input
                  id={`capacity-${table.id}`}
                  type="number"
                  min="1"
                  defaultValue={table.capacity}
                  onBlur={(event) => {
                    const capacity = Number(event.target.value);
                    if (capacity > 0 && capacity !== Number(table.capacity)) {
                      updateTable(table, { capacity });
                    }
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
