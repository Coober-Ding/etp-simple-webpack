const MultiSource = require('../core/MultiSource.js')
const Source = require('../core/Source.js')
const traverse = require('@babel/traverse').default

function getExportDefaultObjNode (ast) {
  let exportDefaultNode = null
  traverse(ast, {
    Program: {
      exit (path) {
        let bodyPath = path.get('body')
        let exportDefaultPath = bodyPath.find(_path => {
          return _path.isExportDefaultDeclaration()
        })
        if (exportDefaultPath) {
          let declarationPath = exportDefaultPath.get('declaration')
          if (declarationPath.isObjectExpression()) {
            exportDefaultNode = declarationPath.node
          } else if (declarationPath.isIdentifier()) {
            let varName = declarationPath.node.name
            let varDeclarationPath = bodyPath.find(_path => {
              return _path.isVariableDeclaration()
            })
            if (varDeclarationPath) {
              let varPath = varDeclarationPath.get('declarations').find(_path => {
                return _path.get('id').node.name == varName
              })
              if (varPath) {
                let initPath = varPath.get('init')
                if (initPath.isObjectExpression()) {
                  exportDefaultNode = initPath.node
                }
              }
            }
          }
        }
      }
    }
  })
  return exportDefaultNode
}

module.exports = function (multiSource) {
  let scriptPart = multiSource.findOnePartByScript('js')
  let templatePart = multiSource.findOnePartByScript('vue-template|js')
  if (scriptPart.type !== Source.TYPE.AST) {
    return new Error('source type invalid')
  }
  let scriptAst = scriptPart.content
  // script中的vue option
  let exportDefaultNode = getExportDefaultObjNode(scriptAst)

  if (!exportDefaultNode) {
    throw new Error('vue script part export default invalid')
  }

  // 将render函数合并到script中
  if (templatePart) {
    if (templatePart.type !== Source.TYPE.AST) {
      return new Error('source type invalid')
    }
    // 如果已经有render函数则报错
    
    if (exportDefaultNode.properties.find(prop => prop.key.name === 'render')) {
      throw new Error('vue with template already has render function')
    }
    let templateAst = templatePart.content
    let mixinProps = getExportDefaultObjNode(templateAst).properties
    Array.prototype.push.apply(exportDefaultNode.properties,mixinProps)
  }
  // 将style合并到script中
  let stylePart = multiSource.findOnePartByScript('css|js')
  if (stylePart) {
    let styleAst = stylePart.content
    Array.prototype.push.apply(scriptAst.program.body, styleAst.program.body)
  }
  scriptPart.script = 'vue|js'
  return scriptPart
}