const cc = require('change-case');
const i = require('inflection');

const folderName = (text) => cc.paramCase(i.pluralize(text));
const lib = (text) => `libs/${folderName(text)}/native-feature`;
const daLib = (text) => `libs/${folderName(text)}/data-access`;

module.exports = {
    helpers: {
        folderName,
        lib,
        daLib,
        components: (text) => `${lib(text)}/src/lib/components`,
        plural: (text) => i.pluralize(text),
        featureLib: (text) => `${lib(text)}/src/lib`,
        dataAccessLib: (text) => `${daLib(text)}/src/lib`,
        lower: (text) => text.toLowerCase(),
        pluralCapitalized: (text) => cc.capitalCase(i.pluralize(text)),
        singularCapitalized: (text) => cc.capitalCase(text)
    }
}