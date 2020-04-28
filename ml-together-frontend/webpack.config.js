const path = require('path');

module.exports = {
  entry: './scripts/mnist/worker/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};