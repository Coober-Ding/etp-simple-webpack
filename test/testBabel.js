const {parse} = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator')
const plugins = ['dynamicImport']
const testCode = `
import a from 'a.js'
export default {
  data () {

  },
  fetch () {
    let b = import ('./b.js')
  },
  render: function () {

  }
}
`
let ast = parse(testCode,{sourceType: 'module', plugins: plugins})
console.log(JSON.stringify(ast))
let depence = []
traverse(ast, {
  ImportDeclaration (path) {
    depence.push(path.node.source.value)
  },
  Import (path) {
    if (!path.parent.type === 'CallExpression') {
      return
    }
    let importArg = path.parent.arguments[0]
    if (importArg.type === 'StringLiteral') {
      depence.push(importArg.value)
    }
  }
})

traverse(ast, {
  ExportDefaultDeclaration (path) {
    if (path.node.declaration.type === 'ObjectExpression') {
    }
  }
})

const testCode2 = `
var cp = {}
export default cp
`
ast = parse(testCode2,{sourceType: 'module', plugins: plugins})
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
          exportDefaultNode = path.node
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
exportDefaultNode