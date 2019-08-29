test("try compile", () => {
  const SimpleWebpack = require('../src/core/SimpleWebpack')
  const fs = require('fs')
  const path = require('path')
  var webpack = new SimpleWebpack()
  var file1 = fs.readFileSync(path.join(__dirname, '../example/main.css'),{encoding:'utf8'})
  var file2 = fs.readFileSync(path.join(__dirname, '../example/main.vue'),{encoding:'utf8'})
  var file3 = fs.readFileSync(path.join(__dirname, '../example/main.js'),{encoding:'utf8'})

  webpack.compile([{
    name: '/main/main.css',
    contextPath: '/iot',
    fileBuffer: file1
  },{
    name: '/main/main.vue',
    contextPath: '/iot',
    fileBuffer: file2
  },{
    name: '/main/main.js',
    contextPath: '/iot',
    fileBuffer: file3
  }]).then(result => {
    console.log(result.code)
    expect(result.depence).toContain('/main/a.js')
    expect(result.depence).toContain('/d.js')
    expect(result.depence).toContain('/b.js')
    expect(result.depence).toContain('/c.js')
    expect(result.depence).toContain('/a.js')
  })
})