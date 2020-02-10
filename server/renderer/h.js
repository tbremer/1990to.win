const fragment = Symbol.for('h$$Fragment');

function h(node, props, ...children) {
  if (typeof node === 'function')
    return node(Object.assign({}, props, { children }));

  return {
    node,
    props: Object.assign({}, props, { children }),
  };
}

h.fragment = fragment;

module.exports = h;
