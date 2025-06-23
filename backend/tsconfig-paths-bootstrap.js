const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

// This is needed for when the app is built and run in production with "node dist/server.js"
const baseUrl = './dist'; // This should point to the output directory
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: Object.fromEntries(
    Object.entries(tsConfig.compilerOptions.paths).map(
      ([alias, paths]) => [alias, paths.map(p => p.replace(/^src\//, ''))]
    )
  ),
});

// If you want to clean up when the module is unloaded (useful for tests)
module.exports = cleanup;
