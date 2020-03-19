const h = require('../renderer/h');
const { nameToHuman, addDelegates } = require('./home');

function getStatesInOrder() {
  const skipStates = ['UN', 'DA'];
  const states = Array.from(process.stateData).filter(
    i => skipStates.indexOf(i.abbr) === -1
  );
  states.sort(({ date: dateA }, { date: dateB }) => {
    const a = new Date(dateA).getTime();
    const b = new Date(dateB).getTime();

    return a > b ? 1 : a < b ? -1 : 0;
  });

  return states;
}

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
  const states = getStatesInOrder();

  const header = [[''], ['total']].concat(
    states
      .filter(i => i.name)
      .map(i => [i.name.replace(/ /g, '-').toLowerCase(), i.date])
  );
  return header.map(([cell, date]) =>
    h(
      'th',
      {},
      cell.length
        ? h(
            'div',
            {},
            h('span', {}, nameToHuman(cell), date ? ` - ${date}` : '')
          )
        : null
    )
  );
}

function dateToHuman(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  const year = date.getFullYear();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;

  return `${month}/${day}/${year}`;
}

function candidateRow([name, candidate], idx) {
  const states = getStatesInOrder();

  const todayMs = new Date(dateToHuman(new Date())).getTime();
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
    ...states.map(state => {
      console.log(JSON.stringify(state, null, 2));
      const [, last] = name.split('-');
      const raceDate = new Date(state.date).getTime();
      const candidate = state.candidates.find(
        i => i.name.toLowerCase() === last
      );

      console.log();

      return h(
        'td',
        {},
        raceDate > todayMs || !candidate ? '-' : candidate.total
      );
    })
  );
}
