const fs = require('fs');

module.exports = (db, file, cb=() => {}) => {
  db.exec(fs.readFileSync(file, 'utf8'), err => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    cb(null);
  });
};
