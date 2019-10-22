const {uniqWith} = require('./util.js')
function genImportCode (importItems) {
  // 去重
  const paths = uniqWith(
    importItems,
    (value, other) => value.url === other.url && value.media === other.media
  )
  return paths.map(path => `import "${path.url}"`).join('\n')
}

module.exports.genRuntimeCode = function (css, importItems) {
  let text = JSON.stringify(css)
  const runTimeCode = `mountCss(${text});`
  if (importItems && importItems.length > 0) {
    return genImportCode(importItems) + '\n' + runTimeCode
  } else {
    return runTimeCode
  }
}

