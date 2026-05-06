export default function KitchenInventoryPage({ ingredients, loadIngredients, apiRequest }) {
  async function updateStock(ingredient, stock_quantity) {
    await apiRequest(`/ingredients/${ingredient.id}`, {
      method: 'PUT',
      body: JSON.stringify({ stock_quantity: Number(stock_quantity) })
    });
    loadIngredients();
  }

  return (
    <section className="panel">
      <div className="panel-header"><div><h2>Inventory</h2><p className="muted">Kitchen stock levels.</p></div><button className="btn-secondary sm" onClick={loadIngredients}>Refresh</button></div>
      <div className="tables-grid">
        {ingredients.map((ingredient) => (
          <article className="table-card" key={ingredient.id}>
            <div className="table-card-head"><div><h3>{ingredient.name}</h3><p>{ingredient.unit}</p></div><span className="table-status status-free">{Number(ingredient.stock_quantity)}</span></div>
            <div className="input-group"><label>Stock</label><input type="number" step="0.001" defaultValue={ingredient.stock_quantity} onBlur={(e) => updateStock(ingredient, e.target.value)} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
