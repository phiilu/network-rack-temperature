const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,
  database: process.env.INFLUX_DATABASE,
  schema: [
    {
      measurement: 'temperature',
      fields: {
        temperature: Influx.FieldType.FLOAT,
      },
      tags: ['location'],
    },
    {
      measurement: 'humidity',
      fields: {
        humidity: Influx.FieldType.FLOAT,
      },
      tags: ['location'],
    },
  ],
});

module.exports = {
  influx,
};
