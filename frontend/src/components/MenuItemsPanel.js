import { useState } from 'react';
import MenuItemCard from './MenuItemCard';

export default function MenuItemsPanel({
  items,
  onRefresh,
  onToggleAvailability,
  onUpdateItem,
  onDeleteItem
}) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All');

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || item.category === filterCat;
    const matchAvail =
      filterAvail === 'All' ||
      (filterAvail === 'Available' && item.is_available) ||
      (filterAvail === 'Unavailable' && !item.is_available);
    return matchSearch && matchCat && matchAvail;
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>🍽️ Menu Items</h2>
          <p className="muted">{filtered.length} of {items.length} items</p>
        </div>
        <button className="btn-secondary sm" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search items…"
        />
        <div className="filter-chips">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filter-chips">
          {['All', 'Available', 'Unavailable'].map(a => (
            <button
              key={a}
              className={`filter-chip ${filterAvail === a ? 'active' : ''}`}
              onClick={() => setFilterAvail(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔍</p>
          <p>No items match your filters.</p>
        </div>
      ) : (
        <div className="items-grid">
          {filtered.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggleAvailability={onToggleAvailability}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}
