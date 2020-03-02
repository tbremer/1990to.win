const { fragment } = require('./h');
const { emptyElements } = require('./constants');
const { EOL } = require('os');

function createNode(name) {
  return `<${name}`;
}
function createAttribute(key, value) {
  if (value === false) return '';
  return `${key}="${value === true ? key : value.replace(/"/g, '&quot;')}"`;
}

function doctype(tree) {
  return `<!DOCTYPE ${Object.keys(tree.props || {})
    .filter(i => i !== 'children')
    .join(' ')}>`;
}

function render(tree) {
  if (Array.isArray(tree)) return tree.map(render);
  // console.log(tree);
  if (tree === undefined) return null;
  if (typeof tree === 'string' || typeof tree === 'number')
    return tree.toString();

  if (tree.node === fragment) return tree.props.children.map(render).join(EOL);

  if (tree.node === '!DOCTYPE') return doctype(tree);

  let stringValue = createNode(tree.node);
  const isEmptyElement = emptyElements.indexOf(tree.node) !== -1;

  for (const key of Object.getOwnPropertyNames(tree.props)) {
    if (key === 'children') continue;

    stringValue += ` ${createAttribute(key, tree.props[key])}`;
  }

  if (isEmptyElement) return (stringValue += '/>');

  stringValue += '>';

  stringValue += tree.props.children.map(render).join(EOL);

  stringValue += `</${tree.node}>`;

  return stringValue;
}

module.exports = render;
