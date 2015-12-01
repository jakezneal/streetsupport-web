var argv                = require('yargs').argv;
var path                = require('path');
var webpack             = require('webpack');
var CommonsChunkPlugin  = require(__dirname + '/../../node_modules/webpack/lib/optimize/CommonsChunkPlugin');

// Create plugins array
var plugins = [
  new CommonsChunkPlugin('commons.js')
];

// Add Uglify task to plugins array if there is a production flag
if (argv.production) {
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  entry: {
    home: __dirname + '/../../src/js/page-home',
    support: __dirname + '/../../src/js/page-find-support',
    category: __dirname + '/../../src/js/page-category-result'
  },
  output: {
    path: path.join(__dirname, '/../../_dist/assets/js/'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    publicPath: "assets/js/"
  },
  plugins: plugins,
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'standard',
        exclude: /(node_modules|bower_components)/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      }
    ],
  },
  standard: {
    parser: 'babel-eslint'
  }
};