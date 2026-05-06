import { useState } from 'react';

function editableItem(item) {
  return {
    name: item.name || '',
    category: item.category || '',
    price: item.price || '',
    image_url: item.image_url || '',
    is_available: Boolean(item.is_available),
    manual_override: Boolean(item.manual_override)
  };
}

export default function MenuItemCard({
  item,
  onToggleAvailability,
  onUpdateItem,
  onDeleteItem
}) {
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => editableItem(item));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit() {
    setEditForm(editableItem(item));
    setStatus('');
    setIsEditing(true);
  }

  async function saveEdit(event) {
    event.preventDefault();

    if (!onUpdateItem) {
      return;
    }

    setSaving(true);
    setStatus('Saving...');

    try {
      await onUpdateItem(item.id, editForm);
      setStatus('');
      setIsEditing(false);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    if (!onDeleteItem) {
      return;
    }

    setStatus('');

    try {
      await onDeleteItem(item);
    } catch (error) {
      setStatus(error.message);
    }
  }

  if (isEditing) {
    return (
      <article className="item-card item-card-editing">
        <form className="item-edit-form" onSubmit={saveEdit}>
          <div className="input-group">
            <label htmlFor={`edit-name-${item.id}`}>Name</label>
            <input
              id={`edit-name-${item.id}`}
              value={editForm.name}
              onChange={(event) => setField('name', event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor={`edit-category-${item.id}`}>Category</label>
            <input
              id={`edit-category-${item.id}`}
              value={editForm.category}
              onChange={(event) => setField('category', event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor={`edit-price-${item.id}`}>Price</label>
            <input
              id={`edit-price-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={editForm.price}
              onChange={(event) => setField('price', event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor={`edit-image-${item.id}`}>Image URL</label>
            <input
              id={`edit-image-${item.id}`}
              value={editForm.image_url}
              onChange={(event) => setField('image_url', event.target.value)}
              placeholder="Cloudinary URL"
            />
          </div>

          <div className="edit-toggle-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editForm.is_available}
                onChange={(event) => setField('is_available', event.target.checked)}
              />
              Available
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editForm.manual_override}
                onChange={(event) => setField('manual_override', event.target.checked)}
              />
              Manual override
            </label>
          </div>

          <div className="item-action-row">
            <button className="btn-primary compact" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn-ghost compact"
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          {status && <p className="status-msg error">{status}</p>}
        </form>
      </article>
    );
  }

  return (
    <article className="item-card">
      <div className="item-card-image">
        {item.image_url && !imgError ? (
          <img src={item.image_url} alt={item.name} onError={() => setImgError(true)} />
        ) : (
          <div className="item-image-placeholder">Item</div>
        )}
        <span className={`item-badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
          {item.is_available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="item-card-body">
        <div className="item-card-info">
          <h3 className="item-card-name">{item.name}</h3>
          <p className="item-card-category">{item.category}</p>
        </div>

        <div className="item-card-footer">
          <strong className="item-price">Rs. {Number(item.price).toFixed(2)}</strong>
          {onToggleAvailability && (
            <button
              className={`btn-toggle-avail ${item.is_available ? 'avail-on' : 'avail-off'}`}
              onClick={() => onToggleAvailability(item)}
              title={item.is_available ? 'Mark Unavailable' : 'Mark Available'}
              type="button"
            >
              {item.is_available ? 'On' : 'Off'}
            </button>
          )}
        </div>

        {(onUpdateItem || onDeleteItem) && (
          <div className="item-action-row">
            {onUpdateItem && (
              <button className="btn-secondary compact" type="button" onClick={startEdit}>
                Edit
              </button>
            )}
            {onDeleteItem && (
              <button
                className="btn-danger compact"
                type="button"
                onClick={deleteItem}
                disabled={saving}
              >
                Delete
              </button>
            )}
          </div>
        )}

        {status && <p className="status-msg error">{status}</p>}
      </div>
    </article>
  );
}
