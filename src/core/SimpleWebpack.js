const Compiler = require('./Compiler.js')
const resolver = require('../path-resolve/index.js')
class SimpleWebpack {
  constructor () {
    const options = require('./webpack.config.js')
    this.options = options
    this.compiler = new Compiler(options)
  }
  compile (resource) {
    if (!resolver.isAbsolute(resource.name)) {
      return Promise.reject(new Error('invalid resource name,it must be a absolute path'))
    }
    return this.compiler.compile(resource)
  }
}
module.exports = SimpleWebpack