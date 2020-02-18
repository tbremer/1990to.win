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
    'candidate-card',
    {
      class: `candidate ${name} ${data.suspended ? 'suspended' : ''}`,
      onclick: `document.querySelector('.candidate.active:not(.${name})') && document.querySelector('.candidate.active:not(.${name})').classList.remove('active'); this.classList.toggle('active'); event.stopImmediatePropagation();`,
      name: name,
    },
    h('img', {
      class: 'candidate-image',
      src: data.photo,
      alt: `Portrant of ${nameToHuman(name)}.`,
    }),
    h(
      'svg', {
        style: 'position: absolute; left: 13px; transform: rotate(-90deg);',
        width: 80,
        height: 80
      },
      h('circle', {
        stroke: '#CCCCCC',
        'stroke-width': 4,
        fill: 'transparent',
        r: 38,
        cx: 40,
        cy: 40
      }),
      h('circle', {
        'stroke-dasharray': '238.76104167282426 238.76104167282426',
        style: `stroke-dashoffset: ${getProgress(data.delegates.reduce(addDelegates, 0))};`,
        stroke: '#29a0cb',
        'stroke-width': 4,
        fill: 'transparent',
        r: 38,
        cx: 40,
        cy: 40
      })
    ),
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
    ),
    h(
      'div',
      { class: 'candidate-overview' },
      h('h3', { style: 'margin: 0; padding: 0;' }, 'Delegates'),
      h('ul', { class: 'delegates' },
        // @TODO: Remove these manual entries once we sort out how to load them dynamically
        data.delegates[1] && h('li', { class: 'delegate' }, `${nameToHuman(data.delegates[1].state)}: ${data.delegates[1].count}`),
        data.delegates[0] && h('li', { class: 'delegate' }, `${nameToHuman(data.delegates[0].state)}: ${data.delegates[0].count}`),

        // @TODO: Figure out why this does not work.  Logs correctly, but does not render
        data.delegates.forEach(delegate => {
          // console.log(`${nameToHuman(delegate.state)}: ${delegate.count}`)
          h('li', { class: 'delegate' }, `${nameToHuman(delegate.state)}: ${delegate.count}`)
        })
      )
    )
  );
}

function addDelegates(total, { count }) {
  return total + count;
}

function getProgress(count) {
  const circumference = 238.76104167282426;
  const percent = Math.ceil((count / 1990) * 100);

  if (percent > 100) {
    percent = 100;
  }

  return circumference - (percent / 100 * circumference);
}

function home(context, states) {
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
