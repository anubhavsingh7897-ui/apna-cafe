import CreateTableForm from '../../../components/CreateTableForm';
import TablesPanel from '../../../components/TablesPanel';

export default function AdminTablesPage({ tables, loadTables, apiRequest, onUpdateTable }) {
  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <CreateTableForm onCreated={loadTables} apiRequest={apiRequest} />
      </aside>
      <div className="tab-main">
        <TablesPanel
          tables={tables}
          onRefresh={loadTables}
          onUpdateTable={onUpdateTable}
        />
      </div>
    </div>
  );
}
