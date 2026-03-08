const {
	defineConfig
} = require('@vue/cli-service')
module.exports = defineConfig({
	transpileDependencies: true,
	lintOnSave: false,
	devServer: {
		proxy: {
			'/api': {
				target: 'http://101.200.45.52:8080',
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
				mozjpeg: {
					progressive: true,
					quality: 75
				},
				optipng: {
					enabled: false
				},
				pngquant: {
					quality: [0.8, 0.9],
					speed: 4
				},
				gifsicle: {
					interlaced: false
				},
				webp: {
					quality: 75
				}
			})
			.end();
		config.module
			.rule('videos')
			.test(/\.(mp4|webm|ogg|mov|avi|flv|wmv|mkv)$/i) // 添加所有常见视频格式
			.use('file-loader')
			.loader('file-loader')
			.options({
				name: 'static/video/[name].[hash:8].[ext]', // 保持与图片不同的目录结构
				esModule: false // 解决 Vue 模板中 require 的问题
			});
		config.plugin('html').tap(args => {
			args[0].title = '元素驱动: 引领生物制造创新'
			return args
		})
	}
})