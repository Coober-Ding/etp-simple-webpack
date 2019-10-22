module.exports.uniqWith = function uniqWith(array, comparator) {
  return array.reduce(
    (acc, d) => (!acc.some((item) => comparator(d, item)) ? [...acc, d] : acc),
    []
  );
}