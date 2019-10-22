// 将url加上contextPath
const valueParser = require('postcss-value-parser');
const postcss = require('postcss')
const pathResolver = require('../../path-resolve/index.js')

const isUrlFunc = /url/i;
const isImageSetFunc = /^(?:-webkit-)?image-set$/i;
const needParseDecl = /(?:url|(?:-webkit-)?image-set)\(/i;
module.exports = postcss.plugin('url-plugin', (options = {}) => function process(css, result) {
  let contextPath = options.contextPath
  let currentFilePath = options.currentFilePath
  css.walkDecls((decl) => {
    if (!needParseDecl.test(decl.value)) {
      return;
    }
    // 解析并浏览valueExpr
    const parsed = valueParser(decl.value);
    parsed.walk((node) => {
      if (node.type !== 'function') {
        return;
      }
      // 处理url(...)
      if (isUrlFunc.test(node.value)) {
        resolveUrlFuncNode(node, currentFilePath, contextPath)
        // Do not traverse inside `url`
        // eslint-disable-next-line consistent-return
        return false;
      }
      // 处理imageSet(...)
      if (isImageSetFunc.test(node.value)) {
        node.nodes.forEach((nNode) => {
          if (nNode.type === 'function' && isUrlFunc.test(nNode.value)) {
            resolveUrlFuncNode(nNode, currentFilePath, contextPath)
          }
          if (nNode.type === 'string') {
            resolveUrlStrNode(nNode, currentFilePath, contextPath)
          }
        });
        // Do not traverse inside `url`
        // eslint-disable-next-line consistent-return
        return false;
      }
    })
    // 使用修改后的结果
    decl.value = parsed.toString()
  });
})

function resolveUrlFuncNode (node, currentFilePath, contextPath) {
  // url('xxxxx/xxx/xx.png')
  if (node.nodes.length !== 0 && node.nodes[0].type === 'string') {
    node.nodes[0].value = pathResolver.resolve(node.nodes[0].value, currentFilePath, contextPath)
  }
  // url(xxxxx/xxx/xx.png)
  if (node.nodes.length !== 0 && node.nodes[0].type === 'word') {
    node.nodes[0].value = pathResolver.resolve(node.nodes[0].value, currentFilePath, contextPath)
  }
}

function resolveUrlStrNode (node, currentFilePath, contextPath) {
  node.value = pathResolver.resolve(node.value, currentFilePath, contextPath)
}