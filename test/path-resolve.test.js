const {resolve} = require('../src/path-resolve/index.js')

const currentFilePath = '/test/path-resolve.js'
const basePath = '/webpack'
test('add base path', () => {
  let p = '/a.js'
  p = resolve(p, currentFilePath, basePath)
  expect(p).toBe('/webpack/a.js')
})
test('relative path', () => {
  let p = './a.js'
  p = resolve(p, currentFilePath, basePath)
  expect(p).toBe('/webpack/test/a.js')
})
test('bad relative path', () => {
  
})