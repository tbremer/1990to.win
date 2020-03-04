const h = require('../renderer/h');
const { nameToHuman, addDelegates } = require('./home');
const states = require('../../lib/states');

function stats(context) {
  const entries = Object.entries(context);
  const active = entries.filter(([, { suspended }]) => !suspended);
  const suspended = entries.filter(([, { suspended }]) => suspended);

  suspended.sort(([aName, a], [bName, b]) => {
    const aTime = new Date(a.suspended).getTime();
    const bTime = new Date(b.suspended).getTime();

    if (aTime === bTime) return aName < bName ? -1 : aName > bName ? 1 : 0;

    return aTime < bTime ? 1 : aTime > bTime ? -1 : 0;
  });

  active.sort(([, { delegates: a }], [, { delegates: b }]) => {
    const aCount = a.reduce(addDelegates, 0);
    const bCount = b.reduce(addDelegates, 0);

    return aCount < bCount ? 1 : aCount > bCount ? -1 : 0;
  });

  const data = active.concat(suspended);

  return h(
    'table',
    {},
    h('thead', {}, h('tr', {}, ...tableHead())),
    h('tbody', {}, ...data.map(candidateRow))
  );
}

module.exports = stats;

function tableHead() {
  const header = ['', 'total', 'with-projections'].concat(
    Array.from(states.keys())
  );
  return header.map(cell =>
    h(
      'th',
      {},
      cell.length ? h('div', {}, h('span', {}, nameToHuman(cell))) : null
    )
  );
}

function candidateRow([name, candidate], idx) {
  const pledged = candidate.delegates.reduce(addDelegates, 0);
  const projection = candidate.projection.reduce(addDelegates, 0);
  const evenRowStyle =
    idx % 2 === 0 ? 'background-color: #fff;' : 'background-color: #edeff0;';

  return h(
    'tr',
    {
      class: candidate.suspended ? 'suspended' : '',
      style: evenRowStyle,
    },
    h(
      'td',
      {
        class: 'candidate-column',
        style: `${evenRowStyle}`,
      },
      h(
        'div',
        {},
        h('img', {
          src: candidate.photo,
          alt: `Portrait of ${nameToHuman(name)}`,
        }),
        nameToHuman(name)
      ),
      candidate.suspended
        ? h('p', {}, 'Suspended On:', candidate.suspended)
        : null
    ),
    h('td', {}, pledged),
    h('td', {}, projection > 0 ? pledged + projection : '-'),
    ...Array.from(states.keys()).map(state => {
      const info = states.get(state).candidates.find(i => i[0] === name);
      if (info === undefined) return h('td', {}, '–');

      const [, count, type] = info;

      return h(
        'td',
        {
          class: type,
        },
        count
      );
    })
  );
}
