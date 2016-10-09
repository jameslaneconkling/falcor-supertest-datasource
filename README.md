# Falcor SuperTest DataSource

A Falcor DataSource class for testing Falcor routes using [SuperTest](https://github.com/visionmedia/supertest).

Testing with a Falcor Model has a few added benefits over testing w/ direct HTTP requests:
* requests are made using Falcor's path syntax, rather than the equivalent HTTP queryparams/request body
* responses are equivalent to what the client receives, e.g. by resolving refs
* enables tests against the model cache, e.g. ensuring that paths are properly invalidated after a call request

Testing against a Falcor Model _will not_ test for overfetching or underfetching.  E.g. if a route accidentally returns more data than it should, the extra data will be dropped silently by the Falcor Model.  Similarly, if a route returns less data than it should, the model will silently make a subsequent request in order to finish building the jsonGraph snippet.  Testing against a Falcor Model _will_ ensure that the client eventually receives all the data it needs (just not necessarily as efficiently as possible).

### Basic Usage

```javascript
const falcor = require('falcor');
const test = require('some test framework like tape');
const SuperTestDataSource = require('falcor-supertest-datasource');
const app = require('./app');

const model = new falcor.Model({
  source: new SuperTestDataSource('/api/model.json', app)
});

test('Should return items by id with field1 and field2', assert => {
  const expectedResponse = {
    itemsById: {
      1: {field1: 'someValue', field2: 'someOtherValue'},
      3: {field1: 'someValue', field2: 'someOtherValue'},
      4: {field1: 'someValue', field2: 'someOtherValue'}
    }
  };

  model.get(['itemsById', [1, 3, 4], ['field1', 'field2']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, err => {
      assert.fail(err);
    });
});

```

### Advanced Usage
Take a look at `test/index.js`, which is set up to run against a sample express/falcor-router app in `example/example-router/`.  The app runs against an in-memory SQLite DB, and is reinitialized for each test, ensuring all tests run in isolation against a fresh app state.
