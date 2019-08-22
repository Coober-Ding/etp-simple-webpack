
class Source{
  /**
   * @script 脚本:css,js,sass, html, json, vue-template等
   * @content 内容
  */
  constructor (type, script, content) {
    this.type = type
    this.script = script
    this.content = content
    // 原始
    this.origin = content
    // source map
    this.sourceMap = null
  }
}
Source.TYPE = {}
Source.TYPE.AST = 'ast'
Source.TYPE.BUFFER = 'buffer'
Source.TYPE.STRING = 'string'
module.exports = Source