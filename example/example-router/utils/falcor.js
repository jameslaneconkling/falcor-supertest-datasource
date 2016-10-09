const R = require('ramda');

/**
 * Convert falcor range to an array of equivalent indices
 */
exports.range2List = range => R.range(range.from, range.to + 1);

/**
 * Convert falcor range to SQL OFFSET and LIMIT values
 */
exports.range2LimitOffset = range => ({limit: range.to - range.from + 1, offset: range.from });

/**
 * Get subset of jsonGraphEnvelope, optionally excluding keys (ids, fields, or indices)
 */
exports.getGraphSubset = (graph, path, excludeKeys = []) => {
  return R.pickBy((val, key) => !R.contains(key, excludeKeys),
    R.path(path, graph)
  );
};
