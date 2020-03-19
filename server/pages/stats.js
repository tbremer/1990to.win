const h = require('../renderer/h');
const { nameToHuman, addDelegates } = require('./home');

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
  const header = ['', 'total'].concat(
    process.stateData
      .filter(i => i.name)
      .map(i => i.name.replace(/ /g, '-').toLowerCase())
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
    ...process.stateData.map(state => {
      const [, last] = name.split('-');
      const candidate = state.candidates.find(
        i => i.name.toLowerCase() === last
      );

      return h('td', {}, candidate ? candidate.total : '-');
    })
  );
}
