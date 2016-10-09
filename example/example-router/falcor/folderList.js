const falcor = require('falcor');
const FolderModelConstructor = require('../folder/folderModel');
const $ref = falcor.Model.ref;

module.exports = db => {
  const Folder = FolderModelConstructor(db);

  return [
    // GET Folders from folderList by index
    {
      route: 'folderList[{ranges:ranges}]',
      get(pathSet) {
        const ranges = pathSet.ranges;

        return Folder.getByRanges(ranges, [])
          .map(data => {
            // if row doesn't exist, return null pathValue
            if (!data.row) {
              return {
                path: ['folderList', data.idx],
                value: null
              };
            }

            // return pathValue ref to folder
            return {
              path: ['folderList', data.idx],
              value: $ref(['foldersById', data.row.id])
            };
          });
      }
    },
    // GET Folders Length
    {
      route: 'folderList.length',
      get() {
        return Folder.getCount()
          .map(count => {
            // return pathValue count
            return {
              path: ['folderList', 'length'],
              value: count
            };
          });
      }
    }
  ];
};