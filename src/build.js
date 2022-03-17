require('dotenv-flow').config();

const path = require('path');
const fs = require('fs');
const UglifyJS = require('uglify-js');

// modify unmodifable items that cannot be hooked in rammerhead.js
fs.writeFileSync(
    path.join(__dirname, './client/hammerhead.min.js'),
    fs
        .readFileSync(path.join(__dirname, '../node_modules/testcafe-hammerhead/lib/client/hammerhead.js'), 'utf8')
        .replace(
            'function parseProxyUrl$1',
            'window.overrideParseProxyUrl = function(func) {parseProxyUrl$$1 = func}; $&'
        )
        .replace('function getProxyUrl$1', 'window.overrideGetProxyUrl = function(func) {getProxyUrl$$1 = func}; $&')
        .replace('return window.location.search;', 'return (new URL(get$$2())).search;')
        .replace('return window.location.hash;', 'return (new URL(get$$2())).hash;')
        .replace('setter: function (search) {', '$& var url = new URL(get$$2()); url.search = search; window.location = convertToProxyUrl(url.href); return search;')
        .replace('setter: function (hash) {', '$& var url = new URL(get$$2()); url.hash = hash; window.location.hash = (new URL(convertToProxyUrl(url.href))).hash; return hash;')
);

fs.writeFileSync(path.join(__dirname, './client/rammerhead.min.js'), fs.readFileSync(path.join(__dirname, './client/rammerhead.js')));

const minify = fileName => {
    const filePath = path.join(__dirname, './client', fileName);
    const minified = UglifyJS.minify(fs.readFileSync(filePath, 'utf8'));
    if (minified.error) {
        throw minified.error;
    }
    fs.writeFileSync(filePath, minified.code, 'utf8');
};

if (!process.env.DEVELOPMENT) {
    minify('rammerhead.min.js');
    minify('hammerhead.min.js');
}
