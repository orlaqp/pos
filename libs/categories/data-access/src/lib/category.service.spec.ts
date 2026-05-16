jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    save: jest.fn(),
    query: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((input: Record<string, unknown>) => ({
    ...input,
    tenantId: 'tenant-123',
  })),
}));

jest.mock('@pos/shared/utils', () => ({
  AssetsService: {
    deleteAsset: jest.fn(),
  },
}));

jest.mock('@pos/shared/models', () => ({
  Category: jest.fn().mockImplementation((input: Record<string, unknown>) => input),
}));

import { DataStore } from '@pos/shared/amplify';

import { CategoryService } from './category.service';

describe('CategoryService.save', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the saved category id for new categories before dispatching add', async () => {
    (DataStore.save as jest.Mock).mockResolvedValue({
      id: 'category-1',
    });

    const category = {
      name: 'Carnes',
      description: 'Meat',
    } as any;

    await CategoryService.save(dispatch, category);

    expect(DataStore.save).toHaveBeenCalled();
    expect(category.id).toBe('category-1');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'categories/add',
        payload: expect.objectContaining({
          id: 'category-1',
          name: 'Carnes',
        }),
      })
    );
  });
});
