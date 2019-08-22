module.exports = {
  getCurrentLoader(loaderContext) {
    return loaderContext.loaderExecuters[loaderContext.loaderIndex]
  }
}