const babel = require("@babel/core/lib/transform.js")
const util = require("../core/util.js")
const Source = require("../core/Source.js")

module.exports = function (/**  @type {Source} */ source) {
  var context = this
  let loader = util.getCurrentLoader(context)
  let options = Object.assign({
    sourceMaps: false,
    sourceType: 'module',
    ast: true,
    code: false,
    caller: {
      name: 'babel-loader',
      supportsStaticESM: true,
      supportsDynamicImport: true
    }
  }, loader.options)

  var result = babel.transformSync(source.content, options)
  source.content = result.ast
  source.type = Source.TYPE.AST
  return source
}