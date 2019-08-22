class TracePlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('TracePlugin', compilation => {
      compilation.startTime = Date.now()
    })
    compiler.hooks.successCompile.tap('TracePlugin', compilation => {
      compilation.endTime = Date.now()
      compilation.useTime = compilation.endTime - compilation.startTime
    })
  }
}
module.exports = TracePlugin