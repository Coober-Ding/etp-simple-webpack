class MultiSource {
  /**
   * @script 脚本:比如 vue
   * @parts Source集合
   * @origin 原始脚本内容
  */
  constructor (script, parts, origin) {
    this.script = script
    this.parts = parts || []
    this.origin = origin
  }
  /**
   * 根据script 返回第一个part
   */
  findOnePartByScript (script) {
    return this.parts.find(part => {
      return part.script == script
    })
  }
  findAllPartByScript (script) {
    return this.parts.filter(part => {
      return part.script == script
    })
  }
}
module.exports = MultiSource