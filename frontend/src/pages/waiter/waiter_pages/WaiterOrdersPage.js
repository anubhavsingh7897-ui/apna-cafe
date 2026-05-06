import { useState } from 'react';
import SimpleOrderCard from '../../../components/SimpleOrderCard';

export default function WaiterOrdersPage({ tables, items, apiRequest, loadTables }) {
  const [tableId, setTableId] = useState('');
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [status, setStatus] = useState('');

  function addToCart(itemId) {
    setCart((current) => {
      const found = current.find((row) => row.item_id === itemId);
      if (found) return current.map((row) => row.item_id === itemId ? { ...row, quantity: row.quantity + 1 } : row);
      return [...current, { item_id: itemId, quantity: 1 }];
    });
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
      loadTables();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function loadActiveOrder(selectedTableId = tableId) {
    if (!selectedTableId) return;
    try {
      setActiveOrder(await apiRequest(`/orders/table/${selectedTableId}`));
      setStatus('');
    } catch (error) {
      setActiveOrder(null);
      setStatus(error.message);
    }
  }

  async function updateOrderStatus(order, nextStatus) {
    await apiRequest(`/orders/${order.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });
    loadActiveOrder(order.table_id);
    loadTables();
  }

  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <section className="card form-card">
          <div className="card-header"><div><h2>Create Order</h2><p className="muted">Select table and add menu items.</p></div></div>
          <div className="form-body">
            <div className="input-group">
              <label>Table</label>
              <select value={tableId} onChange={(e) => { setTableId(e.target.value); loadActiveOrder(e.target.value); }}>
                <option value="">Select table</option>
                {tables.map((table) => <option key={table.id} value={table.id}>Table {table.table_number} - {table.status}</option>)}
              </select>
            </div>
            <div className="users-list">
              {cart.map((row) => {
                const item = items.find((menuItem) => menuItem.id === row.item_id);
                return <div className="user-card" key={row.item_id}><span>{item?.name}</span><strong>Qty {row.quantity}</strong></div>;
              })}
            </div>
            <button className="btn-primary full" onClick={createOrder}>Place Order</button>
            {status && <p className="status-msg">{status}</p>}
          </div>
        </section>
      </aside>
      <div className="tab-main admin-stack">
        <section className="panel">
          <div className="panel-header"><div><h2>Menu</h2><p className="muted">Tap items to add to cart.</p></div></div>
          <div className="items-grid">
            {items.filter((item) => item.is_available).map((item) => (
              <button className="item-card menu-pick-card" key={item.id} onClick={() => addToCart(item.id)}>
                <div className="item-card-body"><h3>{item.name}</h3><p>{item.category}</p><strong>Rs. {Number(item.price).toFixed(2)}</strong></div>
              </button>
            ))}
          </div>
        </section>
        {activeOrder && (
          <SimpleOrderCard
            order={activeOrder}
            actions={(order) => ['preparing', 'ready', 'served'].map((next) => (
              <button className="btn-secondary compact" key={next} onClick={() => updateOrderStatus(order, next)}>{next}</button>
            ))}
          />
        )}
      </div>
    </div>
  );
}
