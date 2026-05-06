import { useRef, useState } from 'react';
import config from '../config/config';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  image_url: '',
  is_available: true,
  manual_override: false
};

export default function CreateItemForm({ onCreated, apiRequest }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const currentFileRef = useRef(null);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadStatus('Only image files are supported.');
      return;
    }

    currentFileRef.current = file;
    setPreview(URL.createObjectURL(file));
    setUploadProgress(0);
    setUploadStatus('Image selected. Click Upload to Cloudinary.');
  }

  async function uploadImage() {
    const file = currentFileRef.current;

    if (!file) {
      setUploadStatus('Choose, drop, or paste an image first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading to Cloudinary...');
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.cloudinary.uploadPreset);

    try {
      const response = await fetch(
        config.cloudinary.imageUploadUrl(config.cloudinary.cloudName),
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Cloudinary upload failed.');
      }

      setUploadProgress(100);
      setField('image_url', data.secure_url);
      setUploadStatus('Uploaded successfully. Image URL added below.');
    } catch (error) {
      setUploadProgress(0);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  function clearUpload() {
    currentFileRef.current = null;
    setPreview('');
    setUploadProgress(0);
    setUploadStatus('');
    setField('image_url', '');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        selectFile(item.getAsFile());
        break;
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('Creating item...');

    try {
      await apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: Number(form.price)
        })
      });

      setForm(emptyForm);
      setPreview('');
      currentFileRef.current = null;
      setUploadProgress(0);
      setUploadStatus('');
      setStatus('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <div>
          <h2>Create Menu Item</h2>
          <p className="muted">Add a new dish with photo and price.</p>
        </div>
      </div>

      <form className="form-body" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="input-group">
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Masala Dosa"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="item-category">Category</label>
            <input
              id="item-category"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
              placeholder="Breakfast"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="item-price">Price</label>
            <input
              id="item-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setField('price', event.target.value)}
              placeholder="80"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="item-url">Image URL</label>
            <input
              id="item-url"
              value={form.image_url}
              onChange={(event) => setField('image_url', event.target.value)}
              placeholder="Cloudinary URL"
            />
          </div>
        </div>

        <div className="toggles-row">
          <label className="toggle-label">
            <div
              className={`toggle-switch ${form.is_available ? 'on' : ''}`}
              onClick={() => setField('is_available', !form.is_available)}
            >
              <span className="toggle-knob" />
            </div>
            Available
          </label>

          <label className="toggle-label">
            <div
              className={`toggle-switch ${form.manual_override ? 'on' : ''}`}
              onClick={() => setField('manual_override', !form.manual_override)}
            >
              <span className="toggle-knob" />
            </div>
            Manual Override
          </label>
        </div>

        <div
          className={`upload-zone ${preview ? 'has-preview' : ''}`}
          onClick={() => !preview && fileInputRef.current?.click()}
          onPaste={handlePaste}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files[0]);
          }}
          tabIndex="0"
          role="button"
          aria-label="Upload image"
        >
          {preview ? (
            <div className="preview-wrapper">
              <img src={preview} alt="Selected item preview" />
              <button
                className="preview-remove"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  clearUpload();
                }}
              >
                x
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon-ring">+</div>
              <h3>Paste, drag, or click to add image</h3>
              <p>Supports JPG, PNG, and WebP.</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={(event) => selectFile(event.target.files[0])}
        />

        {uploadProgress > 0 && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={uploadImage}
            disabled={isUploading || !preview}
          >
            {isUploading ? 'Uploading...' : 'Upload to Cloudinary'}
          </button>

          {preview && (
            <button type="button" className="btn-ghost" onClick={clearUpload}>
              Clear
            </button>
          )}
        </div>

        {uploadStatus && (
          <p className={`status-msg ${uploadStatus.startsWith('Uploaded') ? 'success' : ''}`}>
            {uploadStatus}
          </p>
        )}

        <button className="btn-primary full" type="submit">
          {success ? 'Item Created' : 'Create Item'}
        </button>

        {status && <p className="status-msg error">{status}</p>}
      </form>
    </div>
  );
}
