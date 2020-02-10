const { createServer, STATUS_CODES } = require('http');
const express = require('express');

const render = require('./renderer');
const h = require('./renderer/h');
const home = require('./pages/home');

const app = express();

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
              h('title', null, '1,990 to win'),
              h('link', {
                href:
                  'https://fonts.googleapis.com/css?family=Dosis:400,500,800&display=swap',
                rel: 'stylesheet',
              }),
              h(
                'style',
                null,
                `.candidate:nth-child(3n+2) {
                  margin: 0 .5rem
                }`
              )
            ),
            h(
              'body',
              {
                style:
                  'background-color: #cbd5e0; font-family: Dosis, sans-serif',
              },
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

app.get('/', (_, res) => {
  const body = Buffer.from(res.render(home), 'utf-8');

  res.writeHead(200, STATUS_CODES[200], {
    'Content-Type': 'text/html',
    'Content-Length': body.byteLength,
  });

  res.write(body);
  res.end();
});

app.use((req, res) => {
  if (req.complete) return;

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

  res.writeHead(404, STATUS_CODES[404], {
    'Content-Type': 'text/html',
    'Content-Length': body.byteLength,
  });
  res.write(body);
  res.end();
});

app.use((err, _req, res) => {
  res.writeHead(500, STATUS_CODES[500], {
    'Content-Type': 'text/html',
    'Content-Length': 6,
  });
  res.write('oh noz');
});
