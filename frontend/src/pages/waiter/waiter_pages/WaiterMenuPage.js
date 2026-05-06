import MenuItemsPanel from '../../../components/MenuItemsPanel';

export default function WaiterMenuPage({ items, loadItems }) {
  return <MenuItemsPanel items={items} onRefresh={loadItems} />;
}
