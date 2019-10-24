const runLoaders  = require("../loader-runner/LoaderRunner.js").runLoaders
const Source = require('../loaders/core/Source.js')
const parse = require('./util.js')
const resolveDepence = require('./util.js').resolveDepence
const resolver = require('../path-resolve/index.js')
/**
 * 和webpack的NormalModule类似
 * 一个输入文件会创建一个NormalModule
 * 根据配置文件，获取自己所需的loader
 * 运行loader，获得处理后的result
 */
class NormalModule {
  constructor () {
    // 属性声明
    // 文件对象
    this.resource = null
    // parser
    this.parser = null
    // 需要用到的loaders
    this.loaders = []
    // finished
    this.finished = false
    // 文件经过loader处理后的结果，Source
    this.source = null
    // 该文件依赖的其他模块
    this.depence = []
    // ioc
    this.compiler = null
    this.compileOptions = null
    this.pathResolver = null
  }
  // 调用loader和parser获得处理后的结果
  build () {
    return this.runLoaders()
    .then((result) => {
      this.source = result
      this.resolveDepence()
      return this
    })
  }
  /** 调用loaders 得到处理后的Source对象 */
  runLoaders () {
    return new Promise((resolve, reject) => {
      const loaderContext = this.createLoaderContext()
      runLoaders(
        {
          resource: this.resource,
          loaders: this.loaders,
          context: loaderContext,
          compileOptions: this.compileOptions,
          pathResolver: this.pathResolver
        },function (err, result) {
          if (err) {
            reject(err)
          }
          resolve(result)
        })
    })
  }
  // 根据Source分析出依赖的其他模块
  resolveDepence () {
    let source = this.source
    let ast = null
    if (source.type === Source.TYPE.AST) {
      ast = source.content
    } else if (source.type === Source.TYPE.STRING) {
      ast = parse(source.content)
    } else {
      throw new Error('source[type] cant be resolved ')
    }
    this.depence = resolveDepence (ast)
    this.depence = this.depence.map(dep => resolver.resolve(dep, this.resource.name, ''))
    return
  }
  createLoaderContext () {
    return {}
  }
}
module.exports = NormalModule