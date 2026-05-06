import { useCallback, useEffect, useMemo, useState } from 'react';
import appConfig from '../../../config/config';

function money(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

export default function CashierManualBillingPage({
  items = [],
  apiRequest,
  loadTables = () => {},
  showToast = () => {},
  confirmToast = () => {}
}) {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [config, setConfig] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const availableItems = items.filter((item) => item.is_available);
  const billRows = useMemo(() => cart.map((row) => {
    const item = items.find((current) => current.id === row.item_id);
    return {
      ...row,
      item,
      subtotal: Number(item?.price || 0) * Number(row.quantity || 0)
    };
  }), [cart, items]);
  const subtotal = billRows.reduce((sum, row) => sum + row.subtotal, 0);
  const sgst = subtotal * 0.05;
  const cgst = subtotal * 0.05;
  const grandTotal = subtotal + sgst + cgst;

  const loadConfig = useCallback(async () => {
    try {
      setConfig(await apiRequest('/config'));
    } catch (error) {
      setStatus(error.message);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function addToCart(item) {
    setCart((current) => {
      const found = current.find((row) => row.item_id === item.id);
      if (found) {
        return current.map((row) =>
          row.item_id === item.id ? { ...row, quantity: row.quantity + 1 } : row
        );
      }
      return [...current, { item_id: item.id, quantity: 1 }];
    });
  }

  function updateQuantity(itemId, quantity) {
    const nextQuantity = Number(quantity);

    if (nextQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart((current) =>
      current.map((row) => row.item_id === itemId ? { ...row, quantity: nextQuantity } : row)
    );
  }

  function removeItem(itemId) {
    const row = billRows.find((current) => current.item_id === itemId);

    confirmToast({
      title: 'Remove item?',
      message: `${row?.item?.name || 'This item'} will be removed from the manual bill.`,
      onConfirm: async () => {
        setCart((current) => current.filter((cartRow) => cartRow.item_id !== itemId));
        showToast({
          title: 'Item removed',
          message: `${row?.item?.name || 'Item'} removed from the bill.`,
          type: 'success'
        });
      }
    });
  }

  async function createAndCollect() {
    if (cart.length === 0) {
      setStatus('Select at least one item to bill.');
      return;
    }

    confirmToast({
      title: 'Collect manual bill?',
      message: `Collect ${money(grandTotal)} for this counter bill?`,
      onConfirm: async () => {
        setLoading(true);
        setStatus('Creating manual bill...');

        try {
          const order = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({
              items: cart,
              manual: true
            })
          });

          const payment = await apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
              order_id: order.id,
              amount: Number(grandTotal.toFixed(2)),
              payment_method: paymentMethod
            })
          });

          setCart([]);
          setStatus('Manual bill collected successfully.');
          loadTables();
          showToast({
            title: 'Manual bill collected',
            message: payment?.message || `Collected ${money(grandTotal)} successfully.`,
            type: 'success'
          });
        } catch (error) {
          setStatus(error.message);
          showToast({
            title: 'Manual collection failed',
            message: error.message,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  }

  const upiUrl = (config.upi_id && grandTotal > 0)
    ? `upi://pay?pa=${config.upi_id}&pn=Apna%20Cafe&am=${grandTotal.toFixed(2)}&cu=INR`
    : null;

  const qrImageUrl = upiUrl
    ? `${appConfig.qr.baseUrl}?size=150x150&data=${encodeURIComponent(upiUrl)}`
    : null;

  return (
    <div className="manual-billing-layout">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Manual Billing</h2>
            <p className="muted">Create and collect a bill directly from the cashier counter.</p>
          </div>
        </div>

        <div className="manual-menu-grid">
          {availableItems.map((item) => (
            <button className="manual-menu-item" key={item.id} type="button" onClick={() => addToCart(item)}>
              <div className="manual-menu-image">
                {item.image_url && !imageErrors[item.id] ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    onError={() => setImageErrors((current) => ({ ...current, [item.id]: true }))}
                  />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className="manual-menu-copy">
                <span>{item.name}</span>
                <small>{item.category}</small>
                <strong>{money(item.price)}</strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="panel manual-bill-panel">
        <div className="panel-header">
          <div>
            <h2>Bill</h2>
            <p className="muted">Counter billing</p>
          </div>
        </div>

        <div className="manual-cart-list">
          {billRows.length === 0 ? (
            <p className="muted">No items selected.</p>
          ) : billRows.map((row) => (
            <div className="manual-cart-row" key={row.item_id}>
              <div>
                <strong>{row.item?.name}</strong>
                <span>{money(row.item?.price)} each</span>
              </div>
              <input
                type="number"
                min="1"
                value={row.quantity}
                onChange={(event) => updateQuantity(row.item_id, event.target.value)}
              />
              <strong>{money(row.subtotal)}</strong>
              <button className="btn-danger compact" type="button" onClick={() => removeItem(row.item_id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="bill-summary manual-summary">
          <div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="summary-row"><span>SGST 5%</span><span>{money(sgst)}</span></div>
          <div className="summary-row"><span>CGST 5%</span><span>{money(cgst)}</span></div>
          <div className="summary-row total"><span>Total Amount</span><span>{money(grandTotal)}</span></div>
        </div>

        <div className="input-group">
          <label>Payment Method</label>
          <div className="method-chips">
            {['cash', 'UPI', 'card'].map((method) => (
              <button
                key={method}
                type="button"
                className={`method-chip ${paymentMethod === method ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'UPI' && qrImageUrl && (
          <div className="upi-qr-section">
            <div className="qr-wrap">
              <img src={qrImageUrl} alt="Payment QR" />
            </div>
            <p className="upi-id-label">{config.upi_id}</p>
          </div>
        )}

        {status && <p className={`status-msg ${status.includes('failed') ? 'error' : 'success'}`}>{status}</p>}

        <button className="btn-primary full" type="button" disabled={loading} onClick={createAndCollect}>
          {loading ? <span className="spinner" /> : `Collect ${money(grandTotal)}`}
        </button>
      </aside>
    </div>
  );
}
