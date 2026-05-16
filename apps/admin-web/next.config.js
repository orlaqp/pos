const path = require('path');

const transpilePackages = [
    '@pos/admin/data-access',
    '@pos/admin/web-feature',
    '@pos/auth/web-feature',
    '@pos/brands/web-feature',
    '@pos/categories/web-feature',
    '@pos/inventory/web-feature',
    '@pos/products/web-feature',
    '@pos/reporting/web-feature',
    '@pos/sales/web-feature',
    '@pos/shared/ui-web',
    '@pos/unit-of-measures/web-feature',
];

module.exports = {
    output: 'standalone',
    transpilePackages,
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@pos/admin/data-access': path.resolve(__dirname, '../../libs/admin/data-access/src/index.ts'),
            '@pos/admin/web-feature': path.resolve(__dirname, '../../libs/admin/web-feature/src/index.ts'),
            '@pos/auth/web-feature': path.resolve(__dirname, '../../libs/auth/web-feature/src/index.ts'),
            '@pos/brands/web-feature': path.resolve(__dirname, '../../libs/brands/web-feature/src/index.ts'),
            '@pos/categories/web-feature': path.resolve(__dirname, '../../libs/categories/web-feature/src/index.ts'),
            '@pos/inventory/web-feature': path.resolve(__dirname, '../../libs/inventory/web-feature/src/index.ts'),
            '@pos/products/web-feature': path.resolve(__dirname, '../../libs/products/web-feature/src/index.ts'),
            '@pos/reporting/web-feature': path.resolve(__dirname, '../../libs/reporting/web-feature/src/index.ts'),
            '@pos/sales/web-feature': path.resolve(__dirname, '../../libs/sales/web-feature/src/index.ts'),
            '@pos/shared/ui-web': path.resolve(__dirname, '../../libs/shared/ui-web/src/index.ts'),
            '@pos/unit-of-measures/web-feature': path.resolve(__dirname, '../../libs/unit-of-measures/web-feature/src/index.ts'),
        };
        return config;
    },
};
