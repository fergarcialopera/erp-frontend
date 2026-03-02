import fs from 'fs';
import path from 'path';

const src = 'd:/Projectos/lock-frontend/src';

const map = {
    Products: 'Product',
    Inventory: 'CompartmentInventory',
    Lockers: 'Locker',
    OpenOrders: 'OpenOrder',
    Users: 'User'
};

Object.keys(map).forEach(feature => {
    const fLower = feature.charAt(0).toLowerCase() + feature.slice(1);
    const type = map[feature];
    const snakeCase = fLower.replace(/([A-Z])/g, '_$1').toUpperCase();

    const fPath = path.join(src, 'features', fLower);
    if (!fs.existsSync(fPath)) fs.mkdirSync(fPath, { recursive: true });

    const apiFile = path.join(fPath, 'api.ts');
    fs.writeFileSync(apiFile, `import { apiClient } from '@/lib/apiClient';
import { ENDPOINTS } from '@/config/endpoints';
import { ${type} } from '@/types/models';

export const fetch${feature} = async (): Promise<${type}[]> => {
  const res = await apiClient.get(ENDPOINTS.${snakeCase}.LIST);
  return res.data;
};
`);

    const queriesFile = path.join(fPath, 'queries.ts');
    fs.writeFileSync(queriesFile, `import { useQuery } from '@tanstack/react-query';
import { fetch${feature} } from './api';

export const use${feature} = () => {
  return useQuery({
    queryKey: ['${fLower}'],
    queryFn: fetch${feature},
  });
};
`);
});
