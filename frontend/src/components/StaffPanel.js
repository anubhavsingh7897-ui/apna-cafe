import UserCard from './UserCard';

export default function StaffPanel({ users, onRefresh }) {
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>👥 Staff Members</h2>
          <p className="muted">{users.length} total staff</p>
        </div>
        <button className="btn-secondary sm" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div className="role-summary-bar">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className={`role-summary-chip pill-${role}`}>
            <span className="role-count">{count}</span>
            <span className="role-name">{role}</span>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">👤</p>
          <p>No staff users yet.</p>
        </div>
      ) : (
        <div className="users-list">
          {users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
}
