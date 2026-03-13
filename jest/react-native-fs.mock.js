module.exports = {
  DocumentDirectoryPath: '/tmp',
  CachesDirectoryPath: '/tmp',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
};
