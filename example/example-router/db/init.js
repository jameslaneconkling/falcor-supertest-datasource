const fs = require('fs');
const errorHandler = (err) => {
  if (err) {
    console.error('error initializing db', err);
  }
};

module.exports = (db) => {
  db.serialize(() => {
    db.run(fs.readFileSync(__dirname + '/sql/folder.sql', 'utf8'), [], errorHandler);
  });
};
