const csser = require('../../lib/csser/csser.js')
const {parse} = require('@babel/parser')
const Source = require('../core/Source.js')
module.exports = function cssLoader (source) {
  let code = source.content
  let jsCode = csser.genCode(code)
  //jsCode += `\nexport default ${this.resource.name}`
  let ast = parse(jsCode, {sourceType: 'module'})
  source.type = Source.TYPE.AST
  source.script = 'css|js'
  source.content = ast
  source.origin = source.content
  return source
}