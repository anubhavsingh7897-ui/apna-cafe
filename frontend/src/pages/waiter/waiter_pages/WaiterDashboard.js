import { useState } from 'react';
import SimpleOrderCard from '../../../components/SimpleOrderCard';

export default function WaiterDashboard({ tables, items, apiRequest, loadTables, showToast = () => {} }) {
  const [tableId, setTableId] = useState('');
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const activeTables = tables.filter((table) => table.status !== 'free').length;
  const availableItems = items.filter((item) => item.is_available);

  function addToCart(itemId) {
    setCart((current) => {
      const found = current.find((row) => row.item_id === itemId);
      if (found) {
        return current.map((row) =>
          row.item_id === itemId ? { ...row, quantity: row.quantity + 1 } : row
        );
      }
      return [...current, { item_id: itemId, quantity: 1 }];
    });
  }

  function updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) {
      setCart((current) => current.filter((row) => row.item_id !== itemId));
      return;
    }

    setCart((current) =>
      current.map((row) => row.item_id === itemId ? { ...row, quantity } : row)
    );
  }

  async function loadActiveOrder(selectedTableId = tableId) {
    if (!selectedTableId) return;

    try {
      setActiveOrder(await apiRequest(`/orders/table/${selectedTableId}`));
      setStatus('');
    } catch (error) {
      setActiveOrder(null);
      setStatus('No active order for this table.');
    }
  }

  async function createOrder() {
    if (!tableId || cart.length === 0) {
      setStatus('Select a table and at least one item.');
      return;
    }

    setStatus('Creating order...');
    try {
      const order = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({ table_id: Number(tableId), items: cart })
      });
      setActiveOrder(order);
      setCart([]);
      setStatus('Order created.');
      showToast({
        title: 'Order created',
        message: order?.message || 'Order created successfully.',
        type: 'success'
      });
      loadTables();
    } catch (error) {
      setStatus(error.message);
      showToast({
        title: 'Order creation failed',
        message: error.message,
        type: 'error'
      });
    }
  }

  async function updateOrderStatus(order, nextStatus) {
    try {
      const updated = await apiRequest(`/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast({
        title: 'Order status updated',
        message: updated?.message || `Order status updated to ${nextStatus}.`,
        type: 'success'
      });
      loadActiveOrder(order.table_id);
      loadTables();
    } catch (error) {
      setStatus(error.message);
      showToast({
        title: 'Status update failed',
        message: error.message,
        type: 'error'
      });
    }
  }

  return (
    <div className="waiter-one-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Waiter Workspace</h2>
            <p className="muted">Tables, menu, cart, and active order in one place.</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-icon">T</span><div><p className="stat-value">{tables.length}</p><p className="stat-label">Tables</p></div></div>
          <div className="stat-card"><span className="stat-icon">A</span><div><p className="stat-value">{activeTables}</p><p className="stat-label">Active Tables</p></div></div>
          <div className="stat-card"><span className="stat-icon">M</span><div><p className="stat-value">{availableItems.length}</p><p className="stat-label">Available Items</p></div></div>
        </div>
      </section>

      <div className="waiter-grid">
        <aside className="admin-stack">
          <section className="card form-card">
            <div className="card-header">
              <div>
                <h2>Table & Cart</h2>
                <p className="muted">Choose a table, add items, and place the order.</p>
              </div>
            </div>

            <div className="form-body">
              <div className="input-group">
                <label>Selected Table</label>
                <select
                  value={tableId}
                  onChange={(event) => {
                    setTableId(event.target.value);
                    loadActiveOrder(event.target.value);
                  }}
                >
                  <option value="">Select table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.table_number} - {table.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cart-list">
                {cart.length === 0 ? (
                  <p className="muted">Cart is empty.</p>
                ) : (
                  cart.map((row) => {
                    const item = items.find((menuItem) => menuItem.id === row.item_id);
                    return (
                      <div className="cart-row" key={row.item_id}>
                        <div>
                          <strong>{item?.name}</strong>
                          <p>Rs. {Number(item?.price || 0).toFixed(2)}</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={row.quantity}
                          onChange={(event) => updateCartQuantity(row.item_id, Number(event.target.value))}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <button className="btn-primary full" type="button" onClick={createOrder}>
                Place Order
              </button>
              {status && <p className="status-msg">{status}</p>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Tables</h2>
                <p className="muted">Tap a table to load its active order.</p>
              </div>
              <button className="btn-secondary sm" type="button" onClick={loadTables}>Refresh</button>
            </div>
            <div className="waiter-table-list">
              {tables.map((table) => (
                <button
                  className={`waiter-table-tile ${String(table.id) === String(tableId) ? 'active' : ''}`}
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setTableId(String(table.id));
                    loadActiveOrder(table.id);
                  }}
                >
                  <strong>Table {table.table_number}</strong>
                  <span>{table.capacity} seats</span>
                  <small className={`table-status status-${table.status}`}>{table.status}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div className="admin-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Menu Items</h2>
                <p className="muted">Images are shown for faster order taking.</p>
              </div>
            </div>

            <div className="items-grid">
              {availableItems.map((item) => (
                <button className="item-card menu-pick-card" key={item.id} type="button" onClick={() => addToCart(item.id)}>
                  <div className="item-card-image">
                    {item.image_url && !imageErrors[item.id] ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={() => setImageErrors((current) => ({ ...current, [item.id]: true }))}
                      />
                    ) : (
                      <div className="item-image-placeholder">No image</div>
                    )}
                    <span className="item-badge badge-success">Available</span>
                  </div>
                  <div className="item-card-body">
                    <h3>{item.name}</h3>
                    <p className="item-card-category">{item.category}</p>
                    <strong>Rs. {Number(item.price).toFixed(2)}</strong>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {activeOrder && (
            <SimpleOrderCard
              order={activeOrder}
              actions={(order) => ['preparing', 'ready', 'served'].map((next) => (
                <button className="btn-secondary compact" key={next} type="button" onClick={() => updateOrderStatus(order, next)}>{next}</button>
              ))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
