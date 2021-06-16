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
      },
      '/maps': {
        target: 'https://landmaps.nlsc.gov.tw',
        changeOrigin: true,
        pathRewrite: {
          '^/maps': ''
        },
        headers: {
          Referer: 'https://maps.nlsc.gov.tw/'
        },
        onProxyRes: function (proxyRes, req, res) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
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
