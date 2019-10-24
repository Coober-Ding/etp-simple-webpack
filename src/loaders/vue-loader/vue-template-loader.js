const compiler = require('vue-template-compiler')
const Source = require('../core/Source.js')
const {parse} = require('@babel/parser')
const assertUrlPlugin = require('./assertUrl.js')
const transpile = require('vue-template-es2015-compiler')

module.exports = function VueTemplateLoader (multiSource) {
  let source = multiSource.findOnePartByScript('vue-template')
  if (!source)
    return multiSource
  let result = compiler.compile(source.content, {
    // 处理template里的img等标签的src路径
    modules:[assertUrlPlugin.create({
      pathResolver: this.pathResolver
    })]
  })

  if (result.errors.length > 0) {
    let errs = result.errors.join('\n')
    throw new Error('template compile failed:\n' + errs)
  }
  let staticRender = (result.staticRenderFns && result.staticRenderFns.length > 0) ?
    result.staticRenderFns.map(fn => `function(){${fn}}`)
    : []
  let render = `function () {${result.render}}`

  let code = `var templateMixin = {
    render:${render},
    staticRenderFns:[${staticRender.join(',')}]
  }`
  // 处理成es5语法，去掉with语法
  code = transpile(code)
  // code = `${code};\nexport default templateMixin`
  let ast = parse(code, {sourceType: 'module'})
  source.content = ast
  source.type = Source.TYPE.AST
  source.script = 'vue-template|js'

  return multiSource
}
