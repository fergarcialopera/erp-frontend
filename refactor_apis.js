import fs from 'fs';
import path from 'path';

const src = 'd:/Projectos/lock-frontend/src';

const features = {
    auth: {
        apiOptions: `
export const login = async (data: Record<string, string>) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  return res.data;
};
export const logout = async () => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
};
`
    },
    clinics: {
        type: 'Clinic',
        apiOptions: `
export const getMyClinic = async (): Promise<Clinic> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.ME);
  return res.data;
};
`
    },
    users: {
        type: 'User',
        apiOptions: `
export const fetchUsers = async (): Promise<User[]> => {
  const res = await apiClient.get(ENDPOINTS.USERS.LIST);
  return res.data;
};
export const createUser = async (data: Partial<User>) => {
  const res = await apiClient.post(ENDPOINTS.USERS.CREATE, data);
  return res.data;
};
export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await apiClient.patch(ENDPOINTS.USERS.DETAIL(id), data);
  return res.data;
};
`
    },
    lockers: {
        type: 'Locker',
        apiOptions: `
export const fetchLockers = async (): Promise<Locker[]> => {
  const res = await apiClient.get(ENDPOINTS.LOCKERS.LIST);
  return res.data;
};
export const createLocker = async (data: Partial<Locker>) => {
  const res = await apiClient.post(ENDPOINTS.LOCKERS.CREATE, data);
  return res.data;
};
export const updateLocker = async (id: string, data: Partial<Locker>) => {
  const res = await apiClient.patch(ENDPOINTS.LOCKERS.DETAIL(id), data);
  return res.data;
};
`
    },
    compartments: {
        type: 'Compartment',
        apiOptions: `
export const fetchCompartmentsByLocker = async (lockerId: string): Promise<Compartment[]> => {
  const res = await apiClient.get(ENDPOINTS.COMPARTMENTS.LIST_BY_LOCKER(lockerId));
  return res.data;
};
export const updateCompartment = async (id: string, data: Partial<Compartment>) => {
  const res = await apiClient.patch(ENDPOINTS.COMPARTMENTS.DETAIL(id), data);
  return res.data;
};
`
    },
    products: {
        type: 'Product',
        apiOptions: `
export const fetchProducts = async (): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.LIST);
  return res.data;
};
export const createProduct = async (data: Partial<Product>) => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
  return res.data;
};
export const updateProduct = async (id: string, data: Partial<Product>) => {
  const res = await apiClient.patch(ENDPOINTS.PRODUCTS.DETAIL(id), data);
  return res.data;
};
`
    },
    inventory: {
        type: 'CompartmentInventory',
        apiOptions: `
export const fetchInventory = async (filters?: Record<string, string>): Promise<CompartmentInventory[]> => {
  const res = await apiClient.get(ENDPOINTS.INVENTORY.LIST, { params: filters });
  return res.data;
};
`
    },
    openOrders: {
        type: 'OpenOrder',
        apiOptions: `
export const fetchOpenOrders = async (filters?: Record<string, string>): Promise<OpenOrder[]> => {
  const res = await apiClient.get(ENDPOINTS.OPEN_ORDERS.LIST, { params: filters });
  return res.data;
};
export const createOpenOrder = async (data: { locker_id: string, compartment_id: string, product_id: string, quantity: number, meta?: any }) => {
  const res = await apiClient.post(ENDPOINTS.OPEN_ORDERS.CREATE, data);
  return res.data;
};
export const cancelOpenOrder = async (id: string) => {
  const res = await apiClient.patch(ENDPOINTS.OPEN_ORDERS.CANCEL(id));
  return res.data;
};
export const retireOpenOrder = async (id: string) => {
  const res = await apiClient.patch(ENDPOINTS.OPEN_ORDERS.RETIRE(id));
  return res.data;
};
`
    },
    auditLogs: {
        type: 'AuditLog',
        apiOptions: `
export const fetchAuditLogs = async (filters?: Record<string, string>): Promise<AuditLog[]> => {
  const res = await apiClient.get(ENDPOINTS.AUDIT_LOGS.LIST, { params: filters });
  return res.data;
};
`
    }
};

Object.keys(features).forEach(f => {
    const fPath = path.join(src, 'features', f);
    if (!fs.existsSync(fPath)) fs.mkdirSync(fPath, { recursive: true });

    const type = features[f].type;
    const apiOptions = features[f].apiOptions;

    const typeImport = type ? `import { ${type} } from '@/types/models';` : '';

    const apiFile = path.join(fPath, 'api.ts');
    fs.writeFileSync(apiFile, `import { apiClient } from '@/lib/apiClient';\nimport { ENDPOINTS } from '@/config/endpoints';\n${typeImport}\n${apiOptions}`);
});
