const Compiler = require('./Compiler.js')
const resolver = require('../path-resolve/index.js')
class BundleResult {
  constructor (compilations) {
    let {code, sourceMap} = this.concatCode(compilations)
    let depence = this.concatDepence(compilations)

    this.code = code
    this.sourceMap = sourceMap
    this.depence = depence
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
  concatDepence (compilations) {
    let depence = new Set()
    compilations.forEach(compilation => {
      // 把depence合并
      compilation.module.depence.forEach(dep => depence.add(dep))
    })
    return Array.from(depence)
  }
}

class Result {
  constructor (compilation) {
    this.code = compilation.module.source.content
    this.sourceMap = null
    this.depence = compilation.module.depence
  }
}

class SimpleWebpack {
  constructor () {
    const options = require('./webpack.config.js')
    this.options = options
    this.compiler = new Compiler(options)
  }
  compile (resource, compileOptions) {
    if (Array.isArray(resource)) {
      return Promise.all(resource.map(res => this._compile(res, compileOptions)))
      .then(compilations => {
        if (compileOptions.bundle && compilations.length > 1) {
          return new BundleResult(compilations)
        } else {
          return compilations.map(compilation => new Result(compilation))
        }
      })
    } else {
      return this._compile(resource, compileOptions)
      .then(compilation => {
        return new Result(compilation)
      })
    }
    
  }
  _compile (resource, compileOptions) {
    if (!resolver.isAbsolute(resource.name)) {
      return Promise.reject(new Error('invalid resource name,it must be a absolute path'))
    }
    return this.compiler.compile(resource, compileOptions)
  }
}
module.exports = SimpleWebpack