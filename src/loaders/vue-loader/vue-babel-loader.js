const babel = require("@babel/core/lib/transform.js")
const Source = require('../core/Source.js')
const util = require("../core/util.js")
module.exports = function VuePreLoader (multiSource) {
  let context = this
  let source = multiSource.findOnePartByScript('js')

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

  if (!source.type === Source.TYPE.STRING) {
    throw new Error('source type invalid')
  }

  var result = babel.transformSync(source.content, options)
  source.content = result.ast
  source.type = Source.TYPE.AST
  return multiSource
}
