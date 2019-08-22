const Source = require('../core/Source.js')
const util = require("../core/util.js")
module.exports = function (fileBuffer) {
  let loader = util.getCurrentLoader(this)
  let script = loader.options.script
  return new Source(Source.TYPE.STRING, script, fileBuffer)
}