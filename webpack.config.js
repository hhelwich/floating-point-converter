const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'floating-point-converter.js',
    path: path.resolve(__dirname, 'dist')
  }
};
