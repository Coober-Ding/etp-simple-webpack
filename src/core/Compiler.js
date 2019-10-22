const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable")
const NormalModuleFactory = require('./NormalModuleFactory.js')
const Compilation = require('./Compilation.js')

// 可充当一个ioc容器，里面有常用的bean
class Compiler extends Tapable {
  constructor (options) {
    super()
    this.hooks = {
      /** @type {AsyncSeriesHook<Compiler>} */
			beforeRun: new AsyncSeriesHook(["compiler"]),
			/** @type {AsyncSeriesHook<Compiler>} */
			run: new AsyncSeriesHook(["compiler"]),
      /** @type {AsyncSeriesHook<CompilationParams>} */
			beforeCompile: new AsyncSeriesHook(["params"]),
			/** @type {SyncHook<CompilationParams>} */
			compile: new SyncHook(["params"]),
			/** @type {AsyncParallelHook<Compilation>} */
			compilation: new SyncHook(["compilation"]),
			/** @type {AsyncSeriesHook<Compilation>} */
      afterCompile: new AsyncSeriesHook(["compilation"]),
      successCompile: new SyncHook(["compilation"])
    }
    this.options = options
    // bean
    this.normalModuleFactory = new NormalModuleFactory(this)

    this.loaders = options.loaders

    this.plugins = options.plugins

    this.applyPlugins()
  }
  // 把插件装上
  applyPlugins () {
    this.plugins.forEach(plugin => {
      plugin.apply(this)
    })
  }
  createCompilation (resource, compileOptions) {
    let compilation = new Compilation(this, resource, compileOptions)
    this.hooks.compilation.call(compilation)
    return compilation
  }
  compile (resource, compileOptions) {
    return new Promise((resolve, reject) => {
      let finalCallback = (err, compilation) => {
        if (err) {
          reject(err)
        } else {
          this.hooks.successCompile.call(compilation)
          resolve(compilation)
        }
      }
      this.hooks.beforeRun.callAsync(this, err => {
        if (err) return finalCallback(err);
  
        this.hooks.run.callAsync(this, err => {
          if (err) return finalCallback(err);

          this.hooks.beforeCompile.callAsync(resource, err => {
            if (err) return finalCallback(err);
      
            this.hooks.compile.call(resource);
            // 创建compilation
            const compilation = this.createCompilation(resource, compileOptions);
            // compilation接管编译流程
            compilation.compile(err => {
              if (err) return finalCallback(err);
      
              compilation.finish();
      
              compilation.seal(err => {
                if (err) return finalCallback(err);
                // 回到compiler
                this.hooks.afterCompile.callAsync(compilation, err => {
                  if (err) return finalCallback(err);

                  return finalCallback(null, compilation);
                });
              });
            });
          });
        });
      });
    })
  }
}
module.exports = Compiler