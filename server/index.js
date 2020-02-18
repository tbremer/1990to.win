const { createServer, STATUS_CODES } = require('http');
const express = require('express');
const { readFile } = require('fs');
const { extname } = require('path');

const shutdown = require('./shutdown');
const render = require('./renderer');
const h = require('./renderer/h');
const home = require('./pages/home');
const logo = require('./pages/logo');

const app = express();

if (process.env.NODE_ENV === 'dev') require('dotenv').config();

const fileCache = new Map();
const MIME_TYPES = Object.entries({
  css: 'text/css',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  woff2: 'font/woff2',
  svg: 'image/svg+xml',
  js: 'application/javascript',
}).reduce(
  (allTypes, [ext, mimeType]) => ({
    ...allTypes,
    [ext]: mimeType,
    [`.${ext}`]: mimeType,
  }),
  {}
);

function sendResponse(stream, head, body) {
  stream.writeHead(...head);
  stream.write(body);
  stream.end();
}

shutdown(
  createServer(app).listen(process.env.PORT, () =>
    console.log(`http://localhost:${process.env.PORT}`)
  )
);

app.use(
  (req, _, next) => {
    req.context = require('../data.json');
    req.states = require('../states.json');
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
              h('meta', {
                name: 'description',
                content:
                  'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
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
              h('meta', {
                property: 'og:image',
                content: `https://1990to.win/assets/images/logo.png`,
              }),

              /* twitter meta */
              h('meta', {
                name: 'twitter:card',
                content: 'summary_large_image',
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
              h('meta', {
                property: 'twitter:creator:id',
                value: '_tbremer',
              }),
              h('meta', {
                property: 'twitter:image',
                value: `https://1990to.win/assets/images/logo.png`,
              }),

              h('title', null, '1,990 to win'),
              h('link', { href: '/assets/style.css', rel: 'stylesheet' }),
              h('link', { href: '/assets/images/favicon.png', rel: 'icon' })
            ),
            h(
              'body',
              {
                onclick: `document.querySelector('.candidate.active') && document.querySelector('.candidate.active').classList.remove('active');`
              },
              h(
                'div',
                {
                  style:
                    'width: 100%; max-width: 468px; margin: 1rem auto 2rem; text-align: center;',
                },
                logo()
              ),
              typeof component === 'function'
                ? component(req.context, req.states)
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
  const logoRegex = /images\/logo/;

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
          ...((imageRegex.test(mime) && !logoRegex.test(mime)) ||
          /woff2/.test(mime)
            ? { 'Cache-Control': 'max-age=604800' }
            : {}),
        },
      ],
      contents
    );
    return next();
  }

  readFile(`./assets/${fileName}`, (err, contents) => {
    if (err) return next(err);

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
          ...((imageRegex.test(mime) && !logoRegex.test(mime)) ||
          /woff2/.test(mime)
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
  if (/curl\//.test(req.headers['user-agent'])) return next();
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

/* cURL */
app.get('/', (req, res, next) => {
  if (!/curl\//.test(req.headers['user-agent'])) return next();
  if (req.url !== '/') return next();

  const entries = Object.entries(req.context); //.entr
  const active = entries.filter(([, { suspended }]) => !suspended);
  const suspended = entries.filter(([, { suspended }]) => suspended);
  const data = active.concat(suspended);

  data.sort(([, { delegates: a }], [, { delegates: b }]) => {
    const aCount = a.reduce((total, item) => (total += item.count), 0);
    const bCount = b.reduce((total, item) => (total += item.count), 0);

    return aCount < bCount ? 1 : aCount > bCount ? -1 : 0;
  });

  const jsonBuffer = Buffer.from(
    JSON.stringify(
      data.reduce((list, [name, candidateData]) => {
        list[name] = candidateData.delegates.reduce(
          (total, item) => (total += item.count),
          0
        );

        if (candidateData.suspended) {
          list[
            name
          ] = `suspended on ${candidateData.suspended} with ${list[name]} delegates`;
        }

        if (candidateData.projection) {
          list[name] = {
            delegates: list[name],
            projection: candidateData.projection,
          };
        }

        return list;
      }, {}),
      null,
      2
    )
  );

  sendResponse(
    res,
    [
      200,
      STATUS_CODES[200],
      {
        'Content-Type': 'application/json',
        'Content-Length': jsonBuffer.byteLength,
      },
    ],
    jsonBuffer
  );
});

app.use((_req, res) => {
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
