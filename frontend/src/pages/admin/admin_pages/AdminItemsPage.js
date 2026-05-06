import CreateItemForm from '../../../components/CreateItemForm';
import MenuItemsPanel from '../../../components/MenuItemsPanel';

export default function AdminItemsPage({
  items,
  loadItems,
  apiRequest,
  onToggleAvailability,
  onUpdateItem,
  onDeleteItem
}) {
  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <CreateItemForm onCreated={loadItems} apiRequest={apiRequest} />
      </aside>
      <div className="tab-main">
        <MenuItemsPanel
          items={items}
          onRefresh={loadItems}
          onToggleAvailability={onToggleAvailability}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
        />
      </div>
    </div>
  );
}
