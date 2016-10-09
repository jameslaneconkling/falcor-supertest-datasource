const dbConstructor = require('./db');
const appConstructor = require('./app');
const port = process.env.PORT || 3000;

let dbConfig;
if (process.env.NODE_ENV === 'production') {
  dbConfig = {
    file: `${__dirname}/db.sql`,
    seed: false
  };
} else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  dbConfig = {
    file: false,
    seed: `${__dirname}/db/sql/seed.sql`
  };
}

const db = dbConstructor(dbConfig);
const app = appConstructor(db);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
