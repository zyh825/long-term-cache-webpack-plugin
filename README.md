[![Build Status](https://travis-ci.org/zyh825/long-term-cache-webpack-plugin.svg?branch=master)](https://travis-ci.org/zyh825/long-term-cache-webpack-plugin)
# Webpack long term cache plugin

Install dependences, run `npm run dev` to checkout what happened in `/example`

@reference: https://webpack.github.io/docs/long-term-caching.html

## Install

`npm i --save-dev long-term-cache-webpack-plugin` or `yarn add long-term-cache-webpack-plugin`

## How  to  use

```javascript
const LongTermCachePlugin = require('long-term-cache-webpack-plugin');
module.exports = {
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[chunkhash].css',
      disable: false,
      allChunks: true,
    }),
    new LongTermCachePlugin({
      // required
      srcPath: '/src',
      // distPath is required for watch
      distPath: '/dist',
      // appHtmlSrcPath: '/src/index.html',
      // appHtmlDstPath: '/dist/index.html'
      replaceRules: [
        {
          reg: /\{ASSET_BASE_PATH\}/gi,
          substitute: '',
        },
      ]
    }),
  ],
}
```
