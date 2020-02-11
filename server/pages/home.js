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
    }),
    h(
      'div',
      { class: 'candidate-meta' },
      h('h2', { style: 'margin: 0' }, nameToHuman(name)),
      h(
        'p',
        { style: 'margin: 0; font-size: 1.25rem; font-weight: 500;' },
        'total delegates:',
        data.delegates.reduce(addDelegates, 0)
      )
    )
  );
}

function addDelegates(total, { count }) {
  return total + count;
}

function home(context) {
  const data = Object.entries(context);

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
