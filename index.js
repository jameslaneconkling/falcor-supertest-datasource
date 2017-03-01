const Rx = require('rx');
const request = require('supertest');

module.exports = class SuperTestDataSource {
  constructor(url, app) {
    this.url = url;
    this.app = app;
  }

  get(pathSet) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .get(`${this.url}?method=get&paths=${encodeURIComponent(JSON.stringify(pathSet))}`)
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }

  set(jsonGraphEnvelope) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .post(this.url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          method: 'set',
          // superagent automatically encodes body
          // jsonGraph: encodeURIComponent(JSON.stringify(jsonGraphEnvelope))
          jsonGraph: JSON.stringify(jsonGraphEnvelope)
        })
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }

  call(callPath, args, refPaths, thisPaths) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .post(this.url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          method: 'call',
          // superagent automatically encodes body
          // callPath: encodeURIComponent(JSON.stringify(callPath)),
          // arguments: encodeURIComponent(JSON.stringify(args)),
          // pathSuffixes: encodeURIComponent(JSON.stringify(refPaths)),
          // paths: encodeURIComponent(JSON.stringify(thisPaths))
          callPath: JSON.stringify(callPath),
          arguments: JSON.stringify(args),
          pathSuffixes: JSON.stringify(refPaths),
          paths: JSON.stringify(thisPaths)
        })
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }
};
