const test = require('tape');
const request = require('supertest');
const falcor = require('falcor');
const SuperTestDataSource = require('../index');
const dbConstructor = require('../example/example-router/db');
const appConstructor = require('../example/example-router/app');

const seedFilePath = `${__dirname}/../example/example-router/db/sql/seed.sql`;
const assertFailure = assert => err => {
  assert.fail(err);
  assert.end();
};
const setupFalcorTestModel = db => {
  return new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', appConstructor(db))
  });
};


test('Should return get request', assert => {
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


test('Should return set request', assert => {
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


test.skip('Should return call request', assert => {
  assert.fail('TODO');
});
