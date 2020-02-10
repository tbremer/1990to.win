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
                `*,*::before*::after {
                  box-sizing: border-box;
                }`,
                `:root {
                  font-size: 100%;
                  font-family: Dosis, sans-serif;
                }`,
                `html, body { margin: 0; border: 0;}`,
                `body {
                  background-color: #cbd5e0;
                  padding: 1rem;
                } `,
                `.candidate-list {
                  /* justify-content: space-around; */
                  /* width: 70%; */
                  /* margin: 0 auto; */
                }`,
                `.candidate {
                  display: flex;
                  align-items: center;
                  margin-bottom: 1rem;
                  padding: 1rem;
                  border-radius: .5rem;
                  background-color: #f7fafc;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }`,
                `.candidate-meta {
                  flex: 1;
                }`,
                `@media screen and (min-width: 700px) {
                  .candidate-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-around;
                  }
                  .candidate {
                    width: calc(50% - 4rem);
                  }
                }`,
                `@media (min-width: 1000px) {
                  .candidate {
                    width: calc(33% - 4rem);
                  }
                }`,
                `@media (min-width: 1100px) {
                  .candidate-list {
                    max-width: 1100px;
                    margin: 0 auto;
                  }
                }`

                //   .candidate {
                //     display:flex;
                //     align-items: center;
                //     box-sizing: border-box;
                //     width: calc(33% - 1rem);
                //   }
                // }`,
                // `.candidate:nth-child(3n+2) {
                //   margin: 0 .5rem 1rem .5rem;
                // }`
              )
            ),
            h(
              'body',
              null,
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
