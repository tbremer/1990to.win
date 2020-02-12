const h = require('../renderer/h');

function nameToHuman(name) {
  return name
    .split(/-/g)
    .reduce(
      (str, part) => `${str}${part.slice(0, 1).toUpperCase()}${part.slice(1)} `,
      ''
    );
}

function candidate([name, data]) {
  return h(
    'div',
    {
      class: `candidate ${data.suspended ? 'suspended' : ''}`,
    },
    h('img', {
      class: 'candidate-image',
      src: data.photo,
      alt: `Portrant of ${nameToHuman(name)}.`,
    }),
    h(
      'div',
      { class: 'candidate-meta' },
      h('h2', { style: 'margin: 0; padding: 0;' }, nameToHuman(name)),
      data.projection &&
        h(
          'p',
          {
            style:
              'margin: .25rem 0; font-size: .95rem; color:#28A0CB; font-style:italic;',
          },
          'New Hampshire Projection:',
          data.projection.count
        ),
      h(
        'p',
        {
          style: 'margin: .25rem 0; font-size: 1.25rem; font-weight: 500;',
        },
        'Delegate count:',
        data.delegates.reduce(addDelegates, 0)
      ),
      data.suspended &&
        h('p', { style: 'margin: 0;' }, 'Suspended on:', data.suspended)
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

  const data = active.concat(suspended);

  data.sort(([, { delegates: a }], [, { delegates: b }]) => {
    const aCount = a.reduce(addDelegates, 0);
    const bCount = b.reduce(addDelegates, 0);

    return aCount < bCount ? 1 : aCount > bCount ? -1 : 0;
  });

  return h(
    'main',
    {
      class: 'candidate-list',
    },
    ...data.map(candidate)
  );
}

module.exports = home;
