const { pipe, filter } = require('../../lib/Observable/operators');
const assets = require('./assets');

const homepage = pipe(
  filter(([req]) => /curl\//.test(req.headers['user-agent']) === false),
  filter(([req]) => req.url === '/')
);

const curl = pipe(
  filter(([req]) => /curl\//.test(req.headers['user-agent'])),
  filter(([req]) => req.url === '/')
);

const stats = pipe(
  filter(([req]) => /curl\//.test(req.headers['user-agent']) === false),
  filter(([req]) => req.url === '/stats')
);

module.exports = { homepage, curl, assets, stats };
