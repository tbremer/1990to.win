const h = require('../renderer/h');

function nameToHuman(name) {
  return name
    .split(/-/g)
    .reduce(
      (str, part) => `${str}${part.slice(0, 1).toUpperCase()}${part.slice(1)} `,
      ''
    );
}

function projections(arr) {
  return arr.map(projection =>
    h(
      'p',
      {
        style: 'margin: .25rem 0; color:#28A0CB; font-style:italic;',
      },
      `${nameToHuman(projection.state)}: ${projection.count} (${
        projection.percent
      }%)`
    )
  );
}

function candidate([name, data]) {
  return h(
    'candidate-card',
    {
      class: `candidate ${data.suspended ? 'suspended' : ''}`,
      data: JSON.stringify(data),
      name: name,
    },
    h(
      'section',
      {
        class: 'candidate-basics',
      },
      h('img', {
        class: 'candidate-image',
        src: data.photo,
        alt: `Portrant of ${nameToHuman(name)}.`,
      }),
      h(
        'section',
        { class: 'meta' },
        h('h2', { style: 'margin: 0; padding: 0;' }, nameToHuman(name)),
        data.suspended &&
          h('p', { style: 'margin: 0;' }, 'Suspended on:', data.suspended)
      )
    ),
    h(
      'div',
      { class: 'candidate-meta' },
      h(
        'p',
        {
          style: 'margin: .25rem 0 1rem; font-size: 1.25rem; font-weight: 500;',
        },
        'Delegate count:',
        data.delegates.reduce(addDelegates, 0)
      ),
      'projection' in data && data.projection.length
        ? h(
            'section',
            { open: 'open', style: 'font-size: .85rem' },
            h(
              'h3',
              { style: 'cursor: default; font-weight: 500; margin: 0' },
              'Projections'
            ),
            h(
              'p',
              {
                style: 'margin: .25rem 0 .5rem',
              },
              'Delegates with projections:',
              data.delegates.reduce(addDelegates, 0) +
                data.projection.reduce(addDelegates, 0)
            ),
            ...projections(data.projection || [])
          )
        : null
    )
  );
}

function addDelegates(total, { count }) {
  return total + count;
}

function home(context) {
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
    'main',
    {
      class: 'candidate-list',
    },
    ...data.map(candidate)
  );
}

module.exports = home;
module.exports.nameToHuman = nameToHuman;
module.exports.addDelegates = addDelegates;
