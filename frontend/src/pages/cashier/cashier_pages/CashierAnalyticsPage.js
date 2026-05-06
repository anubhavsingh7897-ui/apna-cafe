import { useCallback, useEffect, useState } from 'react';
import BillingAnalyticsDashboard from '../../../components/BillingAnalyticsDashboard';

export default function CashierAnalyticsPage({ apiRequest }) {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setStats(await apiRequest('/payments/stats'));
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Cashier Dashboard</h2>
          <p className="muted">Bills, customers, collections, and comparison trends.</p>
        </div>
        <button className="btn-secondary sm" type="button" onClick={loadStats}>
          Refresh
        </button>
      </div>
      {status && <p className="status-msg error">{status}</p>}
      <BillingAnalyticsDashboard analytics={stats} />
    </section>
  );
}
