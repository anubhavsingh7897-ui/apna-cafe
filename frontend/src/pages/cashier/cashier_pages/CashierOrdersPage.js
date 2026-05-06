import { useCallback, useEffect, useState } from 'react';
import SimpleOrderCard from '../../../components/SimpleOrderCard';

export default function CashierOrdersPage({ apiRequest, showToast = () => {} }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await apiRequest('/orders'));
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  }, [apiRequest]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function markBilling(order) {
    try {
      const updated = await apiRequest(`/tables/${order.table_id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'billing', capacity: order.table?.capacity || 1 })
      });
      showToast({
        title: 'Billing status updated',
        message: updated?.message || `Table ${order.table?.table_number || order.table_id} moved to billing.`,
        type: 'success'
      });
      loadOrders();
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
      <div className="panel-header"><div><h2>Orders</h2><p className="muted">All active and paid orders.</p></div><button className="btn-secondary sm" onClick={loadOrders}>Refresh</button></div>
      {status && <p className="status-msg error">{status}</p>}
      <div className="tables-grid">
        {orders.map((order) => <SimpleOrderCard key={order.id} order={order} actions={(row) => row.status !== 'paid' && <button className="btn-secondary compact" onClick={() => markBilling(row)}>Billing</button>} />)}
      </div>
    </section>
  );
}
