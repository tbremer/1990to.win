const { default: Observable } = require('./');

const Empty = Symbol.for('Observer$Empty');

function pipe(...operators) {
  return observer => {
    return new Observable(({ next: caller }) => {
      const unsubscribe = observer.subscribe({
        next(data) {
          let value = data;
          let idx = 0;

          function _next() {
            if (value === Empty) return;
            if (idx >= operators.length) return caller(value);
            const operator = operators[idx++];

            if (operator instanceof Filter) {
              const tmpValue = operator.predicate(value);
              if (typeof tmpValue !== 'boolean') {
                /* throw error */
              }
              if (tmpValue === false) value = Empty;
              return _next();
            }
            value = operator(value);
            return _next();
          }

          _next();
        },
      });

      return unsubscribe;
    });
  };
}

function subscribe(handler) {
  return function(observer) {
    const unsubscribe = observer.subscribe({
      next(data) {
        handler(data);
      },
    });

    return unsubscribe || (() => {});
  };
}

function Filter(predicate) {
  this.predicate = predicate;
}

function filter(predicate) {
  return new Filter(predicate);
}

/**
 * `extend`
 * extend :: (T a -> T a) -> T a
 * extend can contain side effects and is not expected to be functionally pure
 * it, however, always returns the subcription's data.
 */
function extend(callback) {
  return data => {
    callback(data);

    return data;
  };
}

module.exports = {
  pipe,
  subscribe,
  filter,
  extend,
};
