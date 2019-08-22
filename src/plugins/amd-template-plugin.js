const babel = require("@babel/core/lib/transform-ast.js")
const Source = require('../loaders/core/Source')
const esm2AmdPlugin = require('@babel/plugin-transform-modules-amd')
const generate = require('@babel/generator').default
const path = require('path')
const resolver = require('../path-resolve/index.js')
var dynamicImportPlugin = function({ types: t }) {
  let useAsyncImport = false
	return {
		visitor: {
      Import (path) {
        if (!path.parent.type === 'CallExpression' || path.parent.arguments.length < 1) {
          return
        }
        let callee = path.node
        callee.type = 'Identifier'
        callee.name = 'asyncImport'
        if (!useAsyncImport) {
          useAsyncImport = true
        }
      },
      Program: {
        exit (path) {
          if (useAsyncImport) {
            let body = path.node.body
            body.unshift(
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('asyncImport'))],
                t.stringLiteral('async-import')
              )
            )
          }
        }
      }
    }
  };
}
var pathResolvePlugin = function (currentFilePath, _basePath) {
  return function () {
    return {
      visitor: {
        ImportDeclaration (path) {
          path.node.source.value = resolver.resolve(path.node.source.value, currentFilePath, _basePath)
        },
        // 动态import 只处理import('xxxxx')参数为String的情况
        Import (path) {
          if (!path.parent.type === 'CallExpression') {
            return
          }
          let importArg = path.parent.arguments[0]
          if (importArg && importArg.type === 'StringLiteral') {
            importArg.value = resolver.resolve(importArg.value, currentFilePath, _basePath)
          }
        }
      }
    }
  }
}
var namedModulePlugin = function (_name) {
  return function ({types}) {
    var moduleName = _name
    return {
      visitor: {
        Program: {
          exit (path) {
            let amdArgs = path.get('body')[0].get('expression').node['arguments']
            amdArgs.unshift(types.stringLiteral(moduleName))
          }
        }
      }
    }
  }
}
class AmdTemplatePlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('AmdTemplatePlugin', compilation => {
      compilation.hooks.seal.tap('AmdTemplatePlugin', _module => {
        this.render(_module)
      })
    })
  }
  render (_module) {
    let basePath = path.join((_module.resource.contextPath || '/'), 'webpack')
    let currentFilePath = _module.resource.name
    // 当前模块名 拼上/${contextPath}/webpack
    let moduleName = path.join(basePath, _module.resource.name)
    let source = _module.source
    let ast = source.content
    let result = {ast}
    
    // 处理import的路径
    result = babel.transformFromAstSync(result.ast, null, {ast: true, code: false, plugins: [pathResolvePlugin(currentFilePath, basePath)]})
    // 处理动态import
    result = babel.transformFromAstSync(result.ast, null, {ast: true, code: false, plugins: [dynamicImportPlugin]})
    // 处理为amd模块
    result = babel.transformFromAstSync(result.ast, null, {ast: true, code: false, plugins: [esm2AmdPlugin]})
    // amd命名模块
    result = babel.transformFromAstSync(result.ast, null, {ast: true, code: false, plugins: [namedModulePlugin(moduleName)]})
    // 生成code
    result = generate(result.ast, {}, null)
    source.content = result.code
    source.type = Source.TYPE.STRING
  }
}
module.exports = AmdTemplatePlugin