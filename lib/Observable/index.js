function Observable(callback) {
  if (!(this instanceof Observable)) return Observable.from(callback);

  this.subscribe = function Observable$$Subscribe(observerObj) {
    const cleanup = callback(observerObj);

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  };
}

Observable.from = function Observable$$From(callback) {
  return new Observable(callback);
};

function fromEvent(source, name) {
  return new Observable(({ next }) => {
    function handler(...args) {
      next(args);
    }

    source.addListener(name, handler);

    return () => {
      source.removeListener(name, handler);
    };
  });
}

module.exports = { default: Observable, fromEvent };
