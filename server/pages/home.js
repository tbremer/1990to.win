const h = require('../renderer/h');

function nameToHuman(name) {
  return name
    .split(/-/g)
    .reduce(
      (str, part) => `${str}${part.slice(0, 1).toUpperCase()}${part.slice(1)} `,
      ''
    );
}

function candidate([name, data], idx) {
  return h(
    'div',
    {
      class: 'candidate',
      style: `display:flex;
      align-items: center;
      box-sizing: border-box;
      width: calc(33% - 1rem);
      padding: 1rem;
      border-radius: .5rem;
      background-color: #f7fafc;
      margin-top: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);`,
    },
    h('img', {
      width: '75px',
      height: '75px',
      style: 'object-fit: cover;border-radius: 75px;margin-right: 1rem;',
      src: data.photo,
    }),
    h(
      'div',
      null,
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
    'div',
    {
      style: `
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      width: 70%;
      margin: 0 auto;
      `,
    },
    ...data.map(candidate)
  );
}

module.exports = home;
