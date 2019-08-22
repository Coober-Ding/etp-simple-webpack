// 根据js的AST返回其依赖的模块，分同步和异步。
// require()视作import()
const {parse} = require('@babel/parser')
const traverse = require('@babel/traverse').default
const plugins = ['dynamicImport']

var _parse = function (code, options) {
  let _options = options || {}
  let ast = parse(code,Object.assign({sourceType: 'module', plugins: plugins}, options))
  return ast
}
module.exports.parse = _parse

// 收集依赖的模块
module.exports.resolveDepence = function resolveDepence (ast) {
  let depence = []
  
  // 遍历ast树
  traverse(ast, {
    // 静态import
    ImportDeclaration (path) {
      depence.push(path.node.source.value)
    },
    // 动态import 只处理import('xxxxx')参数为String的情况
    Import (path) {
      if (!path.parent.type === 'CallExpression') {
        return
      }
      let importArg = path.parent.arguments[0]
      if (importArg && importArg.type === 'StringLiteral') {
        depence.push(importArg.value)
      }
    }
  })
  return depence
}

module.exports.traverseDepence = function traverseImportNode (ast, staticImport, dynamicImport) {
  traverse(ast, {
    // 静态
    ImportDeclaration (path) {
      staticImport(path.node)
    },
    // 动态
    Import (path) {
      if (!path.parent.type === 'CallExpression') {
        return
      }
      dynamicImport(path.parent)
    }
  })
}

