export default function KitchenDashboard({ items }) {
  const unavailableItems = items.filter((item) => !item.is_available).length;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Kitchen Dashboard</h2>
          <p className="muted">Preparation queue and menu availability workspace.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">I</span><div><p className="stat-value">{items.length}</p><p className="stat-label">Menu Items</p></div></div>
        <div className="stat-card"><span className="stat-icon">U</span><div><p className="stat-value">{unavailableItems}</p><p className="stat-label">Unavailable</p></div></div>
      </div>
    </section>
  );
}
