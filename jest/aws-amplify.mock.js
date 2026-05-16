const DataStore = {
  query: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  observe: jest.fn(() => ({ subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) })),
  clear: jest.fn(),
  start: jest.fn(),
};

const Auth = {
  signIn: jest.fn(),
  signOut: jest.fn(),
  currentAuthenticatedUser: jest.fn(),
};

const Storage = {
  get: jest.fn(),
  put: jest.fn(),
  remove: jest.fn(),
};

const API = {
  graphql: jest.fn(),
};

const Hub = {
  listen: jest.fn(() => jest.fn()),
  dispatch: jest.fn(),
};

const Amplify = {
  configure: jest.fn(),
};

const syncExpression = jest.fn();

module.exports = {
  DataStore,
  Auth,
  Storage,
  API,
  Hub,
  Amplify,
  syncExpression,
};
