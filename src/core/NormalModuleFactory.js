const NormalModule = require('./NormalModule.js')
const RuleSet = require("webpack/lib/RuleSet")
class Loader {
  constructor (name, _module, options) {
    this.name = name,
    this.module = _module,
    this.options = options
  }
}

class NormalModuleFactory {
  constructor (compiler) {
    this.compiler = compiler
    this.ruleSet = new RuleSet(compiler.options.module);
  }
  createNormalModule (compilation) {
    let normalModule = new NormalModule()
    normalModule.resource = compilation.resource
    normalModule.compiler = this.compiler
    normalModule.loaders = this.resolveLoader(compilation.resource)
    normalModule.compileOptions = compilation.compileOptions
    return normalModule
  }

  // 装载当前resource需要的loaders
  resolveLoader (resource) {
    // 根据module的rule配置 获取loader
    const result = this.ruleSet.exec({
      resource: resource.name,
      realResource: resource.name,
      resourceQuery: ""
    });
    const settings = {};
    const useLoadersPost = [];
    const useLoaders = [];
    const useLoadersPre = [];
    for (const r of result) {
      if (r.type === "use") {
        if (r.enforce === "post") {
          useLoadersPost.push(r.value);
        } else if (r.enforce === "pre") {
          useLoadersPre.push(r.value);
        } else if (!r.enforce) {
          useLoaders.push(r.value);
        }
      } else if (
        typeof r.value === "object" &&
        r.value !== null &&
        typeof settings[r.type] === "object" &&
        settings[r.type] !== null
      ) {
        settings[r.type] = cachedCleverMerge(settings[r.type], r.value);
      } else {
        settings[r.type] = r.value;
      }
    }
    let loaders = [].concat(useLoadersPost, useLoaders, useLoadersPre).map(item => {
      let loaderModule = this.compiler.loaders[item.loader]
      let loader = new Loader(item.loader, loaderModule, item.options)
      return loader
    })
    return loaders
  }
}
module.exports = NormalModuleFactory