import { useEffect, useState } from 'react';
import OverviewPanel from '../../../components/OverviewPanel';
import BillingAnalyticsDashboard from '../../../components/BillingAnalyticsDashboard';

export default function AdminOverviewPage({ items, users, tables, apiRequest }) {
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setAnalytics(await apiRequest('/reports/billing-analytics'));
      } catch (error) {
        setStatus(error.message);
      }
    }

    loadAnalytics();
  }, [apiRequest]);

  return (
    <div className="admin-stack">
      <OverviewPanel items={items} users={users} tables={tables} />
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Billing Dashboard</h2>
            <p className="muted">Bills, customers, collection frequency, and comparison trends.</p>
          </div>
        </div>
        {status && <p className="status-msg error">{status}</p>}
        <BillingAnalyticsDashboard analytics={analytics} />
      </section>
    </div>
  );
}
