const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const logger = require('./logger');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

async function webserver() {
  app.get('/', (req, res) => res.json({ message: 'Server is running!' }));
  app.get('/temperatures', async (req, res) => {
    const temperatures = []; // @TODO: replace with InfluxDB query
    res.json({ temperatures });
  });

  io.on('connection', async (socket) => {
    logger.info(`New Connection from Socket ${socket.id}`);
    const temperatures = []; // @TODO: replace with InfluxDB query
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

module.exports = {
  app,
  server,
  io,
  webserver,
};
