const express = require('express');
const bodyParser = require('body-parser');

module.exports = (db) => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use('/api/model.json', require('./falcor')(db));

  app.use((err, req, res) => {
    console.error('Error on:', req, err);
    res.status(500).send({
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  });

  return app;
};
