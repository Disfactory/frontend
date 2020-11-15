module.exports = {
  lintOnSave: false,
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/server': {
        target: 'https://staging.disfactory.tw',
        changeOrigin: true,
        pathRewrite: {
          '^/server': ''
        }
      }
    },
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  pwa: {
    name: '農地違章工廠',
    themeColor: '#697F01',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.plugins.delete('preload')
    }
  }
}
