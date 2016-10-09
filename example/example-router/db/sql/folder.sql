CREATE TABLE folder (
  id INTEGER PRIMARY KEY,
  name TEXT,
  parentId INTEGER,
  FOREIGN KEY (parentId) REFERENCES folder (id)
)
