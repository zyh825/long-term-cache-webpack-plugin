const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const log = console.log;

/**
 * webpack LongTermCaching Plugin
 * @reference: https://webpack.github.io/docs/long-term-caching.html
 * @param replaceRules
 * @param distPath
 * @param appHtmlSrcPath
 * @param srcPath
 * @param appHtmlDstPath
 * @constructor
 */
function LongTermCachePlugin({ replaceRules, appHtmlSrcPath, appHtmlDstPath, srcPath, distPath }) {
  this.options = {
    replaceRules: replaceRules || [],
    srcPath,
    distPath,
    appHtmlSrcPath: appHtmlSrcPath || path.resolve(srcPath, 'index.html'),
    appHtmlDstPath: appHtmlDstPath || path.resolve(distPath, 'index.html'),
  };
}

// get chunk assets, type is supported.
function getChunkAssetPath(assetsByChunkName, chunkName) {
  const [name, type] = chunkName.split('.');
  if (assetsByChunkName && assetsByChunkName[name]) {
    if (typeof assetsByChunkName[name] === 'string') {
      return assetsByChunkName[name];
    }
    if (Array.isArray(assetsByChunkName[name])) {
      if (type === 'css') {
        return assetsByChunkName[name].find(item => /.css$/.test(item));
      }
      return assetsByChunkName[name].find(item => /.js$/.test(item));
    }
  }
  return null;
}

// get the existing bundle assets stats info if exists, otherwise null is returned
function getExistingAssetStats() {
  try {
    const statsFileContent = fs.readFileSync(
      path.join(__dirname, 'webpack-assets-stats.json'),
      { encoding: 'utf8' }
    );
    return JSON.parse(statsFileContent);
  } catch (e) {
    log(chalk.red('#error: %s', e.message));
  }
  return null;
}


// remove the previous chunk files
function removePreviousChunks(existingBundles, stats, distPath) {
  if (!existingBundles.assets) return;
  const previousChunks = existingBundles.assets.map(asset => asset.name);
  const currentChunks = stats.assets.map(asset => asset.name);
  previousChunks.forEach(chunk => {
    if (currentChunks.indexOf(chunk) >= 0) return;
    // delete the previous asset file.
    // no need to specific map file
    try {
      fs.unlinkSync(path.join(distPath, chunk));
    } catch (e) {
      log(chalk.red('#error: %s', e.message));
    }
  });
}

LongTermCachePlugin.prototype = {
  constructor: LongTermCachePlugin,
  apply: function (compiler) {
    compiler.plugin('done', stats => {
      // get options
      const { replaceRules, distPath, appHtmlSrcPath, appHtmlDstPath } = this.options;
      // get stats
      stats = stats.toJson();

      let existingBundles = getExistingAssetStats() || {};

      let contents = fs.readFileSync(appHtmlSrcPath, { encoding: 'utf8' });

      // default replace rule, {assets/xxx} => chunck file name
      contents = contents
        .replace(/\{assets\/(.+)\}/gi, (m, chunkName) =>
          getChunkAssetPath(stats.assetsByChunkName, chunkName) || m
        );

      // custom replace rules
      replaceRules.forEach(rule => contents = contents.replace(rule.reg, rule.substitute));

      removePreviousChunks(existingBundles, stats, distPath);

      // update dist html
      fs.writeFileSync(appHtmlDstPath, contents, { encoding: 'utf8' });

      // update the assets stats.
      fs.writeFileSync(path.join(__dirname, 'webpack-assets-stats.json'), JSON.stringify(stats, null, 2), {
        encoding: 'utf8'
      });

      // finish log
      log(chalk.green('#post-process: webpack assets stats updated at', new Date()));
    });
  }
};

module.exports = LongTermCachePlugin;