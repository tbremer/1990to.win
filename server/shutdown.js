// Taken from https://medium.com/@becintec/building-graceful-node-applications-in-docker-4d2cd4d5d392

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

module.exports = function(server) {
  function shutdown(signal, value) {
    console.log('shutdown!');
    server.close(() => {
      console.log(`server stopped by ${signal} with value ${value}`);
      process.exit(128 + value);
    });
  }

  Object.keys(signals).forEach(signal => {
    process.on(signal, () => {
      console.log(`process received a ${signal} signal`);
      shutdown(signal, signals[signal]);
    });
  });
};
