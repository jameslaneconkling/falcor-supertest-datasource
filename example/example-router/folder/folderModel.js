const Rx = require('rx');
const {
  range2List,
  range2LimitOffset
} = require('../utils/falcor');

const handleError = (observer, err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  return observer.onError(err);
};

module.exports = db => {
  const Folder = {
    /**
     * Get folders by id
     *
     * returns an observable that emits an object for each id requested
     * each emitted object has:
     * - an id key
     * - a row key pointing at a map of fieldName:rowValue pairs, or if id doesn't exist, pointing at null
     *
     * {
     *   id: 1,
     *   row: {name: 'Herman Cain', email: 'hcain@verizon.net'}
     * }
     *
     * @param {String} ids
     * @param {Array} fields
     * @return {Observable}
     */
    getByIds(ids, fields) {
      return Rx.Observable.create(observer => {
        db.all(`SELECT ${fields.concat('id')} FROM folder WHERE id IN (${ids.map(id => `'${id}'`).join(', ')})`, [], (err, rows) => {
          if (err) {
            return handleError(observer, err);
          }

          ids.forEach(id => {
            observer.onNext({
              id,
              row: rows.find(row => row.id === id)
            });
          });

          observer.onCompleted();
        });
      });
    },

    /**
     * Get folders from list by range
     *
     * returns an observable that emits an object for each index in range
     * each emitted object has:
     * - an idx key representing the index w/i the list
     * - a row key pointing to a map of fieldName:rowValue pairs, or if nothing exists at index, pointing at null
     *
     * {
     *   idx: 1,
     *   row: {name: 'Herman Cain', email: 'hcain@verizon.net'}
     * }
     *
     * @param {Object} range
     * @param {Array} fields
     * @return {Observable}
     */
    getByRange(range, fields) {
      return Rx.Observable.create(observer => {
        const {limit, offset} = range2LimitOffset(range);

        // TODO - only concat id if not present: fields.contains('id') ? fields : fields.concat('id')
        db.all(`SELECT ${fields.concat('id').join(', ')} FROM folder LIMIT ${limit} OFFSET ${offset}`, [], (err, rows) => {
          if (err) {
            return handleError(observer, err);
          }

          range2List(range).forEach((rangeIndex, idx) => {
            observer.onNext({
              idx: rangeIndex,
              row: rows[idx]
            });
          });

          observer.onCompleted();
        });
      });
    },

    /**
     * Get folders from list by multiple ranges
     *
     * see getByRange()
     *
     * @param {Array} ranges
     * @param {Array} fields
     * @return {Observable}
     */
    getByRanges(ranges, fields) {
      return Rx.Observable.from(ranges)
        .flatMap(range => Folder.getByRange(range, fields));
    },

    /**
     * CREATE folder
     */
    create(name, parentId) {
      return Rx.Observable.create(observer => {
        // create folder
        db.run(`INSERT INTO folder (name, parentId) VALUES ('${name}', '${parentId}')`, [], function(err) {
          if (err) {
            return handleError(observer, err);
          }

          observer.onNext({id: this.lastID, name, parentId});
          observer.onCompleted();
        });
      });
    },

    /**
     * Delete folders by id
     *
     * @param {Array} ids
     * @return {Observable}
     */
    deleteByIds(ids) {
      return Rx.Observable.create(observer => {
        db.run(`DELETE FROM folder WHERE id IN (${ids.join(', ')})`, [], (err) => {
          if (err) {
            return handleError(observer, err);
          }

          ids.forEach(id => observer.onNext(id));
          observer.onCompleted();
        });
      });
    },

    /**
     * GET folder count
     *
     * @return {Observable}
     */
    getCount() {
      return Rx.Observable.create(observer => {
        db.get('SELECT count(*) as count FROM folder', [], (err, row) => {
          if (err) {
            return handleError(observer, err);
          }

          observer.onNext(row.count);
          observer.onCompleted();
        });
      });
    },

    /**
     * SET folder props
     *
     * @param {String} id
     * @param {Array} fields
     * @return {Observable}
     */
    setRow(id, fields) {
      return Rx.Observable.create(observer => {
        const fieldsKeys = Object.keys(fields);
        const setQuery = fieldsKeys.map(field => `${field} = '${fields[field]}'`);

        // TODO - don't convert null to "null"

        db.run(`UPDATE folder SET ${setQuery.join(', ')} WHERE id = ${id}`, [], function(err) {
          if (err) {
            return handleError(observer, err);
          }

          fieldsKeys.forEach(key => {
            observer.onNext({
              id,
              field: key,
              value: fields[key]
            });
          });

          observer.onCompleted();
        });
      });
    },

    /**
     * GET subfolders by range
     *
     * @param {String} parentId
     * @param {Object} range
     * @return {Observable}
     */
    getSubfoldersByRange (parentId, range) {
      return Rx.Observable.create(observer => {
        const {limit, offset} = range2LimitOffset(range);

        db.all(`SELECT child.id as id, child.parentId as parentId
                FROM (SELECT * FROM folder WHERE id = ${parentId}) as parent
                JOIN folder as child
                ON parent.id = child.parentId
                LIMIT ${limit} OFFSET ${offset}`, [], (err, rows) => {
                  if (err) {
                    return handleError(observer, err);
                  }

                  range2List(range).forEach(idx => {
                    observer.onNext({
                      idx,
                      parentId,
                      row: rows[idx]
                    });
                  });

                  observer.onCompleted();
                });
      });
    },

    /**
     * GET Subfolders by ranges
     *
     * @param {String} parentId
     * @param {Array} ranges
     * @return {Observable}
     */
    getSubfoldersByRanges(parentId, ranges) {
      return Rx.Observable.from(ranges)
        .concatMap(range => Folder.getSubfoldersByRange(parentId, range));
    },

    /**
     * GET Subfolder count
     *
     * @param {String} parentId
     * @return {Observable}
     */
    getSubfolderCount(parentId) {
      return Rx.Observable.create(observer => {
        db.get(`SELECT count(*) as count FROM folder WHERE parentId = ${parentId}`, [], (err, row) => {
          if (err) {
            return handleError(observer, err);
          }

          observer.onNext({
            parentId,
            count: row.count
          });

          observer.onCompleted();
        });
      });
    }
  };

  return Folder;
};
