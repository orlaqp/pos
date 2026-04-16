import * as path from 'path';

import { parseImageFindArgs } from './image-find-cli';

describe('parseImageFindArgs', () => {
  it('parses required arguments and default roots', () => {
    const options = parseImageFindArgs(['--env', 'prod']);

    expect(options.env).toBe('prod');
    expect(options.models).toEqual(['products', 'categories']);
    expect(options.includeNonUpdated).toBe(false);
    expect(options.roots?.length).toBe(2);
  });

  it('parses optional filters', () => {
    expect(
      parseImageFindArgs([
        '--env',
        'develop',
        '--tenant-id',
        'tenant-1',
        '--models',
        'products',
        '--roots',
        './tmp,/tmp/manifests',
        '--limit',
        '3',
        '--include-non-updated',
        'true',
      ])
    ).toEqual({
      env: 'develop',
      tenantId: 'tenant-1',
      models: ['products'],
      roots: [path.resolve('./tmp'), path.resolve('/tmp/manifests')],
      limit: 3,
      includeNonUpdated: true,
    });
  });

  it('requires env', () => {
    expect(() => parseImageFindArgs([])).toThrow('Missing required argument: --env');
  });
});
