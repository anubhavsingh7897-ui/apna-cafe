import { useState } from 'react';

export default function CashierPaymentsPage({ apiRequest }) {
  const [form, setForm] = useState({ order_id: '', amount: '', payment_method: 'UPI' });
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function createPayment(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('Completing payment...');
    try {
      const saved = await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          order_id: Number(form.order_id),
          amount: Number(form.amount),
          payment_method: form.payment_method
        })
      });
      setPayment(saved);
      setStatus('Payment completed successfully.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Manual Settlement</h2>
            <p className="muted">Directly process a payment using an Order ID.</p>
          </div>
        </div>

        <form className="form-body" onSubmit={createPayment}>
          <div className="form-grid-2">
            <div className="input-group">
              <label>Order Reference ID</label>
              <input
                type="number"
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                placeholder="e.g. 1024"
                required
              />
            </div>
            <div className="input-group">
              <label>Settlement Amount</label>
              <div className="price-input-wrapper">
                <span className="currency-prefix">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="input-group full-col">
              <label>Payment Method</label>
              <div className="method-chips">
                {['Cash', 'UPI', 'Card'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`method-chip ${form.payment_method === m ? 'active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, payment_method: m }))}
                  >
                    {m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'} {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {status && (
            <p className={`status-msg ${status.includes('fail') || status.includes('not found') ? 'error' : 'success'}`}>
              {status}
            </p>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Confirm Payment'}
          </button>
        </form>
      </section>

      {payment && (
        <div className="notice-card highlight-success fadeIn">
          <div className="notice-icon">✅</div>
          <div>
            <h3>Receipt #{payment.id}</h3>
            <p>Settled for Order #{payment.order_id} via {payment.payment_method}</p>
            <strong className="text-primary">Total: ₹{Number(payment.amount).toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
