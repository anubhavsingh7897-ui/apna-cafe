import TablesPanel from '../../../components/TablesPanel';

export default function WaiterTablesPage({ tables, loadTables, onUpdateTable }) {
  return (
    <TablesPanel
      tables={tables}
      onRefresh={loadTables}
      onUpdateTable={onUpdateTable}
    />
  );
}
