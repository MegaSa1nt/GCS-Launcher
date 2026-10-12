import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html'
			})
		})
	],
	clearScreen: false,
	server: {
		strictPort: true,
		host: host || false,
		port: 5173,
		hmr: host ? { protocol: "ws", host: host, port: 5173 } : undefined,
	},
	envPrefix: ['VITE_', 'TAURI_ENV_*'],
	build: {
		target:
			process.env.TAURI_ENV_PLATFORM == 'windows'
			? 'chrome105'
			: 'safari14.1',
		minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
});