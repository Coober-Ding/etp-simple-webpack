const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable")

/**
* 每次编译都会产生一个新的compilation对象
*/
class Compilation extends Tapable{

  constructor (compiler, resource) {
    super()

    this.hooks = {
      buildModule: new SyncHook(["module"]),
      successModule: new SyncHook(["module"]),
      seal: new SyncHook(["module"]),
    }
    this.compiler = compiler
    this.resource = resource
    this.module = null
    this.finished = false
    this.result = null
  }
  // 编译
  compile (callback) {
    this.createModule()

    this.buildModule()
    .then((result) => {
      this.hooks.successModule.call(this.module)
      callback(null, result)
    }, (err) => {
      callback(err)
    })
  }
  finish () {
    
  }
  // 密封，形成一个模块
  seal (callback) {
    let err = this.hooks.seal.call(this.module)
    callback(err)
  }
  // 创建模块
  createModule () {
    this.module = this.compiler.normalModuleFactory.createNormalModule(this)
  }
  buildModule () {
    this.hooks.buildModule.call(this.module)
    return this.module.build()
  }
}
module.exports = Compilation