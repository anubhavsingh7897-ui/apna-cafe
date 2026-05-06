import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChefHat,
  ChevronRight,
  Coffee,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ReceiptText,
  ScrollText,
  Sun,
  UtensilsCrossed,
  Users,
  Settings,
  X
} from 'lucide-react';

const ROLE_LINKS = {
  admin: [
    { to: '/admin/overview', label: 'Overview', Icon: LayoutDashboard },
    { to: '/admin/items', label: 'Menu Items', Icon: UtensilsCrossed },
    { to: '/admin/tables', label: 'Tables', Icon: Grid3X3 },
    { to: '/admin/staff', label: 'Staff', Icon: Users },
    { to: '/admin/inventory', label: 'Inventory', Icon: Package },
    { to: '/admin/reports', label: 'Reports', Icon: ScrollText },
    { to: '/admin/settings', label: 'Settings', Icon: Settings }
  ],
  waiter: [
    { to: '/waiter/dashboard', label: 'Waiter Page', Icon: UtensilsCrossed }
  ],
  cashier: [
    { to: '/cashier/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/cashier/table-billing', label: 'Table Wise Billing', Icon: Grid3X3 },
    { to: '/cashier/manual-billing', label: 'Manual Billing', Icon: ReceiptText },
    { to: '/cashier/orders', label: 'Orders', Icon: ReceiptText }
  ],
  kitchen: [
    { to: '/kitchen/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/kitchen/orders', label: 'Kitchen Orders', Icon: ChefHat },
    { to: '/kitchen/inventory', label: 'Inventory', Icon: Package }
  ]
};

const ROLE_META = {
  admin: { className: 'role-admin', label: 'Admin' },
  waiter: { className: 'role-waiter', label: 'Waiter' },
  cashier: { className: 'role-cashier', label: 'Cashier' },
  kitchen: { className: 'role-kitchen', label: 'Kitchen' }
};

export default function Header({ user, onLogout, theme = 'light', onToggleTheme = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const role = ROLE_META[user.role] || {
    className: 'role-default',
    label: user.role
  };
  const links = ROLE_LINKS[user.role] || [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`tb ${scrolled ? 'scrolled' : ''}`}>
        <NavLink className="tb-brand" to="/">
          <div className="tb-icon-wrap">
            <Coffee size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="tb-eyebrow">Apna Cafe</p>
            <h1 className="tb-title">{role.label} Workspace</h1>
          </div>
        </NavLink>

        <nav className="tb-nav">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `tb-tab ${isActive ? 'active' : ''}`}
              to={to}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="tb-user">
          <button className="tb-theme-toggle" type="button" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div className="tb-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="tb-user-info">
            <span className="tb-user-name">{user.name}</span>
            <span className={`tb-role-pill ${role.className}`}>
              {role.label}
            </span>
          </div>
          <button className="tb-logout" type="button" onClick={onLogout} title="Logout">
            <LogOut size={15} strokeWidth={2.5} />
            <span>Logout</span>
          </button>
        </div>

        <button
          className="tb-hamburger"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div
        className={`tb-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`tb-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="tb-icon-wrap drawer-brand-icon">
              <Coffee size={14} strokeWidth={2.5} />
            </div>
            <span>Apna Cafe</span>
          </div>
          <button className="drawer-close" type="button" onClick={() => setMenuOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="drawer-user-card">
          <div className="drawer-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="drawer-user-name">{user.name}</div>
            <span className={`tb-role-pill ${role.className}`}>
              {role.label}
            </span>
          </div>
        </div>

        <nav className="drawer-nav">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `drawer-tab ${isActive ? 'active' : ''}`}
              to={to}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
              <ChevronRight size={14} className="drawer-tab-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="drawer-footer">
          <button className="drawer-logout" type="button" onClick={onLogout}>
            <LogOut size={15} strokeWidth={2.5} />
            Sign out
          </button>
          <button className="drawer-logout theme" type="button" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>
  );
}
