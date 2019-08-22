const SimpleWebpack = require('./SimpleWebpack.js')
const fs = require('fs')
const path = require('path')
var file = fs.readFileSync(path.join(__dirname, '../../example/main.css'),{encoding:'utf8'})
var webpack = new SimpleWebpack()

webpack.compile({
  name: '/main/main.css',
  contextPath: '/iot',
  fileBuffer: file
}).then(compilation => {
  console.log(compilation.module.source.content)
  console.log(compilation.module.depence.join(','))
  console.log(compilation.useTime)
})
// .catch(err => {
//   console.log(err.toString())
// })