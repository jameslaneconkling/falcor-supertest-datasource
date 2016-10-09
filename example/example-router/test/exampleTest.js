const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../../db');
const appConstructor = require('../../app');

const seedFilePath = `${__dirname}/../../db/sql/seed.sql`;
const assertFailure = assert => err => {
  assert.fail(err);
  assert.end();
};

const setupFalcorTestModel = db => {
  const app = require('../../app')(db);
  return new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
};

/*******************************/
/** Test against Falcor Model **/
/*******************************/
test('Example Test against Falcor Model- folderList: Should return folders from beginning of list', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  const expectedResponse = {
    folderList: {
      0: {
        id: 1,
        name: 'root folder',
        parentId: null
      },
      1: {
        id: 2,
        name: 'folder1',
        parentId: 1
      }
    }
  };

  model.get(['folderList', {'to': 1}, ['id', 'name', 'parentId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure);
});


test('Example Test against Falcor Model- foldersById: Should return folders with ID 1, 3, and 4', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  const expectedResponse = {
    'foldersById': {
      '1': {
        'id': 1,
        'name': 'root folder',
        'parentId': null
      },
      '3': {
        'id': 3,
        'name': 'folder2',
        'parentId': 1
      },
      '4': {
        'id': 4,
        'name': 'folder3',
        'parentId': 1
      }
    }
  };

  model.get(['foldersById', [1, 3, 4], ['id', 'name', 'parentId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure);
});


/*********************************/
/** Test as direct ajax request **/
/*********************************/
test('Example Test as ajax request - folderList: Should return folders from beginning of list', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

  const method = 'get';
  const paths = [
    ['folderList', {'to': 1}, ['id', 'name', 'parentId']]
  ];
  const expectedResponse = {
    jsonGraph: {
      folderList: {
        0: { $type: 'ref', value: [ 'foldersById', 1 ] },
        1: { $type: 'ref', value: [ 'foldersById', 2 ] }
      },
      foldersById: {
        1: {
          id: 1,
          name: 'root folder',
          parentId: null
        },
        2: {
          id: 2,
          name: 'folder1',
          parentId: 1
        }
      }
    }
  };

  request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
      }

      assert.deepEqual(res.body, expectedResponse);
    });
});


test('Example Test as ajax request - foldersById: Should return folders with ID 1, 3, and 4', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

  const method = 'get';
  const paths = [
    ['foldersById', [1, 3, 4], ['id', 'name', 'parentId']]
  ];
  const expectedResponse = {
    'jsonGraph': {
      'foldersById': {
        '1': {
          'id': 1,
          'name': 'root folder',
          'parentId': null
        },
        '3': {
          'id': 3,
          'name': 'folder2',
          'parentId': 1
        },
        '4': {
          'id': 4,
          'name': 'folder3',
          'parentId': 1
        }
      }
    }
  };

  request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
      }

      assert.deepEqual(res.body, expectedResponse);
    });
});


/*********************************/
/** Test set w/ pathValue       **/
/*********************************/
test('foldersById: Should update folder name with a pathSet', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    foldersById: {
      2: {
        name: 'folder1 edit1'
      }
    }
  };

  model.set({
    path: ['foldersById', 2, 'name'],
    value: 'folder1 edit1'
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['foldersById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'folder1 edit1', 'updated value is persisted');
        });
    }, assertFailure(assert));
});


/*********************************/
/** Test set w/ jsonGraphEnvelope*/
/*********************************/
test('foldersById: Should update folder name with a jsonGraphEnvelope', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    foldersById: {
      2: {
        name: 'folder1 edit2'
      }
    }
  };

  model.set({
    'jsonGraph': {
      'foldersById': {2: {'name': 'folder1 edit2'}}
    },
    'paths': [['foldersById', 2, 'name']]
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['foldersById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'folder1 edit2', 'updated value is persisted');
        });
    }, assertFailure(assert));
});
