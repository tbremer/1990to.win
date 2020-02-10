const h = require('../renderer/h');

function candidate() {
  return h('div', null, 'candidate');
}

function home() {
  return h(h.fragment, null, h('h1', null, 'Hello, World!'), h(candidate));
}

module.exports = home;
