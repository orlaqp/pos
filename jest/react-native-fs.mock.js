module.exports = {
  DocumentDirectoryPath: '/tmp',
  CachesDirectoryPath: '/tmp',
  downloadFile: jest.fn(() => ({ promise: Promise.resolve({ statusCode: 200 }) })),
  exists: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
};
