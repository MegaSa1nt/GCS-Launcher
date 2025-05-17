<script>
	import style from './style.module.scss';
	import Header from '../components/Header/header.svelte';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import Toast from '../components/Toast/toast.svelte';
	import Progress from '../components/Progress/progress.svelte';
	import { join } from '@tauri-apps/api/path';
	import { remove } from '@tauri-apps/plugin-fs';
	import { invoke } from '@tauri-apps/api/core';
	import { onNavigate } from '$app/navigation';
	import library from '../libs/library.js';
	import { page } from '$app/stores';

	invoke("plugin:gcs|openInstallSettings");

	onNavigate((navigation) => {
		if(!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	
	document.addEventListener('contextmenu', event => {
		event.preventDefault();
		return false;
	});
	
	library.checkIfPlayerIsLoggedIn();
	
	library.checkLauncherUpdates().then(r => {
		if(!r) return library.updateLauncher();

		library.getSettings().then(async (settings) => {
			const launcherPath = await join(settings.resource_path, "/launcher.apk")
			await remove(launcherPath).catch(err => console.log("Launcher APK was not found. Nothing to delete!"));
		});
		
		library.checkUpdates().then(r => {
			if(localStorage.updates_interval != 0) {
				setInterval(() => library.checkUpdates(), localStorage.updates_interval);
			}
		});
	});
</script>

<div class="app">
	<main class={style.main}>
		<Toast />
		<Header />
		<div class="content">
			<slot />
		</div>
		<Sidebar />
		<Progress />
	</main>
	<style id="accent-color">
		:root {
			--system-accent-color: #ffffff;
		}
	</style>
</div>