if (typeof global.performance !== 'undefined') {
  try {
    Object.defineProperty(global, 'performance', {
      value: global.performance,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  } catch (e) {
    // ignore; jest/react-native setup will use existing object
  }
}
