const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
  },
});
