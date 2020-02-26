const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, options) => {
	
	const isProduction = options && options.mode == 'production';
	const writeSourceMaps = !isProduction || process.argv.indexOf("--source-maps") > -1;
	const analyze = process.argv.indexOf("--analyze") > -1;
	
	return {
		entry: {
			main: './mgreel.js'
		},
		devtool: writeSourceMaps ? "source-map" : false,
		plugins: [
			new LiveReloadPlugin(),
			new WebpackBuildNotifierPlugin({ suppressSuccess: true }),
			analyze ? new BundleAnalyzerPlugin({ analyzerMode: 'static' }) : null
		].filter(p => p != null),
		module: {
			rules: [
				{ 
					test: /\.js$/, 
					resolve: { extensions: [".js"] },
					exclude: [/node_modules/],
					loader: 'babel-loader'
				}
			]
		},
		output: {
			path: path.resolve(__dirname),
			filename: 'build.js'
		}
	};
	
};