const { Gpio } = require('onoff');

const fanGpio = new Gpio(21, 'out');

const fan = {
  on: () => {
    if (fanGpio.readSync() !== 0) {
      fanGpio.writeSync(0);
    }
  },
  off: () => {
    if (fanGpio.readSync() !== 1) {
      fanGpio.writeSync(1);
    }
  },
  isRunning: () => fanGpio.readSync() === 0,
};

module.exports = { fan };
