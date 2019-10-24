const pathUtil = require('./path-browserify.js')
const testRelativePath = /^((\.\/)|(\.\.\/)).*/
const testAbsolutePath = /^(\/).*/
const testUrl = /^(https?|base64|ftp|file):\/\/.*/
const testDataUrl = /^data:[a-zA-Z1-9\/;]*,/

function _resolve (path, currentFilePath, contextPath) {
  let result = path
  let curPath = pathUtil.join(currentFilePath, '../')
  //如果是url，则跳过
  if (isUrl(result)) {
    return result
  }
  
  // 处理相对路径为绝对路径
  if (!isAbsolute(result)) {
    result = pathUtil.join(curPath, result)
  }
  // 处理'/'开头的绝对路径
  if (isAbsolute(result)) {
    result = pathUtil.join(contextPath, result)
  }
  return result
}
function isAbsolute (p) {
  return testAbsolutePath.test(p)
}
function isRelative (p) {
  return testRelativePath.test(p)
}
function isUrl (p) {
  return testUrl.test(p) || testDataUrl.test(p)
}
module.exports.resolve = _resolve

module.exports.isAbsolute = isAbsolute

module.exports.isRelative = isRelative

module.exports.isUrl = isUrl

module.exports.PathResolver = class {
  constructor (currentFilePath, contextPath, ingnoreExpr) {
    this.currentFilePath = currentFilePath
    this.contextPath = contextPath
    this.ingnoreExpr = ingnoreExpr && new RegExp(ingnoreExpr)
  }
  resolve (path) {
    if (this.ingnoreExpr != null && this.ingnoreExpr.test(path)) {
      return path
    }
    return _resolve(path, this.currentFilePath, this.contextPath)
  }
  resolveImport (path) {
    if (this.ingnoreExpr != null && this.ingnoreExpr.test(path)) {
      return path
    }
    return _resolve(path, this.currentFilePath, '/')
  }
  isAbsolute (p) {
    return isAbsolute(p)
  }
  isUrl (p) {
    return isUrl(p)
  }
}