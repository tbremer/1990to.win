const { createServer, STATUS_CODES } = require('http');
const express = require('express');

const render = require('./renderer');
const home = require('./pages/home');

const app = express();

createServer(app).listen(process.env.PORT || 8888, () =>
  console.log(`http://localhost:${process.env.PORT || 8888}`)
);

app.use((req, _, next) => {
  req.context = require('../data.json');
  next();
});

app.get('/', (req, res) => {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1,990 to win</title>
</head>
<body>
    ${render(home())}
</body>
</html>`;

  res.writeHead(200, STATUS_CODES[200], {
    'Content-Type': 'text/html',
    'Content-Length': body.length,
  });

  res.write(body);
  res.end();
});

app.use((_, res) => {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1,990 to win</title>
</head>
<body>
    Yikes! That's not happening…
    <br />
    <a href="/">Go home! 🏚</a>
</body>
</html>`;
  res.writeHead(404, STATUS_CODES[404], {
    'Content-Type': 'text/html',
    'Content-Length': body.length,
  });
  res.write(body);
  res.end();
});

app.use((err, _req, res) => {
  console.log('use err:', err, '');
  res.writeHead(500, STATUS_CODES[500], {
    'Content-Type': 'text/html',
    'Content-Length': 6,
  });
  res.write('oh noz');
});
