import AsyncStorage from '@react-native-async-storage/async-storage';
import { StationService } from './station.service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('StationService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reserves the next order number from the current station config without async storage', () => {
    const result = StationService.reserveNextOrderNumber(
      {
        stationNumber: '51',
        currentDate: '260330',
        orderNumber: 41,
      },
      {
        code: 'EMP',
      } as any
    );

    expect(result).toEqual({
      orderNo: '51-EMP-260330-0042',
      config: {
        stationNumber: '51',
        currentDate: '260330',
        orderNumber: 42,
      },
    });
  });

  it('persists the incremented station config when generating the next order number', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify({
        stationNumber: '51',
        currentDate: '260330',
        orderNumber: 41,
      })
    );

    const orderNo = await StationService.getNextOrderNumber({
      code: 'EMP',
    } as any);

    expect(orderNo).toBe('51-EMP-260330-0042');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'stationConfig',
      JSON.stringify({
        stationNumber: '51',
        currentDate: '260330',
        orderNumber: 42,
      })
    );
  });
});
