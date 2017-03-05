const path = require('path');
const LongTermCachingPlugin = require('./lib/index');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  srcPath: path.resolve(__dirname, './example/src'),
  distPath: path.resolve(__dirname, './example/dist'),
};

module.exports = {
  devServer: {
    contentBase: config.distPath,
    compress: true,
    port: 9000
  },
  devtool: "cheap-module-source-map",
  entry: path.resolve(config.srcPath, 'main.js'),
  output: {
    path: config.distPath,
    filename: 'assets/[name].[chunkhash].bundle.js',
    chunkFilename: 'assets/[name].[chunkhash].bundle.js',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[chunkhash].css',
      disable: false,
      allChunks: true,
    }),
    new LongTermCachingPlugin({
      srcPath: config.srcPath,
      distPath: config.distPath,
      replaceRules: [
        {
          reg: /\{ASSET_BASE_PATH\}/gi,
          substitute: '',
        },
      ]
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true,
              }
            },
          ]
        })
      }
    ]
  },
}
