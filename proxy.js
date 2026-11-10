const express = require('express');
const createProxyMiddleware = require('http-proxy-middleware');

const app = express();

app.use('/maps', createProxyMiddleware({
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
}));

app.listen(8888);
