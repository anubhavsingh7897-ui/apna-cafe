import CreateUserForm from '../../../components/CreateUserForm';
import StaffPanel from '../../../components/StaffPanel';

export default function AdminStaffPage({ users, loadUsers, apiRequest, showToast }) {
  return (
    <div className="tab-layout">
      <aside className="tab-sidebar">
        <CreateUserForm onCreated={loadUsers} apiRequest={apiRequest} showToast={showToast} />
      </aside>
      <div className="tab-main">
        <StaffPanel users={users} onRefresh={loadUsers} />
      </div>
    </div>
  );
}
