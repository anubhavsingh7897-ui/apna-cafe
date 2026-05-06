export default function OverviewPanel({ items, users, tables = [] }) {
  const totalItems = items.length;
  const availableItems = items.filter((item) => item.is_available).length;
  const unavailableItems = totalItems - availableItems;
  const totalStaff = users.length;
  const totalTables = tables.length;
  const freeTables = tables.filter((table) => table.status === 'free').length;
  const occupiedTables = tables.filter((table) => table.status === 'occupied').length;
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const avgPrice = totalItems > 0
    ? (items.reduce((sum, item) => sum + Number(item.price), 0) / totalItems).toFixed(2)
    : '0.00';
  const maxPrice = totalItems > 0
    ? Math.max(...items.map((item) => Number(item.price))).toFixed(2)
    : '0.00';

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const catBreakdown = categories.map((cat) => ({
    cat,
    count: items.filter((item) => item.category === cat).length
  })).sort((a, b) => b.count - a.count);

  const stats = [
    { label: 'Total Items', value: totalItems, icon: '🍽️', color: 'stat-blue' },
    { label: 'Available', value: availableItems, icon: '✅', color: 'stat-green' },
    { label: 'Unavailable', value: unavailableItems, icon: '❌', color: 'stat-red' },
    { label: 'Staff Members', value: totalStaff, icon: '👥', color: 'stat-purple' },
    { label: 'Total Tables', value: totalTables, icon: '🪑', color: 'stat-teal' },
    { label: 'Free Tables', value: freeTables, icon: '✨', color: 'stat-cyan' },
    { label: 'Occupied', value: occupiedTables, icon: '🏷️', color: 'stat-orange' },
    { label: 'Categories', value: categories.length, icon: '📁', color: 'stat-indigo' },
    { label: 'Avg Price', value: `₹${avgPrice}`, icon: '💰', color: 'stat-yellow' }
  ];

  return (
    <section className="panel overview-panel">
      <div className="panel-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="muted">Real-time insights into your cafe's operations.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-content">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-row">
        <div className="overview-sub-card">
          <div className="card-sub-header">
            <h3>Menu Distribution</h3>
            <span className="badge">{categories.length} Categories</span>
          </div>
          {catBreakdown.length === 0 ? (
            <div className="empty-mini">
              <p className="muted">No categories yet.</p>
            </div>
          ) : (
            <div className="cat-list">
              {catBreakdown.map(({ cat, count }) => (
                <div key={cat} className="cat-row">
                  <span className="cat-name">{cat}</span>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${Math.round((count / totalItems) * 100)}%` }}
                    />
                  </div>
                  <span className="cat-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overview-sub-card">
          <div className="card-sub-header">
            <h3>Staff Composition</h3>
            <span className="badge">{totalStaff} Total</span>
          </div>
          {Object.keys(roleCounts).length === 0 ? (
            <div className="empty-mini">
              <p className="muted">No staff yet.</p>
            </div>
          ) : (
            <div className="cat-list">
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="cat-row">
                  <span className={`pill pill-${role} sm`}>{role}</span>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill accent"
                      style={{ width: `${Math.round((count / totalStaff) * 100)}%` }}
                    />
                  </div>
                  <span className="cat-count">{count}</span>
                </div>
              ))}
            </div>
          )}
          <div className="overview-max-price">
            <span className="label">Highest Priced Item</span>
            <strong className="value">₹{maxPrice}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
