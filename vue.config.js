const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://8.155.35.138:8080',
        changeOrigin: true,
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|jfif)$/) // 支持 .png, .jpg, .jpeg, .gif, .jfif
      .type('asset/resource') // 使用 asset/resource 而非 url-loader
      .set('generator', {
        filename: 'static/img/[name].[hash:8][ext]' // 设置图片输出路径
      })
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { progressive: true, quality: 75 },
        optipng: { enabled: false },
        pngquant: { quality: [0.8, 0.9], speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 }
      })
      .end();
    config.plugin('html').tap(args => {
      args[0].title = '元素驱动: 引领生物制造创新'
      return args
    })
  }
})
