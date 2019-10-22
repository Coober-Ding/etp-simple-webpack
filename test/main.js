const SimpleWebpack = require('../src/core/SimpleWebpack')
  const fs = require('fs')
  const path = require('path')
  var webpack = new SimpleWebpack()
  var file1 = fs.readFileSync(path.join(__dirname, '../example/main.vue'),{encoding:'utf8'})

  webpack.compile({
    name: '/main/main.vue',
    code: file1
  },{contextPath: '/iot'}).then(result => {
    console.log(result.code)
  })