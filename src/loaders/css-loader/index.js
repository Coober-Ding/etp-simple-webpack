const csser = require('../../lib/css/csser.js')
const {parse} = require('@babel/parser')
const Source = require('../core/Source.js')
const postcss = require('postcss')
const urlPlugin = require('../../lib/css/postcss-url-plugin.js')
const importPlugin = require('../../lib/css/postcss-import-plugin.js')
module.exports = function cssLoader (source) {
  let code = source.content
  // 调用postcss，对一些css语法进行处理
  var plugins = []
  plugins.push(urlPlugin({
    contextPath: this.compileOptions.contextPath,
    currentFilePath: this.resource.name
  }))
  // 处理import
  plugins.push(importPlugin({
    contextPath: this.compileOptions.contextPath,
    currentFilePath: this.resource.name
  }))

  return postcss(plugins).process(code).then(result => {
    // 收集imports
    let importItems = []
    let importMessages  = result.messages.filter(msg => msg.type == 'import' && msg.pluginName == 'postcss-import-plugin')
    if (importMessages.length > 0) {
      importMessages.forEach(msg => {
        importItems.push(msg.import)
      })
    }

    let jsCode = csser.genRuntimeCode(result.css, importItems)
    let ast = parse(jsCode, {sourceType: 'module'})
    source.type = Source.TYPE.AST
    source.script = 'css|js'
    source.content = ast
    source.origin = source.content
    return source
  })
}