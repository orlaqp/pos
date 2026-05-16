module.exports = {
  getUniqueId: jest.fn(() => 'test-device-id'),
  getVersion: jest.fn(() => '0.0.0-test'),
  getBuildNumber: jest.fn(() => '1'),
};
