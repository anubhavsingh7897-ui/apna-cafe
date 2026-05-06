import { useState } from 'react';
import config from '../config/config';

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const emptyForm = { name: '', phone: '', email: '', role: 'waiter' };
const roles = ['waiter', 'cashier', 'kitchen', 'admin'];

export default function CreateUserForm({ onCreated, apiRequest, showToast = () => {} }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function sendEmail(user, password) {
    if (!window.emailjs) {
      throw new Error('EmailJS is not loaded.');
    }

    window.emailjs.init(config.emailjs.publicKey);
    const message = [
      `Hello ${user.name},`,
      'Your Apna Cafe staff account has been created.',
      `Name: ${user.name}`,
      `Role: ${user.role}`,
      `Phone/Login: ${user.phone}`,
      `Email/Login: ${user.email}`,
      `Password: ${password}`,
      `Login URL: ${window.location.origin}`
    ].join('\n');

    return window.emailjs.send(config.emailjs.serviceId, config.emailjs.templateId, {
      name: user.name,
      user_name: user.name,
      to_name: user.name,
      from_name: 'APNA CAFE',
      time: new Date().toLocaleString(),
      message,
      email: user.email,
      to_email: user.email,
      user_email: user.email,
      recipient_email: user.email,
      reply_to: user.email
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);
    setStatus('Creating staff user...');

    const password = generatePassword();

    try {
      const created = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({ ...form, password, is_active: true })
      });

      setStatus('Sending credentials email...');
      await sendEmail(created, password);
      showToast({
        title: 'Credentials email sent',
        message: `Login details were delivered to ${created.email}.`,
        type: 'success'
      });
      setForm(emptyForm);
      setStatus('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      if (onCreated) onCreated();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <div>
          <h2>Create Staff User</h2>
          <p className="muted">A password will be auto-generated and emailed.</p>
        </div>
      </div>

      <form className="form-body" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-group">
            <label htmlFor="user-name">Full Name</label>
            <input
              id="user-name"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Ravi Kumar"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="user-phone">Phone</label>
            <input
              id="user-phone"
              value={form.phone}
              onChange={(event) => setField('phone', event.target.value)}
              placeholder="9876543210"
              required
            />
          </div>

          <div className="input-group full-col">
            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="staff@example.com"
              required
            />
          </div>
        </div>

        <div className="role-picker">
          <p className="role-label">Role</p>
          <div className="role-options">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                className={`role-chip ${form.role === role ? 'active' : ''}`}
                onClick={() => setField('role', role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <p className={`status-msg ${status.includes('Sending') ? 'info' : 'error'}`}>
            {status}
          </p>
        )}

        <button className="btn-primary full" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner sm" /> {status}
            </>
          ) : success ? (
            'User Created and Email Sent'
          ) : (
            'Create User and Email Password'
          )}
        </button>
      </form>
    </div>
  );
}
