const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

var config = {
  entry: {
    // a: path.resolve(__dirname, './example/a.js')
    SimpleWebpack: path.resolve(__dirname, './src/index.js')
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  resolve: {
    alias: {
      // 优化lodash被重复打包的问题
      lodash: path.resolve(__dirname, 'node_modules/lodash')
    }
  },
  node: false,
  cache: false,
  mode: 'development',
  devtool: false,
  // module: {
  //   rules: [{
  //       test: /\.js$/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           "presets": [
  //             ["@babel/preset-env", {
  //               "useBuiltIns": 'entry',
  //               "corejs": '3',
  //               "targets": {
  //                 "node": "10.10.0"
  //               }
  //             }],
  //           ]
  //         }
  //       },
  //       exclude: [
  //         path.resolve(__dirname, 'node_modules/core-js'),
  //         path.resolve(__dirname, 'node_modules/lodash'),
  //         path.resolve(__dirname, 'node_modules/debug'),
  //         path.resolve(__dirname, 'node_modules/vue-template-compiler'),
  //         path.resolve(__dirname, 'node_modules/vue-template-es2015-compiler')
  //       ]
  //     }
  //   ],
  // },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
};

module.exports = config