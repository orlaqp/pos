const createResolved = (value) => jest.fn(() => Promise.resolve(value));

const store = new Map();

module.exports = {
  setItem: jest.fn((key, value) => {
    store.set(key, value);
    return Promise.resolve(null);
  }),
  getItem: jest.fn((key) => Promise.resolve(store.has(key) ? store.get(key) : null)),
  removeItem: jest.fn((key) => {
    store.delete(key);
    return Promise.resolve(null);
  }),
  clear: jest.fn(() => {
    store.clear();
    return Promise.resolve(null);
  }),
  getAllKeys: jest.fn(() => Promise.resolve([...store.keys()])),
  multiGet: jest.fn((keys) => Promise.resolve(keys.map((key) => [key, store.has(key) ? store.get(key) : null]))),
  multiSet: jest.fn((entries) => {
    entries.forEach(([key, value]) => store.set(key, value));
    return Promise.resolve(null);
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach((key) => store.delete(key));
    return Promise.resolve(null);
  }),
  mergeItem: createResolved(null),
  multiMerge: createResolved(null),
  flushGetRequests: jest.fn(),
};
