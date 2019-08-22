const Source = require('../core/Source.js')
const {parse} = require('@babel/parser')
const csser = require('../../lib/csser/csser.js')
module.exports = function VueCssLoader (multiSource) {
  // 只能处理css
  let styleParts = multiSource.findAllPartByScript('css')
  if (!styleParts || styleParts.length === 0)
    return multiSource
  // 只能处理字符串
  let code = styleParts.map(part => {
    return part.content
  }).join('\n')
  let jsCode = csser.genCode(code)
  let ast = parse(jsCode, {sourceType: 'script'})
  // 把处理过的css part都删掉
  multiSource.parts = multiSource.parts.filter(part => part.script !== 'css')
  // 添加处理后的part
  let newPart = new Source(Source.TYPE.AST, 'css|js', ast)
  newPart.origin = multiSource.origin
  multiSource.parts.push(newPart)
  return multiSource
}
