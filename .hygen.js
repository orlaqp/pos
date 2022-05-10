const cc = require('change-case');
const i = require('inflection');

const folderName = (text) => cc.paramCase(i.pluralize(text));
const lib = (text) => `libsss/${folderName(text)}/native`;

module.exports = {
    helpers: {
        folderName,
        lib,
        components: (text) => `${lib(text)}/src/lib/components`,
        plural: (text) => i.pluralize(text),
        featureLib: (text) => `${lib(text)}/src/lib`,
        lower: (text) => text.toLowerCase(),
        pluralCapitalized: (text) => cc.capitalCase(i.pluralize(text)),
        singularCapitalized: (text) => cc.capitalCase(text)
    }
}