const { createServer, STATUS_CODES } = require('http');
const express = require('express');
const { readFile } = require('fs');
const { extname } = require('path');

const render = require('./renderer');
const h = require('./renderer/h');
const home = require('./pages/home');

const app = express();

const fileCache = new Map();
const MIME_TYPES = {
  '.css': 'text/css',
  css: 'text/css',

  '.jpeg': 'image/jpeg',
  jpeg: 'image/jpeg',

  '.jpg': 'image/jpeg',
  jpg: 'image/jpeg',
};

function sendResponse(stream, head, body) {
  stream.writeHead(...head);
  stream.write(body);
  stream.end();
}

createServer(app).listen(process.env.PORT || 8888, () =>
  console.log(`http://localhost:${process.env.PORT || 8888}`)
);

app.use(
  (req, _, next) => {
    req.context = require('../data.json');
    next();
  },
  (req, res, next) => {
    res.render = function(component) {
      return render(
        h(
          h.fragment,
          null,
          h('!DOCTYPE', { html: true }),
          h(
            'html',
            { lang: 'en' },
            h(
              'head',
              null,
              h('meta', { charset: 'UTF-8' }),
              h('meta', {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
              }),
              /* facebook meta */
              h('meta', {
                property: 'og:type',
                content: 'website',
              }),
              h('meta', {
                property: 'og:url',
                content: `https://1990to.win${req.url}`,
              }),
              h('meta', {
                property: 'og:site_name',
                content: '1990 to win',
              }),
              h('meta', { property: 'og:title', content: '1,990 to win' }),
              h('meta', {
                property: 'og:description',
                content:
                  'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
              }),
              /* twitter meta */
              h('meta', {
                name: 'twitter:card',
                content: 'summary',
              }),
              h('meta', {
                name: 'twitter:domain',
                value: '1990to.win',
              }),
              h('meta', {
                property: 'twitter:title',
                value: '1990 to win',
              }),
              h('meta', {
                property: 'twitter:description',
                value:
                  'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
              }),
              h('title', null, '1,990 to win'),
              h('link', {
                href:
                  'https://fonts.googleapis.com/css?family=Barlow:400,500,800&display=swap',
                rel: 'stylesheet',
              }),
              h('link', { href: '/assets/style.css', rel: 'stylesheet' })
            ),
            h(
              'body',
              null,
              h(
                'h1',
                { style: 'margin: 0; margin-bottom: 2rem; text-align:center' },
                '1,990 to win'
              ),
              typeof component === 'function'
                ? component(req.context)
                : component
            )
          )
        )
      );
    };
    next();
  }
);

app.get('/assets/*', (req, res, next) => {
  const { 0: fileName } = req.params;
  const imageRegex = /image\//;

  if (fileCache.has(fileName)) {
    const { mime, contents } = fileCache.get(fileName);

    sendResponse(
      res,
      [
        200,
        STATUS_CODES[200],
        {
          'Content-Type': mime,
          'Content-Length': contents.byteLength,
          ...(imageRegex.test(mime)
            ? { 'Cache-Control': 'max-age=604800' }
            : {}),
        },
      ],
      contents
    );
    return next();
  }

  readFile(`./assets/${fileName}`, (err, contents) => {
    if (err) {
      console.log('next error');
      return next(err);
    }

    const mime = MIME_TYPES[extname(fileName)] || 'text/plain';

    fileCache.set(fileName, {
      mime,
      contents,
    });

    sendResponse(
      res,
      [
        200,
        STATUS_CODES[200],
        {
          'Content-Type': mime,
          'Content-Length': contents.byteLength,
          ...(imageRegex.test(mime)
            ? { 'Cache-Control': 'max-age=604800' }
            : {}),
        },
      ],
      contents
    );
    return next();
  });
});

app.get('/', (req, res, next) => {
  if (req.url !== '/') return next();
  const body = Buffer.from(res.render(home), 'utf-8');

  sendResponse(
    res,
    [
      200,
      STATUS_CODES[200],
      {
        'Content-Type': 'text/html',
        'Content-Length': body.byteLength,
      },
    ],
    body
  );
  next();
});

app.use((req, res) => {
  if (res.finished) return;

  const body = Buffer.from(
    res.render(
      h(
        h.fragment,
        null,
        "Yikes! That's not happening…",
        h('br'),
        h('a', { href: '/' }, 'Go Home 🏚')
      )
    ),
    'utf-8'
  );

  sendResponse(
    res,
    [
      404,
      STATUS_CODES[404],
      {
        'Content-Type': 'text/html',
        'Content-Length': body.byteLength,
      },
    ],
    body
  );
});

app.use((err, _req, res, _next) => {
  console.log('caught an error', err);
  const is404 = err.code === 'ENOENT';
  const status = is404 ? [404, STATUS_CODES[404]] : [500, STATUS_CODES[500]];

  const body = Buffer.from(
    res.render(
      h(
        h.fragment,
        null,
        is404 ? '404' : "Yikes! That's not happening…",
        h('br'),
        h('a', { href: '/' }, 'Go Home 🏚')
      )
    ),
    'utf-8'
  );

  sendResponse(
    res,
    [
      ...status,
      {
        'Content-Type': 'text/html',
        'Content-Length': body.byteLength,
      },
    ],
    body
  );
  return;
});
