const Source = require('../core/Source.js')
const {parse} = require('@babel/parser')
const csser = require('../../lib/css/csser.js')
const postcss = require('postcss')
const urlPlugin = require('../../lib/css/postcss-url-plugin')
const importPlugin = require('../../lib/css/postcss-import-plugin.js')

module.exports = function VueCssLoader (multiSource) {
  let styleParts = multiSource.findAllPartByScript('css')
  if (!styleParts || styleParts.length === 0)
    return multiSource

  // 调用postcss，对一些css语法进行处理
  var plugins = []
  // 处理url路径
  plugins.push(urlPlugin({
    pathResolver: this.pathResolver
  }))
  // 处理import
  plugins.push(importPlugin({
    pathResolver: this.pathResolver
  }))

  return Promise.all(styleParts.map(part => postcss(plugins).process(part.content)))
    .then(results => {
      // 把处理过的css part都删掉
      multiSource.parts = multiSource.parts.filter(part => part.script !== 'css')
      // 收集imports
      let importItems = []
      results.forEach(result => {
        let importMessages  = result.messages.filter(msg => msg.type == 'import' && msg.pluginName == 'postcss-import-plugin')
        if (importMessages.length > 0) {
          importMessages.forEach(msg => {
            importItems.push(msg.import)
          })
        }
      })
      // 生成运行时js
      let jsCode = csser.genRuntimeCode(results.map(result => result.css).join(''), importItems)
      // parse
      let ast = parse(jsCode, {sourceType: 'module'})
      let newPart = new Source(Source.TYPE.AST, 'css|js', ast)
      newPart.origin = multiSource.origin
      multiSource.parts.push(newPart)
      return multiSource
    })

}
