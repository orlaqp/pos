/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('@pos/auth/data-access', () => ({
  Role: { Admin: 'Admin' },
}));

const { menuItems } = require('./menu-items');

describe('menuItems', () => {
  it('includes required back-office sections', () => {
    const titles = menuItems.map((x) => x.title);
    expect(titles).toEqual(
      expect.arrayContaining(['Dashboard', 'Customers', 'Reports', 'Catalog', 'Inventory', 'Settings'])
    );
  });

  it('places customers in management for admins', () => {
    const customers = menuItems.find((x) => x.title === 'Customers');

    expect(customers).toEqual(
      expect.objectContaining({
        role: 'Admin',
        group: 'Management',
      })
    );
  });

  it('defines nested inventory and settings routes', () => {
    const inventory = menuItems.find((x) => x.title === 'Inventory');
    const settings = menuItems.find((x) => x.title === 'Settings');

    expect(inventory?.children?.map((x) => x.title)).toEqual(['In Stock', 'Counts', 'Receives']);
    expect(settings?.children?.map((x) => x.title)).toEqual([
      'General',
      'Store',
      'Station',
      'Printers',
      'Logs',
    ]);
  });
});
