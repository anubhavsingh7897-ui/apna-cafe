import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

import AppLayout from './components/layout/AppLayout';
import ToastCenter from './components/ToastCenter';
import config from './config/config';
import { requestApi } from './services/api';
import AuthRoutes from './routes/authRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRedirect from './routes/RoleRedirect';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

import AdminOverviewPage from './pages/admin/admin_pages/AdminOverviewPage';
import AdminItemsPage from './pages/admin/admin_pages/AdminItemsPage';
import AdminStaffPage from './pages/admin/admin_pages/AdminStaffPage';
import AdminTablesPage from './pages/admin/admin_pages/AdminTablesPage';
import AdminInventoryPage from './pages/admin/admin_pages/AdminInventoryPage';
import AdminReportsPage from './pages/admin/admin_pages/AdminReportsPage';
import AdminSettingsPage from './pages/admin/admin_pages/AdminSettingsPage';

import WaiterDashboard from './pages/waiter/waiter_pages/WaiterDashboard';

import CashierDashboard from './pages/cashier/cashier_pages/CashierDashboard';
import CashierAnalyticsPage from './pages/cashier/cashier_pages/CashierAnalyticsPage';
import CashierManualBillingPage from './pages/cashier/cashier_pages/CashierManualBillingPage';
import CashierOrdersPage from './pages/cashier/cashier_pages/CashierOrdersPage';

import KitchenDashboard from './pages/kitchen/kitchen_pages/KitchenDashboard';
import KitchenOrdersPage from './pages/kitchen/kitchen_pages/KitchenOrdersPage';
import KitchenInventoryPage from './pages/kitchen/kitchen_pages/KitchenInventoryPage';

const tableRoles = ['admin', 'waiter', 'cashier'];
const ingredientRoles = ['admin', 'kitchen'];

export default function App() {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(config.app.authStorageKey));
    } catch {
      return null;
    }
  });
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('apnaCafeTheme') || 'light');

  const isAdmin = auth?.user?.role === 'admin';
  const canLoadTables = auth && tableRoles.includes(auth.user.role);
  const canLoadIngredients = auth && ingredientRoles.includes(auth.user.role);

  useEffect(() => {
    if (auth) {
      sessionStorage.setItem(config.app.authStorageKey, JSON.stringify(auth));
    } else {
      sessionStorage.removeItem(config.app.authStorageKey);
    }
  }, [auth]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('apnaCafeTheme', theme);
  }, [theme]);

  const apiHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {})
  }), [auth]);

  const apiRequest = useCallback(async (path, options = {}) => {
    return requestApi(path, options, apiHeaders);
  }, [apiHeaders]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, message = '', type = 'info', timeout = 4200 }) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((current) => [
      ...current.filter((toast) => !toast.confirm),
      { id, title, message, type }
    ]);

    if (timeout) {
      window.setTimeout(() => removeToast(id), timeout);
    }

    return id;
  }, [removeToast]);

  const confirmToast = useCallback(({ title, message, onConfirm }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [
      ...current,
      { id, title, message, type: 'warning', confirm: true, onConfirm }
    ]);
  }, []);

  const handleToastConfirm = useCallback(async (id) => {
    const toast = toasts.find((current) => current.id === id);
    removeToast(id);

    if (!toast?.onConfirm) return;

    try {
      await toast.onConfirm();
    } catch (error) {
      showToast({
        title: 'Action failed',
        message: error.message,
        type: 'error'
      });
    }
  }, [removeToast, showToast, toasts]);

  const handleToastCancel = useCallback((id) => {
    removeToast(id);
    showToast({ title: 'Action cancelled', type: 'info', timeout: 2200 });
  }, [removeToast, showToast]);

  const loadItems = useCallback(async () => {
    if (!auth) return;

    try {
      setItems(await apiRequest('/items'));
    } catch (error) {
      console.error('loadItems:', error.message);
    }
  }, [auth, apiRequest]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setUsers(await apiRequest('/users'));
    } catch (error) {
      console.error('loadUsers:', error.message);
    }
  }, [isAdmin, apiRequest]);

  const loadTables = useCallback(async () => {
    if (!canLoadTables) return;

    try {
      setTables(await apiRequest('/tables'));
    } catch (error) {
      console.error('loadTables:', error.message);
    }
  }, [canLoadTables, apiRequest]);

  const loadIngredients = useCallback(async () => {
    if (!canLoadIngredients) return;

    try {
      setIngredients(await apiRequest('/ingredients'));
    } catch (error) {
      console.error('loadIngredients:', error.message);
    }
  }, [canLoadIngredients, apiRequest]);

  useEffect(() => {
    if (!auth) return;

    loadItems();
    loadUsers();
    loadTables();
    loadIngredients();
  }, [auth, loadItems, loadUsers, loadTables, loadIngredients]);

  async function handleToggleAvailability(item) {
    const next = !item.is_available;
    setItems((previous) =>
      previous.map((current) =>
        current.id === item.id ? { ...current, is_available: next } : current
      )
    );

    try {
      const updated = await apiRequest(`/items/${item.id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ manual_override: true, is_available: next })
      });
      showToast({
        title: 'Availability updated',
        message: updated?.message || `${item.name} is now ${next ? 'available' : 'unavailable'}.`,
        type: 'success'
      });
    } catch (error) {
      setItems((previous) =>
        previous.map((current) =>
          current.id === item.id ? { ...current, is_available: item.is_available } : current
        )
      );
      showToast({
        title: 'Availability update failed',
        message: error.message,
        type: 'error'
      });
    }
  }

  async function handleUpdateItem(itemId, updates) {
    const updatedItem = await apiRequest(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        price: Number(updates.price)
      })
    });

    setItems((previous) =>
      previous.map((item) => (item.id === itemId ? updatedItem : item))
    );
    showToast({
      title: 'Item saved',
      message: updatedItem?.message || 'Menu item updated successfully.',
      type: 'success'
    });
  }

  async function handleDeleteItem(item) {
    confirmToast({
      title: 'Delete menu item?',
      message: `"${item.name}" will be removed from the menu.`,
      onConfirm: async () => {
        const result = await apiRequest(`/items/${item.id}`, { method: 'DELETE' });
        setItems((previous) => previous.filter((current) => current.id !== item.id));
        showToast({
          title: 'Item deleted',
          message: result?.message || `${item.name} deleted successfully.`,
          type: 'success'
        });
      }
    });
  }

  async function handleUpdateTable(tableId, updates) {
    const updatedTable = await apiRequest(`/tables/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        capacity: Number(updates.capacity)
      })
    });

    setTables((previous) =>
      previous.map((table) => (table.id === tableId ? updatedTable : table))
    );
    showToast({
      title: 'Table updated',
      message: updatedTable?.message || 'Table updated successfully.',
      type: 'success'
    });
  }

  function logout() {
    setAuth(null);
    setItems([]);
    setUsers([]);
    setTables([]);
    setIngredients([]);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<AuthRoutes auth={auth} onAuth={setAuth} apiRequest={apiRequest} />}
        />

        <Route element={<ProtectedRoute auth={auth} />}>
          <Route path="/" element={<RoleRedirect auth={auth} />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            element={(
              <AppLayout
                auth={auth}
                onLogout={logout}
                theme={theme}
                onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              />
            )}
          >
            <Route element={<ProtectedRoute auth={auth} allowedRoles={['admin']} />}>
              <Route
                path="/admin/overview"
                element={<AdminOverviewPage items={items} users={users} tables={tables} apiRequest={apiRequest} />}
              />
              <Route
                path="/admin/items"
                element={(
                  <AdminItemsPage
                    items={items}
                    loadItems={loadItems}
                    apiRequest={apiRequest}
                    onToggleAvailability={handleToggleAvailability}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                  />
                )}
              />
              <Route
                path="/admin/tables"
                element={(
                  <AdminTablesPage
                    tables={tables}
                    loadTables={loadTables}
                    apiRequest={apiRequest}
                    onUpdateTable={handleUpdateTable}
                  />
                )}
              />
              <Route
                path="/admin/staff"
                element={<AdminStaffPage users={users} loadUsers={loadUsers} apiRequest={apiRequest} showToast={showToast} />}
              />
              <Route
                path="/admin/inventory"
                element={(
                  <AdminInventoryPage
                    ingredients={ingredients}
                    items={items}
                    loadIngredients={loadIngredients}
                    apiRequest={apiRequest}
                    showToast={showToast}
                  />
                )}
              />
              <Route
                path="/admin/reports"
                element={<AdminReportsPage apiRequest={apiRequest} />}
              />
              <Route
                path="/admin/settings"
                element={<AdminSettingsPage apiRequest={apiRequest} showToast={showToast} confirmToast={confirmToast} />}
              />
            </Route>

            <Route element={<ProtectedRoute auth={auth} allowedRoles={['waiter']} />}>
              <Route path="/waiter/dashboard" element={<WaiterDashboard tables={tables} items={items} apiRequest={apiRequest} loadTables={loadTables} showToast={showToast} />} />
              <Route path="/waiter/tables" element={<Navigate to="/waiter/dashboard" replace />} />
              <Route path="/waiter/menu" element={<Navigate to="/waiter/dashboard" replace />} />
              <Route path="/waiter/orders" element={<Navigate to="/waiter/dashboard" replace />} />
            </Route>

            <Route element={<ProtectedRoute auth={auth} allowedRoles={['cashier']} />}>
              <Route path="/cashier/dashboard" element={<CashierAnalyticsPage apiRequest={apiRequest} />} />
              <Route path="/cashier/table-billing" element={<CashierDashboard tables={tables} apiRequest={apiRequest} loadTables={loadTables} showToast={showToast} confirmToast={confirmToast} />} />
              <Route path="/cashier/manual-billing" element={<CashierManualBillingPage items={items} apiRequest={apiRequest} loadTables={loadTables} showToast={showToast} confirmToast={confirmToast} />} />
              <Route path="/cashier/orders" element={<CashierOrdersPage apiRequest={apiRequest} showToast={showToast} />} />
              <Route path="/cashier/payments" element={<Navigate to="/cashier/dashboard" replace />} />
            </Route>

            <Route element={<ProtectedRoute auth={auth} allowedRoles={['kitchen']} />}>
              <Route path="/kitchen/dashboard" element={<KitchenDashboard items={items} />} />
              <Route path="/kitchen/orders" element={<KitchenOrdersPage apiRequest={apiRequest} showToast={showToast} />} />
              <Route path="/kitchen/inventory" element={<KitchenInventoryPage ingredients={ingredients} loadIngredients={loadIngredients} apiRequest={apiRequest} />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={auth ? <RoleRedirect auth={auth} /> : <AuthRoutes auth={auth} onAuth={setAuth} apiRequest={apiRequest} />} />
      </Routes>
      <ToastCenter
        toasts={toasts}
        onClose={removeToast}
        onConfirm={handleToastConfirm}
        onCancel={handleToastCancel}
      />
    </BrowserRouter>
  );
}
