import { parseArgs } from './cli';

describe('parseArgs', () => {
  it('parses years as a positive number', () => {
    expect(
      parseArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--tenant-id',
        'tenant-1',
        '--years',
        '1.5',
      ])
    ).toEqual(
      expect.objectContaining({
        years: 1.5,
      })
    );
  });

  it('rejects invalid years values', () => {
    expect(() =>
      parseArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--tenant-id',
        'tenant-1',
        '--years',
        '0',
      ])
    ).toThrow('--years must be a positive number');
  });

  it('accepts target-only discount models in --models', () => {
    expect(
      parseArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--tenant-id',
        'tenant-1',
        '--models',
        'DiscountDefinition,EmployeeDiscountPolicy',
      ])
    ).toEqual(
      expect.objectContaining({
        models: ['DiscountDefinition', 'EmployeeDiscountPolicy'],
      })
    );
  });

  it('parses days as a positive number', () => {
    expect(
      parseArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--tenant-id',
        'tenant-1',
        '--days',
        '1',
      ])
    ).toEqual(
      expect.objectContaining({
        days: 1,
      })
    );
  });

  it('rejects using years and days together', () => {
    expect(() =>
      parseArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--tenant-id',
        'tenant-1',
        '--years',
        '1',
        '--days',
        '1',
      ])
    ).toThrow('Use either --years or --days, not both');
  });
});
