module.exports = {
  publicPath: './',
  css: {
    extract: false
  },
  configureWebpack: {
    entry: {
      'zipato-thermostat': './src/zipato-thermostat.js'
    },
    output: {
      filename: '[name].js'
    },
    optimization: {
      splitChunks: false
    }
  },
  productionSourceMap: false
  // runtimeCompiler: true
}
