const MultiSource = require('../core/MultiSource.js')
const Source = require('../core/Source.js')
const traverse = require('@babel/traverse').default
const template = require("babel-template")

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
          exportDefaultNode =  declarationPath.node
        }
      }
    }
  })
  return exportDefaultNode
}
function getDeclaraObjNodeByName(ast, name) {
  let ret = null
  traverse(ast, {
    Program: {
      exit (path) {
        let bodyPath = path.get('body')
        bodyPath.filter(p => p.isVariableDeclaration()).forEach(_path => {
          _path.get('declarations').forEach(p => {
            if (p.get('id').get('name').node == name) {
              ret = p.get('init').node
            }
          })
        })
      }
    }
  })
  return ret
}
function replaceExportDefaultNode (ast, node) {
  traverse(ast, {
    Program: {
      exit (path) {
        let bodyPath = path.get('body')
        let exportDefaultPath = bodyPath.find(_path => {
          return _path.isExportDefaultDeclaration()
        })
        if (exportDefaultPath) {
          exportDefaultPath.node.declaration = node
        }
      }
    }
  })
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
    
    // if (exportDefaultNode.properties.find(prop => prop.key.name === 'render')) {
    //   throw new Error('vue with template already has render function')
    // }

    let templateAst = templatePart.content
    let mixinObjNode = getDeclaraObjNodeByName(templateAst, 'templateMixin')
    // Array.prototype.push.apply(exportDefaultNode.properties,mixinProps)

    replaceExportDefaultNode(scriptAst, template('Object.assign(TARGET, SOURCE)')({
      TARGET: exportDefaultNode,
      SOURCE: mixinObjNode
    }).expression)
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