const ROLE_COLORS = {
  admin: 'pill-admin',
  waiter: 'pill-waiter',
  cashier: 'pill-cashier',
  kitchen: 'pill-kitchen',
};

const ROLE_ICONS = {
  admin: '🛡️',
  waiter: '🍽️',
  cashier: '💰',
  kitchen: '👨‍🍳',
};

export default function UserCard({ user }) {
  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="user-card">
      <div className={`user-avatar-lg ${ROLE_COLORS[user.role] || ''}`}>
        {initials}
      </div>
      <div className="user-card-info">
        <h3 className="user-card-name">{user.name}</h3>
        <p className="user-card-contact">
          <span>📞 {user.phone}</span>
          {user.email && <span>✉️ {user.email}</span>}
        </p>
      </div>
      <span className={`pill ${ROLE_COLORS[user.role] || ''}`}>
        {ROLE_ICONS[user.role]} {user.role}
      </span>
    </article>
  );
}
