const MultiSource = require('../core/MultiSource.js')
const Source = require('../core/Source.js')
const compiler = require('vue-template-compiler/build.js')
module.exports = function VuePreLoader (fileBuffer) {
  let parts = []
  let result = compiler.parseComponent(fileBuffer);

  let scriptPart = new Source(Source.TYPE.STRING, 'js', result.script.content)
  scriptPart.origin = fileBuffer
  parts.push(scriptPart)

  if (result.template) {
    let templatePart = new Source(Source.TYPE.STRING, 'vue-template', result.template.content)
    templatePart.origin = fileBuffer
    parts.push(templatePart)
  }

  if (result.styles && result.styles.length > 0) {
    let styles = result.styles.map(style => {
      let part =  new Source(Source.TYPE.STRING, style.attrs.lang || 'css', style.content)
      part.origin = fileBuffer
      return part
    })
    Array.prototype.push.apply(parts, styles)
  }
  return new MultiSource('vue', parts, fileBuffer)
}
