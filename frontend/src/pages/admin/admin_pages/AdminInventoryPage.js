import { useState } from 'react';

const emptyIngredient = { name: '', unit: '', stock_quantity: '', min_stock_level: '' };

export default function AdminInventoryPage({
  ingredients,
  items,
  loadIngredients,
  apiRequest,
  showToast = () => {}
}) {
  const [form, setForm] = useState(emptyIngredient);
  const [recipeItemId, setRecipeItemId] = useState('');
  const [recipeRows, setRecipeRows] = useState([]);
  const [status, setStatus] = useState('');
  const [recipeStatus, setRecipeStatus] = useState('');
  const [savingRecipe, setSavingRecipe] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function normalizeRecipeRows(rows = []) {
    return rows.map((row) => ({
      ingredient_id: String(row.ingredient_id),
      quantity_required: String(row.quantity_required)
    }));
  }

  function isSuccessMessage(message) {
    const text = message.toLowerCase();
    return text.includes('saved') || text.includes('updated successfully');
  }

  async function createIngredient(event) {
    event.preventDefault();
    setStatus('Saving ingredient...');

    try {
      await apiRequest('/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          stock_quantity: Number(form.stock_quantity),
          min_stock_level: Number(form.min_stock_level)
        })
      });
      setForm(emptyIngredient);
      setStatus('Ingredient created.');
      loadIngredients();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function updateStock(ingredient, stock_quantity) {
    try {
      await apiRequest(`/ingredients/${ingredient.id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock_quantity: Number(stock_quantity) })
      });
      loadIngredients();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function loadRecipe(itemId) {
    setRecipeItemId(itemId);
    setRecipeStatus('');
    if (!itemId) {
      setRecipeRows([]);
      return;
    }

    try {
      const rows = await apiRequest(`/items/${itemId}/ingredients`);
      setRecipeRows(normalizeRecipeRows(rows));
    } catch (error) {
      setRecipeRows([]);
      setRecipeStatus(error.message);
    }
  }

  async function saveRecipe() {
    if (!recipeItemId) {
      setRecipeStatus('Select a menu item before saving a recipe.');
      return;
    }

    const ingredientsPayload = recipeRows
      .filter((row) => row.ingredient_id && Number(row.quantity_required) > 0)
      .map((row) => ({
        ingredient_id: Number(row.ingredient_id),
        quantity_required: Number(row.quantity_required)
      }));

    if (recipeRows.length > 0 && ingredientsPayload.length !== recipeRows.length) {
      setRecipeStatus('Select an ingredient and quantity greater than zero for every recipe row.');
      return;
    }

    const uniqueIngredientIds = new Set(ingredientsPayload.map((row) => row.ingredient_id));
    if (uniqueIngredientIds.size !== ingredientsPayload.length) {
      setRecipeStatus('Remove duplicate ingredients before saving this recipe.');
      return;
    }

    setSavingRecipe(true);
    setRecipeStatus('Saving recipe...');
    try {
      const result = await apiRequest(`/items/${recipeItemId}/ingredients`, {
        method: 'PUT',
        body: JSON.stringify({ ingredients: ingredientsPayload })
      });
      setRecipeStatus(result?.message || 'Recipe saved.');
      setRecipeRows(normalizeRecipeRows(result?.ingredients || []));
      showToast({
        title: 'Recipe saved',
        message: result?.message || 'Recipe updated successfully.',
        type: 'success'
      });
    } catch (error) {
      setRecipeStatus(error.message);
      showToast({
        title: 'Recipe save failed',
        message: error.message,
        type: 'error'
      });
    } finally {
      setSavingRecipe(false);
    }
  }

  function updateRecipeRow(index, updates) {
    setRecipeRows((rows) =>
      rows.map((row, currentIndex) => currentIndex === index ? { ...row, ...updates } : row)
    );
    setRecipeStatus('');
  }

  function addRecipeRow() {
    if (!recipeItemId) {
      setRecipeStatus('Select a menu item before adding ingredients.');
      return;
    }

    setRecipeRows((rows) => [...rows, { ingredient_id: '', quantity_required: '' }]);
    setRecipeStatus('');
  }

  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <div className="card form-card">
          <div className="card-header">
            <div>
              <h2>Create Ingredient</h2>
              <p className="muted">Manage stock used by menu recipes.</p>
            </div>
          </div>
          <form className="form-body" onSubmit={createIngredient}>
            <div className="input-group"><label>Name</label><input value={form.name} onChange={(e) => setField('name', e.target.value)} required /></div>
            <div className="input-group"><label>Unit</label><input value={form.unit} onChange={(e) => setField('unit', e.target.value)} placeholder="kg, litre, pcs" required /></div>
            <div className="input-group"><label>Stock Quantity</label><input type="number" step="0.001" value={form.stock_quantity} onChange={(e) => setField('stock_quantity', e.target.value)} required /></div>
            <div className="input-group"><label>Minimum Stock</label><input type="number" step="0.001" value={form.min_stock_level} onChange={(e) => setField('min_stock_level', e.target.value)} required /></div>
            <button className="btn-primary full" type="submit">Create Ingredient</button>
          </form>
        </div>
      </aside>

      <div className="tab-main admin-stack">
        <section className="panel">
          <div className="panel-header"><div><h2>Inventory</h2><p className="muted">{ingredients.length} ingredients</p></div><button className="btn-secondary sm" onClick={loadIngredients}>Refresh</button></div>
          {status && <p className="status-msg">{status}</p>}
          <div className="tables-grid">
            {ingredients.map((ingredient) => (
              <article className="table-card" key={ingredient.id}>
                <div className="table-card-head"><div><h3>{ingredient.name}</h3><p>{ingredient.unit}</p></div><span className="table-status status-free">{Number(ingredient.stock_quantity)}</span></div>
                <div className="input-group">
                  <label>Update Stock</label>
                  <input type="number" step="0.001" defaultValue={ingredient.stock_quantity} onBlur={(e) => updateStock(ingredient, e.target.value)} />
                </div>
                <p className="muted">Min: {Number(ingredient.min_stock_level)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Item Recipes</h2>
              <p className="muted">Map ingredients required for an item.</p>
            </div>
            <button
              className="btn-primary compact"
              type="button"
              onClick={saveRecipe}
              disabled={savingRecipe || !recipeItemId}
            >
              {savingRecipe ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>

          <div className="recipe-editor">
            <div className="input-group">
              <label>Menu Item</label>
              <select value={recipeItemId} onChange={(e) => loadRecipe(e.target.value)}>
                <option value="">Select item</option>
                {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>

            {recipeStatus && (
              <p className={`status-msg ${isSuccessMessage(recipeStatus) ? 'success' : 'error'}`}>
                {recipeStatus}
              </p>
            )}

            <div className="recipe-rows">
              {recipeRows.length === 0 ? (
                <div className="empty-mini">
                  <p className="muted">{recipeItemId ? 'No ingredients added for this recipe.' : 'Select a menu item to edit its recipe.'}</p>
                </div>
              ) : recipeRows.map((row, index) => (
                <div className="recipe-row" key={`${row.ingredient_id || 'new'}-${index}`}>
                  <div className="input-group">
                    <label>Ingredient</label>
                    <select
                      value={row.ingredient_id}
                      onChange={(e) => updateRecipeRow(index, { ingredient_id: e.target.value })}
                    >
                      <option value="">Ingredient</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Qty required</label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={row.quantity_required}
                      onChange={(e) => updateRecipeRow(index, { quantity_required: e.target.value })}
                      placeholder="Qty required"
                    />
                  </div>
                  <button
                    className="btn-danger compact"
                    type="button"
                    onClick={() => {
                      setRecipeRows((rows) => rows.filter((_, i) => i !== index));
                      setRecipeStatus('');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="recipe-actions">
              <button className="btn-secondary" type="button" onClick={addRecipeRow}>
                Add Ingredient
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={saveRecipe}
                disabled={savingRecipe || !recipeItemId}
              >
                {savingRecipe ? 'Saving Recipe...' : 'Save Recipe'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
