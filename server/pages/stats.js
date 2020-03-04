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

  // data.sort();

  return h(
    'table',
    { style: 'border-collapse: collapse;' },
    h('thead', {}, h('tr', {}, ...tableHead())),
    h('tbody', {}, ...data.map(candidateRow))
  );
}

module.exports = stats;

function tableHead() {
  return ['', 'Total', 'With Projections'].map(cell =>
    h(
      'th',
      {
        style: 'height: 140px; white-space: nowrap;',
      },
      cell.length
        ? h(
            'div',
            {
              style:
                'transform: translate(25px, 51px) rotate(315deg); width: 30px;',
            },
            h(
              'span',
              {
                style: 'border-bottom: 1px solid #ccc; padding: 5px 10px;',
              },
              cell
            )
          )
        : null
    )
  );
}

function candidateRow([name, candidate]) {
  const pledged = candidate.delegates.reduce(addDelegates, 0);
  const projection = candidate.projection.reduce(addDelegates, 0);

  return h(
    'tr',
    {
      style: `${
        candidate.suspended ? 'opacity: .5; filter: grayscale(1);' : ''
      }`,
    },
    h(
      'td',
      { style: 'border-bottom: 1px solid #ccc; padding: 10px 0' },
      h(
        'div',
        { style: 'display: flex; align-items: center; padding-right: .5rem' },
        h('img', {
          style: 'border-radius: 30px;object-fit: cover; margin-right: .5rem;',
          width: '30',
          height: '30',
          src: candidate.photo,
          alt: `Portrait of ${nameToHuman(name)}`,
        }),
        nameToHuman(name)
      ),
      candidate.suspended
        ? h(
            'p',
            { style: 'margin: .25rem 0;font-size: .75em' },
            'Suspended On:',
            candidate.suspended
          )
        : null
    ),
    h(
      'td',
      {
        style:
          'width: 30px; padding: 10px 5px; border: 1px solid #ccc;text-align:center;',
      },
      pledged
    ),
    h(
      'td',
      {
        style: `width: 30px; padding: 10px 5px; border: 1px solid #ccc;text-align:center; ${
          projection > 0 ? '' : 'opacity: .5;'
        }`,
      },
      projection > 0 ? pledged + projection : '-'
    )
  );
}
