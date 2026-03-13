module.exports = {
  InterfaceType: { Lan: 'Lan' },
  StarConnectionSettings: jest.fn(),
  StarDeviceDiscoveryManager: jest.fn(),
  StarDeviceDiscoveryManagerFactory: { create: jest.fn() },
  StarPrinter: jest.fn(),
  StarXpandCommand: {
    PrinterBuilder: jest.fn(),
    MagnificationParameter: jest.fn(),
    DocumentBuilder: jest.fn(),
    StarXpandCommandBuilder: jest.fn(),
    Printer: {
      Alignment: { Center: 'Center', Left: 'Left', Right: 'Right' },
      InternationalCharacterType: { Usa: 'Usa' },
      QRCodeModel: { Model2: 'Model2' },
      QRCodeLevel: { L: 'L' },
      QRCodeParameter: jest.fn(),
    },
  },
};
