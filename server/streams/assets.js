const { readFileSync, readdirSync } = require('fs');
const { extname } = require('path');

const { pipe, filter, extend } = require('../../lib/Observable/operators');

const NotFound = Symbol.for('File$$NotFound');

const MIME_TYPES = [
  ['css', 'text/css'],
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['woff2', 'font/woff2'],
  ['svg', 'image/svg+xml'],
  ['js', 'application/javascript'],
].reduce(
  (allTypes, [ext, mimeType]) => ({
    ...allTypes,
    [ext]: mimeType,
    [`.${ext}`]: mimeType,
  }),
  {}
);

function File(path) {
  const mime = MIME_TYPES[extname(path)];
  let buffer = NotFound;
  try {
    buffer = readFileSync(`./assets/${path}`);
  } catch (err) {
    /* swallow error */
    console.error('Error finding file:' + path);
  }

  this.path = path;
  this.mime = mime;
  this.buffer = buffer;
}

const jsBundle =
  process.env.NODE_ENV === 'dev'
    ? 'bundle.js'
    : readdirSync('assets').find(f => f.endsWith('bundle.js'));

const fileCache = new Map([[jsBundle, new File(jsBundle)]]);

module.exports = pipe(
  filter(([req]) => /^\/assets\/(.*)/.test(req.url)),
  extend(evt => {
    const [req, res] = evt;
    const path = req.url.replace('/assets/', '');
    const file = fileCache.get(path) || new File(path);

    if (!fileCache.has(path)) fileCache.set(path, file);

    // console.log(fileCache);

    res.asset = file;
  })
);

module.exports.NotFound = NotFound;
module.exports.jsBundle = jsBundle;
