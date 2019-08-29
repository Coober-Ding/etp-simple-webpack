const Compiler = require('./Compiler.js')
const resolver = require('../path-resolve/index.js')
class Result {
  constructor (compilations) {
    let {code, sourceMap} = this.concatCode(compilations)
    this.code = code
    this.sourceMap = sourceMap

    this.useTime = 0
    let depence = new Set()
    compilations.forEach(compilation => {
      // 把depence合并
      compilation.module.depence.forEach(dep => depence.add(dep))
      // 把useTime相加
      this.useTime = this.useTime + compilation.useTime
    })
    this.depence = Array.from(depence)
    
  }
  concatCode (compilations) {
    let code = ''
    compilations.forEach(compilation => {
      code = code + compilation.module.source.content + '\n'
    })
    return {
      code,
      sourceMap: null
    }
  }
}
class SimpleWebpack {
  constructor () {
    const options = require('./webpack.config.js')
    this.options = options
    this.compiler = new Compiler(options)
  }
  compile (resource) {
    if (!Array.isArray(resource)) {
      resource = [resource]
    }
    return Promise.all(resource.map(res => this._compile(res)))
      .then(compilations => {
        return new Result(compilations) 
      })
    
  }
  _compile (resource) {
    if (!resolver.isAbsolute(resource.name)) {
      return Promise.reject(new Error('invalid resource name,it must be a absolute path'))
    }
    return this.compiler.compile(resource)
  }
}
module.exports = SimpleWebpack