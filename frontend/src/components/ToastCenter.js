export default function ToastCenter({ toasts = [], onClose, onConfirm, onCancel }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((toast) => (
        <article className={`toast toast-${toast.type || 'info'}`} key={toast.id}>
          <div className="toast-body">
            <strong>{toast.title}</strong>
            {toast.message && <p>{toast.message}</p>}
          </div>

          {toast.confirm ? (
            <div className="toast-actions">
              <button className="btn-secondary compact" type="button" onClick={() => onCancel(toast.id)}>
                Cancel
              </button>
              <button className="btn-danger compact" type="button" onClick={() => onConfirm(toast.id)}>
                Confirm
              </button>
            </div>
          ) : (
            <button className="toast-close" type="button" onClick={() => onClose(toast.id)} aria-label="Dismiss">
              x
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
