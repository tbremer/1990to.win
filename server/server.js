const { createServer } = require('http');
const { fromEvent } = require('../lib/Observable');
const { extend, pipe } = require('../lib/Observable/operators');
const shutdown = require('./shutdown');
const indexHtml = require('./pages/index.html');

const server = createServer();
const app = pipe(
  extend(([req]) => (req.context = process.candidateData)),
  extend(([, res]) => (res.render = indexHtml))
)(fromEvent(server, 'request'));

shutdown(server);
server.listen(
  process.env.PORT,
  () =>
    process.env.NODE_ENV === 'dev' &&
    console.log(`http://localhost:${process.env.PORT}`)
);

function sendResponse(stream, head, body) {
  stream.writeHead(...head);
  stream.write(body);
  stream.end();
}

module.exports = app;
module.exports.sendResponse = sendResponse;
