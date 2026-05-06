import config from '../config/config';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout'
  },
  items: {
    list: '/items',
    create: '/items',
    detail: (id) => `/items/${id}`,
    availability: (id) => `/items/${id}/availability`,
    ingredients: (id) => `/items/${id}/ingredients`
  },
  users: {
    list: '/users',
    create: '/users',
    detail: (id) => `/users/${id}`
  },
  tables: {
    list: '/tables',
    create: '/tables',
    detail: (id) => `/tables/${id}`
  },
  ingredients: {
    list: '/ingredients',
    create: '/ingredients',
    detail: (id) => `/ingredients/${id}`
  },
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id) => `/orders/${id}`,
    table: (id) => `/orders/table/${id}`,
    status: (id) => `/orders/${id}/status`
  },
  orderItems: {
    status: (id) => `/order-items/${id}/status`
  },
  payments: {
    create: '/payments',
    stats: '/payments/stats',
    byOrder: (orderId) => `/payments/${orderId}`
  },
  reports: {
    daily: '/reports/daily',
    monthly: '/reports/monthly',
    topItems: '/reports/top-items',
    billingAnalytics: '/reports/billing-analytics'
  },
  kitchen: {
    orders: '/kitchen/orders'
  },
  config: {
    get: '/config',
    update: '/config'
  }
};

export function buildApiUrl(path) {
  return `${config.api.baseUrl}${path}`;
}

export async function requestApi(path, options = {}, headers = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  const text = response.status === 204 ? '' : await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}.`);
  }

  return data;
}
