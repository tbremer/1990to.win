// const { fragment } = require('./h');

function render(tree) {
  return JSON.stringify(tree, null, 2);
}

module.exports = render;
