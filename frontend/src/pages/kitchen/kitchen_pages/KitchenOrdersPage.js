import { useCallback, useEffect, useState } from 'react';
import SimpleOrderCard from '../../../components/SimpleOrderCard';

export default function KitchenOrdersPage({ apiRequest, showToast = () => {} }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  const loadKitchenOrders = useCallback(async () => {
    try {
      setOrders(await apiRequest('/kitchen/orders'));
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadKitchenOrders();
  }, [loadKitchenOrders]);

  async function updateItemStatus(orderItemId, nextStatus) {
    try {
      const updated = await apiRequest(`/order-items/${orderItemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast({
        title: 'Item status updated',
        message: updated?.message || `Item status updated to ${nextStatus}.`,
        type: 'success'
      });
      loadKitchenOrders();
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
    <section className="panel">
      <div className="panel-header"><div><h2>Kitchen Orders</h2><p className="muted">Update item-level preparation status.</p></div><button className="btn-secondary sm" onClick={loadKitchenOrders}>Refresh</button></div>
      {status && <p className="status-msg error">{status}</p>}
      <div className="tables-grid">
        {orders.map((order) => (
          <SimpleOrderCard
            key={order.id}
            order={order}
            actions={() => (order.items || []).flatMap((item) => [
              <button className="btn-secondary compact" key={`${item.id}-preparing`} onClick={() => updateItemStatus(item.id, 'preparing')}>{item.item?.name}: preparing</button>,
              <button className="btn-primary compact" key={`${item.id}-ready`} onClick={() => updateItemStatus(item.id, 'ready')}>{item.item?.name}: ready</button>
            ])}
          />
        ))}
      </div>
    </section>
  );
}
