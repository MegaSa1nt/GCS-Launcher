import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [
		sveltekit()
	],
	clearScreen: false,
	server: {
		strictPort: true,
		host: host || false,
		port: 5173,
	},
	envPrefix: ['VITE_', 'TAURI_ENV_*'],
	build: {
		target:
			process.env.TAURI_ENV_PLATFORM == 'windows'
			? 'chrome105'
			: 'safari13',
		minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
});