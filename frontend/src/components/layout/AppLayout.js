import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({ auth, onLogout, theme, onToggleTheme }) {
  return (
    <div className="app-shell">
      <Header user={auth.user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <main className="content-area">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
