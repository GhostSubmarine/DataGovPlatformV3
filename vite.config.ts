import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import pkg from './package.json' assert { type: 'json' };
const timestamp = new Date().getTime();
// 参考：https://cn.vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: Object.keys(pkg.dependencies),
				},
				chunkFileNames: ({ name }) => {
					if (name === 'vendor') {
						return `assets/js/[name]-[hash].js`; // 第三方库不添加时间戳
					} else {
						return `assets/js/[name]-[hash]-${timestamp}.js`; // 自定义文件名，使用时间戳保证唯一性
					}
				},
				entryFileNames: ({ name }) => {
					if (name === 'vendor') {
						return `assets/js/[name]-[hash].js`; // 第三方库不添加时间戳
					} else {
						return `assets/js/[name]-[hash]-${timestamp}.js`; // 自定义文件名，使用时间戳保证唯一性
					}
				},
				assetFileNames: `assets/[ext]/[name]-[hash].[ext]` // 资源文件添加时间戳
			},
		}
	},
	base: './',
	resolve: {
		// 配置别名
		alias: {
			'@': resolve(__dirname, './src'),
			'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
		}
	},
	plugins: [
		vue(),
		vueSetupExtend(),
		createSvgIconsPlugin({
			iconDirs: [resolve(__dirname, 'src/icons/svg')],
			symbolId: 'icon-[dir]-[name]'
		})
	],
	server: {
		proxy: {
      '/api': {
        target: 'http://203.83.234.27:8082/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
		host: '0.0.0.0',
		port: 3000, // 端口号
		open: false // 是否自动打开浏览器
	},
	optimizeDeps: {
		include: [
			`monaco-editor/esm/vs/language/json/json.worker`,
			`monaco-editor/esm/vs/language/css/css.worker`,
			`monaco-editor/esm/vs/language/html/html.worker`,
			`monaco-editor/esm/vs/language/typescript/ts.worker`,
			`monaco-editor/esm/vs/editor/editor.worker`
		],
	}
})
