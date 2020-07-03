require('dotenv').config();

const logger = require('./logger');
const { webserver, server } = require('./webserver');
const { collector } = require('./collector');

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

  try {
    await serverClose();
    logger.info('Closing Server connection...');
  } catch (error) {
    logger.error('Error', error);
    logger.error('Could not shutdown correctly!');
  }

  logger.info('Exiting ...');
  process.exit();
});

collector();
webserver();
