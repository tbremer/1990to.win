if (process.env.NODE_ENV === 'dev') require('dotenv').config();

function dataMunge() {
  const info = require('../candidate-info.json');
  const dataSet = require('../data.json');
  const candidateData = {};

  // build candidate info
  for (const name in info) {
    if (!Object.prototype.hasOwnProperty.call(info, name)) continue;
    const [, lName] = name.split('-');
    const apStatesParticipatingIn = dataSet.parties.Dem.states.filter(
      i => i.name && i.candidates.find(c => c.name.toLowerCase() === lName)
    );
    const homeGrownCandInfo = info[name];

    candidateData[name] = {
      ...homeGrownCandInfo,
      delegates: apStatesParticipatingIn.map(state => {
        const delgateData = state.candidates.find(
          c => c.name.toLowerCase() === lName
        );

        return {
          count: delgateData.total,
          state: state.name.replace(/ /g, '-').toLowerCase(),
        };
      }),
    };
  }

  process.candidateData = candidateData;
  process.stateData = dataSet.parties.Dem.states;

  // console.log(process.stateData);
}

dataMunge();

const { STATUS_CODES } = require('http');
const app = require('./server');
const { sendResponse } = require('./server');
const { subscribe } = require('../lib/Observable/operators');
const { homepage, curl, assets, stats } = require('./streams');

const renderer = require('./renderer');
const h = require('./renderer/h');
const homePage = require('./pages/home');
const statsPage = require('./pages/stats');

subscribe(([req, res]) => {
  const body = Buffer.from(
    renderer(
      res.render(homePage, {
        url: req.url,
        context: req.context,
        jsBundle: assets.jsBundle,
      })
    )
  );
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
})(homepage(app));

subscribe(([req, res]) => {
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
})(curl(app));

subscribe(([, res]) => {
  const { asset: file } = res;

  if (file.path === assets.NotFound) {
    sendResponse(res, [404, STATUS_CODES[404]]);
    return;
  }

  const imageRegex = /image\//;
  const logoRegex = /images\/logo/;
  const { mime, buffer } = file;

  sendResponse(
    res,
    [
      200,
      STATUS_CODES[200],
      {
        'Content-Type': mime,
        'Content-Length': buffer.byteLength,
        ...((imageRegex.test(mime) && !logoRegex.test(mime)) ||
        /woff2/.test(mime)
          ? { 'Cache-Control': 'max-age=604800' }
          : {}),
      },
    ],
    buffer
  );
})(assets(app));

subscribe(([req, res]) => {
  const body = Buffer.from(
    renderer(
      res.render(statsPage, {
        url: req.url,
        context: req.context,
        jsBundle: assets.jsBundle,
      })
    )
  );

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
})(stats(app));

subscribe(([req, res]) => {
  if (res.finished) return;

  const body = Buffer.from(
    renderer(
      res.render(
        h(
          h.fragment,
          null,
          "Yikes! That's not happening…",
          h('br'),
          h('a', { href: '/' }, 'Go Home 🏚')
        ),
        {
          url: req.url,
          context: req.context,
          jsBundle: assets.jsBundle,
        }
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
})(app);
