require('dotenv').config();

const sensor = require('node-dht-sensor').promises;
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const db = require('./db');
const logger = require('./logger');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

let intervalId;

// async function sleep(ms = 1000) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

async function collector() {
  async function getMeasurement() {
    try {
      const { temperature, humidity } = await sensor.read(22, 4);
      logger.info(`temp: ${temperature.toFixed(1)}°C`);
      // const [id] = await db('temperatures').insert([{ temperature, humidity }]);
      // eslint-ignore-next-line
      // logger.info(
      //   `id: ${id} temp: ${temperature.toFixed(
      //     1
      //   )}°C humidity: ${humidity.toFixed(1)}% - ${new Date()}`
      // );
      if (io) {
        io.emit('temperature-update', {
          // id,
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
  intervalId = setInterval(getMeasurement, 1000);
}

async function webserver() {
  app.get('/', (req, res) => res.json({ message: 'Server is running!' }));
  app.get('/temperatures', async (req, res) => {
    const temperatures = await db.select().table('temperatures');
    res.json({ temperatures });
  });

  io.on('connection', async (socket) => {
    logger.info(`New Connection from Socket ${socket.id}`);
    const temperatures = await db.select().table('temperatures');
    socket.emit('temperatures', { temperatures });
  });

  server.listen(
    {
      port: 5000,
      host: '0.0.0.0',
    },
    () => {
      logger.info('Server listening on port 5000');
    }
  );
}

process.on('SIGINT', async () => {
  const serverClose = () =>
    new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });

  if (intervalId) {
    try {
      clearInterval(intervalId);
      await db.destroy();
      logger.info('Closing DB connection...');
      await serverClose();
      logger.info('Closing Server connection...');
    } catch (error) {
      logger.error('Error', error);
      logger.error('Could not shutdown correctly!');
    }
  }
  logger.info('Exiting ...');
  process.exit();
});

collector();
webserver();
