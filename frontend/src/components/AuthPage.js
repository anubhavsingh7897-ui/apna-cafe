import { useState } from 'react';

export default function AuthPage({ onAuth, apiRequest }) {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '', role: 'waiter' });
  const [authStatus, setAuthStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setAuthForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthStatus('');
    setLoading(true);
    const payload = authMode === 'login'
      ? { phone: authForm.phone, password: authForm.password }
      : authForm;
    try {
      const data = await apiRequest(`/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      onAuth(data);
    } catch (err) {
      setAuthStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setAuthMode(m => (m === 'login' ? 'signup' : 'login'));
    setAuthStatus('');
  }

  const isLogin = authMode === 'login';

  return (
    <div className="auth-bg">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">☕</span>
          <span className="auth-logo-text">Apna Cafe</span>
        </div>
        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Join the team'}</h1>
        <p className="auth-sub">{isLogin ? 'Sign in to manage your café.' : 'Create a new staff account.'}</p>

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
          {!isLogin && (
            <>
              <div className="input-group">
                <label htmlFor="auth-name">Full Name</label>
                <input id="auth-name" value={authForm.name} onChange={e => setField('name', e.target.value)} placeholder="Ravi Kumar" required />
              </div>
              <div className="input-group">
                <label htmlFor="auth-role">Role</label>
                <select id="auth-role" value={authForm.role} onChange={e => setField('role', e.target.value)}>
                  <option value="waiter">Waiter</option>
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          <div className="input-group">
            <label htmlFor="auth-phone">{isLogin ? 'Phone or Email' : 'Phone'}</label>
            <input id="auth-phone" value={authForm.phone} onChange={e => setField('phone', e.target.value)} placeholder={isLogin ? '9876543210 or staff@cafe.com' : '9876543210'} required />
          </div>
          <div className="input-group">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" value={authForm.password} onChange={e => setField('password', e.target.value)} placeholder="Enter password" required />
          </div>

          {authStatus && <p className="status-msg error">{authStatus}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <button className="btn-link" onClick={toggleMode}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
