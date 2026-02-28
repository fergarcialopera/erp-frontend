export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  clinics: {
    list: "/clinics",
    get: (id: string) => `/clinics/${id}`,
  },
  users: {
    list: "/users",
    get: (id: string) => `/users/${id}`,
    create: "/users",
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  products: {
    list: "/products",
    get: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  lockers: {
    list: "/lockers",
    get: (id: string) => `/lockers/${id}`,
    create: "/lockers",
    update: (id: string) => `/lockers/${id}`,
    compartments: (lockerId: string) => `/lockers/${lockerId}/compartments`,
  },
  inventory: {
    list: "/inventory",
    get: (id: string) => `/inventory/${id}`,
    update: (id: string) => `/inventory/${id}`,
  },
  openOrders: {
    list: "/open-orders",
    get: (id: string) => `/open-orders/${id}`,
    create: "/open-orders",
    cancel: (id: string) => `/open-orders/${id}/cancel`,
    retire: (id: string) => `/open-orders/${id}/retire`,
  },
  auditLogs: {
    list: "/audit-logs",
  },
} as const;
