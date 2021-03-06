const path = require('path')
const webpack = require('webpack')
const domprops = require('uglify-js/tools/domprops')

const DEV = process.env.DEV_ENV === 'true'

module.exports = {
  entry: './src/index.js',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['env']
        }
      }
    ]
  },
  plugins: DEV ? [] : [
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        props: {
          reserved: domprops.props
        }
      }
    })
  ]
}
