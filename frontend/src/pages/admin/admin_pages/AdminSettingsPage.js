import { useState, useEffect, useCallback } from 'react';

export default function AdminSettingsPage({ apiRequest, showToast = () => {}, confirmToast = () => {} }) {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const loadConfig = useCallback(async () => {
    try {
      const config = await apiRequest('/config');
      if (config.upi_id) setUpiId(config.upi_id);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const result = await apiRequest('/config', {
        method: 'POST',
        body: JSON.stringify({ key: 'upi_id', value: upiId })
      });
      setStatus('UPI ID updated successfully!');
      showToast({
        title: 'Settings saved',
        message: result?.message || 'UPI ID updated successfully.',
        type: 'success'
      });
    } catch (err) {
      setStatus(err.message);
      showToast({
        title: 'Settings update failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    confirmToast({
      title: 'Remove UPI ID?',
      message: 'Payment QR generation will stop until a new UPI ID is saved.',
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await apiRequest('/config', {
            method: 'POST',
            body: JSON.stringify({ key: 'upi_id', value: '' })
          });
          setUpiId('');
          setStatus('UPI ID removed.');
          showToast({
            title: 'UPI ID removed',
            message: result?.message || 'UPI ID removed successfully.',
            type: 'success'
          });
        } catch (err) {
          setStatus(err.message);
          showToast({
            title: 'Remove failed',
            message: err.message,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  }

  return (
    <div className="admin-stack fadeIn">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>⚙️ System Settings</h2>
            <p className="muted">Manage global cafe configurations.</p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <h3>UPI Configuration</h3>
            <p className="muted sm">Enter the UPI ID for generating payment QR codes.</p>
            
            <form onSubmit={handleSave} className="form-body mt-4">
              <div className="input-group">
                <label>UPI ID (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. merchant@upi or 9876543210@ybl"
                  required
                />
              </div>

              {status && (
                <p className={`status-msg ${status.includes('fail') ? 'error' : 'success'}`}>
                  {status}
                </p>
              )}

              <div className="btn-group">
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner sm" /> : 'Save UPI ID'}
                </button>
                {upiId && (
                  <button className="btn-danger" type="button" onClick={handleRemove} disabled={loading}>
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
