const sensor = require('node-dht-sensor').promises;

const { influx } = require('./db');
const logger = require('./logger');
const { io } = require('./webserver');
const { fan } = require('./fan');

let intervalId;

async function collector() {
  fan.off();
  async function getMeasurement() {
    try {
      const { temperature, humidity } = await sensor.read(22, 17);
      const time = new Date();

      if (!fan.isRunning && temperature > 25) {
        fan.on();
      }

      if (fan.isRunning && temperature >= 23.5 && temperature <= 24) {
        fan.off();
      }

      await influx.writePoints([
        {
          measurement: 'temperature',
          tags: { location: 'Network Rack' },
          fields: { temperature },
        },
        {
          measurement: 'humidity',
          tags: { location: 'Network Rack' },
          fields: { humidity },
        },
      ]);
      logger.info(
        `time: ${time.getTime()} temp: ${temperature.toFixed(
          1
        )}°C humidity: ${humidity.toFixed(1)}%`
      );
      if (io) {
        io.emit('temperature-update', {
          id: time.getTime(),
          temperature,
          humidity,
          created_at: new Date(),
        });
      }
    } catch (error) {
      logger.error('Error', error);
    }
  }

  getMeasurement();
  intervalId = setInterval(getMeasurement, 1000 * 60);
}

process.on('SIGINT', async () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

module.exports = {
  collector,
};
