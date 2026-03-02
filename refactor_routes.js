import fs from 'fs';
import path from 'path';

const routesDir = 'd:/Projectos/lock-frontend/src/app/routes';

const mappings = [
    { file: 'Products.tsx', hookName: 'useProducts', feature: 'products', sample: 'sampleProducts' },
    { file: 'Inventory.tsx', hookName: 'useInventory', feature: 'inventory', sample: 'sampleInventory' },
    { file: 'Lockers.tsx', hookName: 'useLockers', feature: 'lockers', sample: 'sampleLockers' },
    { file: 'OpenOrders.tsx', hookName: 'useOpenOrders', feature: 'openOrders', sample: 'sampleOrders' },
    { file: 'Users.tsx', hookName: 'useUsers', feature: 'users', sample: 'sampleUsers' },
];

mappings.forEach(({ file, hookName, feature, sample }) => {
    const filePath = path.join(routesDir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Insert import
    if (!content.includes(hookName)) {
        content = content.replace(
            /import { useState } from "react";|import React.*?("react"|'react');/,
            `$& \nimport { ${hookName} } from "@/features/${feature}/queries";`
        );
    }

    // Remove the static sample data block
    content = content.replace(new RegExp(`const ${sample}.*?;`, 's'), '');
    content = content.replace(/\/\/ Sample data.*?API/g, '');

    content = content.replace(new RegExp(`export default function .*?Page.*?{`), `$&
  const { data: records, isLoading } = ${hookName}();`);

    content = content.replace(new RegExp(`${sample}`, 'g'), `records || []`);

    // add isLoading
    if (!content.includes('isLoading={isLoading}')) {
        content = content.replace(
            /<DataTable\s+data=\{records \|\| \[\]\}/g,
            `<DataTable data={records || []} isLoading={isLoading}`
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
});
