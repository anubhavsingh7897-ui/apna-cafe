export default function SimpleOrderCard({ order, actions }) {
  const tableNumber = order.table?.table_number || order.table_id;
  const items = order.items || [];

  return (
    <article className="table-card-premium">
      <div className="table-card-head">
        <div>
          <h3>Order #{order.id}</h3>
          <p>Table {tableNumber} · {order.status}</p>
        </div>
        <span className="table-status status-billing">Rs. {Number(order.total_amount).toFixed(2)}</span>
      </div>

      <div className="order-items-list">
        {items.map((row) => (
          <div className="order-line" key={row.id}>
            <span>{row.item?.name || `Item ${row.item_id}`}</span>
            <strong>{row.quantity} x Rs. {Number(row.price).toFixed(2)}</strong>
            <small>{row.status}</small>
          </div>
        ))}
      </div>

      {actions && <div className="table-actions">{actions(order)}</div>}
    </article>
  );
}
