import { useEffect, useState } from 'react';

export default function AdminReportsPage({ apiRequest }) {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const [dailyData, monthlyData, topItemsData] = await Promise.all([
          apiRequest('/reports/daily'),
          apiRequest('/reports/monthly'),
          apiRequest('/reports/top-items')
        ]);
        setDaily(dailyData);
        setMonthly(monthlyData);
        setTopItems(topItemsData);
      } catch (error) {
        setStatus(error.message);
      }
    }
    loadReports();
  }, [apiRequest]);

  return (
    <section className="panel">
      <div className="panel-header"><div><h2>Reports</h2><p className="muted">Admin sales and item performance.</p></div></div>
      {status && <p className="status-msg error">{status}</p>}
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">D</span><div><p className="stat-value">Rs. {Number(daily?.total_sales || 0).toFixed(2)}</p><p className="stat-label">Daily Sales</p></div></div>
        <div className="stat-card"><span className="stat-icon">M</span><div><p className="stat-value">Rs. {Number(monthly?.total_sales || 0).toFixed(2)}</p><p className="stat-label">Monthly Sales</p></div></div>
      </div>
      <div className="users-list">
        {topItems.map((row) => (
          <article className="user-card" key={row.item_id}>
            <div><h3>{row.item?.name || `Item ${row.item_id}`}</h3><p className="muted">{row.item?.category}</p></div>
            <span className="pill">Qty {Number(row.get ? row.get('quantity_sold') : row.quantity_sold || 0)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
