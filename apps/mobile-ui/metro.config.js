const { withNxMetro } = require('@nx/react-native');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
    cacheVersion: 'mobile-ui',
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
        assetExts: assetExts.filter((ext) => ext !== 'svg'),
        sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
        resolverMainFields: ['react-native', 'browser', 'main'],
        platforms: ['ios', 'android', 'native'],
    },
};

module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
    debug: false,
    extensions: [],
    watchFolders: [],
});
