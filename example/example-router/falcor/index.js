const FalcorServer = require('falcor-express');
const Router = require('falcor-router');

module.exports = (db) => {
  const BaseRouter = Router.createClass([
    ...require('./foldersById')(db),
    ...require('./folderList')(db)
  ]);

  // To subclass:
  // const SubRouter = function(prop) {
  //   BaseRouter.call(this);
  //   this.prop = prop;
  // };
  //
  // SubRouter.prototype = Object.create(BaseRouter.prototype);

  return FalcorServer.dataSourceRoute((req, res) => {
    res.type('json');
    return new BaseRouter();

    // mock
    // return new falcor.Model({
    //   cache: {
    //     foldersById: {
    //       1: {
    //         name: 'folder1',
    //       },
    //       2: {
    //         name: 'folder2',
    //       }
    //     }
    //   }
    // }).asDataSource();
  });
};

