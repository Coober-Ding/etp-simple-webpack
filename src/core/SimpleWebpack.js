const Compiler = require('./Compiler.js')
const resolver = require('../path-resolve/index.js')
class Result {
  constructor (compilations) {
    let {code, sourceMap} = this.concatCode(compilations)
    this.code = code
    this.sourceMap = sourceMap

    this.depence = new Set()
    this.useTime = 0
    compilations.forEach(compilation => {
      compilation.module.depence.forEach(dep => this.depence.add(dep))
      this.useTime = this.useTime + compilation.useTime
    })
    
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