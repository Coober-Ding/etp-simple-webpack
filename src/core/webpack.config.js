const babelLoader = require('../loaders/bable-loader/index.js')
const cssLoader = require('../loaders/css-loader/index.js')
const preLoader = require('../loaders/common-loader/pre-loader.js')

const vueSpliteLoader = require('../loaders/vue-loader/vue-splite-loader.js')
const vueTemplateLoader = require('../loaders/vue-loader/vue-template-loader.js')
const vueBabelLoader = require('../loaders/vue-loader/vue-babel-loader.js')
const vueComboLoader = require('../loaders/vue-loader/vue-combo-loader.js')
const vueCssLoader = require('../loaders/vue-loader/vue-css-loader.js')

const AmdTemplatePlugin = require('../plugins/amd-template-plugin.js')
const TracePlugin = require('../plugins/trace-plugin.js')

// babel
var babelConfig = {
  // es module and use strict
  sourceType: 'module',
  plugins: [
    require("@vue/babel-plugin-transform-vue-jsx"),
    require("@babel/plugin-transform-shorthand-properties"),
    require("@babel/plugin-transform-regenerator"),
    require("@babel/plugin-transform-parameters"),
    require("@babel/plugin-transform-instanceof"),
    require("@babel/plugin-transform-function-name"),
    require("@babel/plugin-transform-destructuring"),
    require("@babel/plugin-transform-typeof-symbol"),
    require("@babel/plugin-transform-template-literals"),
    require("@babel/plugin-transform-sticky-regex"),
    require("@babel/plugin-transform-computed-properties"),
    require("@babel/plugin-transform-classes"),
    require("@babel/plugin-transform-block-scoped-functions"),
    require("@babel/plugin-transform-block-scoping"),
    require("@babel/plugin-transform-arrow-functions"),
    [require("@babel/plugin-proposal-decorators"), { "legacy": true }],
    require("@babel/plugin-proposal-function-sent"),
    require("@babel/plugin-proposal-export-namespace-from"),
    require("@babel/plugin-proposal-numeric-separator"),
    require("@babel/plugin-proposal-throw-expressions"),
    require("@babel/plugin-syntax-dynamic-import"),
    require("@babel/plugin-syntax-import-meta"),
    [require("@babel/plugin-proposal-class-properties"), { "loose": false }],
    require("@babel/plugin-proposal-json-strings")
  ]
}

var config = {

  module: {
    rules: [
      {
        test: /\.m?css$/,
        use: [{
          loader: 'css-loader'
        },{
          loader: 'pre-loader',
          options: {
            script: 'css'
          }
        }]
      },
      {
        test: /\.m?js$/,
        use: [{
          loader: 'babel-loader',
          options: babelConfig
        },{
          loader: 'pre-loader',
          options: {
            script: 'js'
          }
        }]
      },
      {
        test: /\.m?vue$/,
        use: [
        {
          loader: 'vue-combo-loader'
        },
        {
          loader: 'vue-babel-loader',
          options: babelConfig
        },
        {
          loader: 'vue-css-loader'
        },
        // {
        //   loader: 'vue-sass-loader'
        // },
        {
          loader: 'vue-template-loader'
        },
        {
          loader: 'vue-splite-loader'
        }]
      }
    ]
  },
  loaders: {
    'babel-loader': babelLoader,
    'pre-loader': preLoader,
    'vue-splite-loader': vueSpliteLoader,
    'vue-template-loader': vueTemplateLoader,
    'vue-babel-loader': vueBabelLoader,
    'vue-combo-loader':vueComboLoader,
    'vue-css-loader': vueCssLoader,
    'css-loader': cssLoader
  },
  plugins: [new AmdTemplatePlugin(), new TracePlugin()]
  // devtool: 'eval-source-map'
}
module.exports = config