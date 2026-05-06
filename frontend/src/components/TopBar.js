import { useState } from 'react';

const ROLE_COLORS = {
  admin: 'pill-admin',
  waiter: 'pill-waiter',
  cashier: 'pill-cashier',
  kitchen: 'pill-kitchen',
};

export default function TopBar({ user, onLogout, activeTab, onTabChange, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">☕</span>
        <div>
          <p className="topbar-eyebrow">Apna Cafe</p>
          <h1 className="topbar-title">Menu Administration</h1>
        </div>
      </div>

      {isAdmin && (
        <nav className="topbar-nav">
          {['overview', 'items', 'tables', 'staff', 'settings'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab === 'items' && '🍽️ '}
              {tab === 'tables' && '▦ '}
              {tab === 'staff' && '👥 '}
              {tab === 'overview' && '📊 '}
              {tab === 'settings' && '⚙️ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      )}

      <div className="topbar-user">
        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className={`pill ${ROLE_COLORS[user.role] || ''}`}>{user.role}</span>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
      </button>

      {menuOpen && (
        <div className="mobile-drawer">
          <div className="drawer-user">
            <div className="user-avatar lg">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span className={`pill ${ROLE_COLORS[user.role] || ''}`}>{user.role}</span>
            </div>
          </div>
          {isAdmin && (
            <nav className="drawer-nav">
              {['overview', 'items', 'tables', 'staff', 'settings'].map(tab => (
                <button
                  key={tab}
                  className={`drawer-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { onTabChange(tab); setMenuOpen(false); }}
                >
                  {tab === 'items' && '🍽️ '}
                  {tab === 'tables' && '▦ '}
                  {tab === 'staff' && '👥 '}
                  {tab === 'overview' && '📊 '}
                  {tab === 'settings' && '⚙️ '}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          )}
          <button className="btn-logout-drawer" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </header>
  );
}
