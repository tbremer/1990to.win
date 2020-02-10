const { fragment } = require('./h');
const { emptyElements } = require('./constants');

function createNode(name) {
  return `<${name}`;
}
function createAttribute(key, value) {
  if (value === false) return '';

  return `${key}="${value === true ? key : value}"`;
}

function closeNode(name) {
  return emptyElements.indexOf(name) === -1 ? `<\/${name}>` : ' />';
}

function render(tree) {
  console.log(tree);
  if (typeof tree === 'string' || typeof tree === 'number')
    return tree.toString();
  if (tree.node === fragment)
    return tree, tree.props.children.map(render).join('\r\n');

  let stringValue = createNode(tree.node);

  for (const key of Object.getOwnPropertyNames(tree.props)) {
    if (key === 'children') continue;

    stringValue += ` ${createAttribute(key, tree.props[key])}`;
  }

  stringValue += '>';

  stringValue += tree.props.children.map(render).join('\r\n');

  stringValue += closeNode(tree.node);

  return stringValue;
}

module.exports = render;
