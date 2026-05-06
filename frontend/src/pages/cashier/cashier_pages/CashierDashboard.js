import { useState, useEffect, useCallback } from 'react';
import BillingAnalyticsDashboard from '../../../components/BillingAnalyticsDashboard';
import appConfig from '../../../config/config';

export default function CashierDashboard({
  tables = [],
  apiRequest,
  loadTables = () => {},
  showToast = () => {},
  confirmToast = () => {}
}) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ payment_method: 'UPI' });
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({});

  const safeTables = Array.isArray(tables) ? tables : [];
  const freeTables = safeTables.filter((table) => table.status === 'free');
  const billingTables = safeTables.filter((table) => table.status === 'billing');
  const occupiedTables = safeTables.filter((table) => table.status === 'occupied');
  const subtotal = Number(activeOrder?.total_amount || 0);
  const sgst = subtotal * 0.05;
  const cgst = subtotal * 0.05;
  const grandTotal = subtotal + sgst + cgst;

  const loadData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        apiRequest('/payments/stats'),
        apiRequest('/config')
      ]);
      setStats(s);
      setConfig(c);
    } catch (err) {
      console.error('loadData:', err);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSelectTable(table) {
    if (table.status === 'free') {
      setSelectedTable(null);
      setActiveOrder(null);
      return;
    }

    setSelectedTable(table);
    setLoading(true);
    setStatus('');

    try {
      const order = await apiRequest(`/orders/table/${table.id}`);
      setActiveOrder(order);
    } catch (error) {
      setActiveOrder(null);
      setStatus(error.message || 'Failed to load bill.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompletePayment(event) {
    event.preventDefault();
    if (!activeOrder) return;

    confirmToast({
      title: 'Collect bill?',
      message: `Collect Rs. ${grandTotal.toFixed(2)} for Table ${selectedTable.table_number}?`,
      onConfirm: async () => {
        setLoading(true);
        setStatus('Processing payment...');

        try {
          const payment = await apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
              order_id: activeOrder.id,
              amount: Number(grandTotal.toFixed(2)),
              payment_method: paymentForm.payment_method
            })
          });

          setStatus('Payment successful. Table cleared.');
          showToast({
            title: 'Amount collected',
            message: payment?.message || `Collected Rs. ${grandTotal.toFixed(2)} successfully.`,
            type: 'success'
          });
          setSelectedTable(null);
          setActiveOrder(null);
          loadTables();
          loadData();
        } catch (error) {
          setStatus(error.message);
          showToast({
            title: 'Collection failed',
            message: error.message,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  }

  function printBill() {
    window.print();
  }

  // Generate UPI QR Link
  const upiUrl = (config.upi_id && activeOrder)
    ? `upi://pay?pa=${config.upi_id}&pn=Apna%20Cafe&am=${grandTotal.toFixed(2)}&cu=INR`
    : null;

  const qrImageUrl = upiUrl
    ? `${appConfig.qr.baseUrl}?size=160x160&data=${encodeURIComponent(upiUrl)}`
    : null;

  return (
    <div className="cashier-layout">
      <section className="cashier-main panel">
        <div className="panel-header">
          <div>
            <h2>Table Wise Billing</h2>
            <p className="muted">
              {freeTables.length} available - {billingTables.length} waiting for bill - {occupiedTables.length} dining
            </p>
          </div>
        </div>

        <div className="cashier-table-grid">
          {safeTables.map((table) => (
            <button
              key={table.id}
              type="button"
              className={`table-card-cashier status-${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
              onClick={() => handleSelectTable(table)}
            >
              <div className="table-card-icon">
                {table.status === 'billing' ? '🧾' : table.status === 'occupied' ? '🍽️' : '✨'}
              </div>
              <div className="table-card-info">
                <h3>Table {table.table_number}</h3>
                <span className="table-status-pill">{table.status}</span>
              </div>
              {table.status !== 'free' && <div className="table-card-pulse" />}
            </button>
          ))}
        </div>
      </section>

      <aside className={`cashier-side panel ${selectedTable ? 'open' : ''}`}>
        {!selectedTable ? (
          <div className="side-container">
            <div className="collection-stats">
              <h3>Today's Collection</h3>
              <p className="stats-total">Rs. {Number(stats?.daily || 0).toLocaleString('en-IN')}</p>
              <div className="stats-row">
                <div>
                  <label>Bills / Customers</label>
                  <strong>{stats?.today?.bills || 0} / {stats?.today?.customers || 0}</strong>
                </div>
                <div>
                  <label>Total Bills</label>
                  <strong>{stats?.totals?.bills || 0}</strong>
                </div>
              </div>
              <div className="stats-row stats-row-extended">
                <div>
                  <label>Cumulative</label>
                  <strong>Rs. {Number(stats?.totals?.collection || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <label>Open Bills</label>
                  <strong>Rs. {Number(stats?.totals?.openBillAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
            <BillingAnalyticsDashboard analytics={stats} compact />
            <div className="side-empty">
              <div className="side-empty-icon">💸</div>
              <p>Select an occupied table to view the bill.</p>
            </div>
          </div>
        ) : (
          <div className="bill-panel">
            <div className="bill-header">
              <button className="btn-close-side" type="button" onClick={() => setSelectedTable(null)}>
                ✕
              </button>
              <h3>Bill Preview</h3>
              <p className="muted">Table {selectedTable.table_number} - Order #{activeOrder?.id || '...'}</p>
            </div>

            {loading && !activeOrder ? (
              <div className="bill-loading">
                <span className="spinner" />
                <p>Loading order details...</p>
              </div>
            ) : activeOrder ? (
              <div className="bill-content">
                <div className="bill-items">
                  {(activeOrder.items || []).map((orderItem) => (
                    <div key={orderItem.id} className="bill-item-row">
                      <span className="oi-qty">{orderItem.quantity}x</span>
                      <span className="oi-name">{orderItem.item?.name || `Item ${orderItem.item_id}`}</span>
                      <span className="oi-price">
                        ₹{(Number(orderItem.price) * Number(orderItem.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bill-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>SGST 5%</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>CGST 5%</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="print-bill" id="print-bill">
                  <h2>APNA CAFE</h2>
                  <p>Table {selectedTable.table_number} - Order #{activeOrder.id}</p>
                  <div className="print-lines">
                    {(activeOrder.items || []).map((orderItem) => (
                      <div key={orderItem.id}>
                        <span>{orderItem.quantity} x {orderItem.item?.name || `Item ${orderItem.item_id}`}</span>
                        <strong>₹{(Number(orderItem.price) * Number(orderItem.quantity)).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="print-totals">
                    <div><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
                    <div><span>SGST 5%</span><strong>₹{sgst.toFixed(2)}</strong></div>
                    <div><span>CGST 5%</span><strong>₹{cgst.toFixed(2)}</strong></div>
                    <div><span>Total</span><strong>₹{grandTotal.toFixed(2)}</strong></div>
                  </div>
                </div>

                <form className="payment-form" onSubmit={handleCompletePayment}>
                  <div className="input-group">
                    <label>Payment Method</label>
                    <div className="method-chips">
                      {['cash', 'UPI', 'card'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`method-chip ${paymentForm.payment_method === method ? 'active' : ''}`}
                          onClick={() => setPaymentForm((current) => ({ ...current, payment_method: method }))}
                        >
                          {method === 'cash' ? '💵 Cash' : method === 'UPI' ? '📱 UPI' : '💳 Card'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentForm.payment_method === 'UPI' && upiUrl && (
                    <div className="upi-qr-section fadeIn">
                      <div className="qr-wrap">
                        <img src={qrImageUrl} alt="Payment QR" />
                      </div>
                      <p className="upi-id-label">{config.upi_id}</p>
                      <small className="muted">Scan with Any UPI App</small>
                    </div>
                  )}

                  {status && (
                    <p className={`status-msg ${status.toLowerCase().includes('fail') ? 'error' : 'success'}`}>
                      {status}
                    </p>
                  )}

                  <div className="btn-group-v">
                    <button className="btn-primary full" type="submit" disabled={loading}>
                      {loading ? <span className="spinner" /> : `Collect ₹${grandTotal.toFixed(2)}`}
                    </button>
                    <button className="btn-secondary full" type="button" onClick={printBill}>
                      Print Receipt
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bill-error">
                <p className="status-msg error">{status || 'Failed to load bill for this table.'}</p>
                <button className="btn-secondary sm" type="button" onClick={() => handleSelectTable(selectedTable)}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
