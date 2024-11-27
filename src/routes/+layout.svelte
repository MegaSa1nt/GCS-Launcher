<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import SettingsSidebar from '../components/SettingsSidebar/settingsSidebar.svelte';
	import Titlebar from '../components/Titlebar/titlebar.svelte';
	import { onNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { getVersion } from '@tauri-apps/api/app';
	import library from '../libs/library.js';
	import { page } from '$app/stores';
	import { open } from '@tauri-apps/plugin-shell';
	import { exit } from '@tauri-apps/plugin-process';
	
	library.checkUpdates();
	
	setInterval(() => {
		library.checkUpdates();
	}, 1800000);

	const appWindow = getCurrentWindow();
	
	appWindow.setMaximizable(false);
	appWindow.setResizable(false);
	appWindow.setShadow(false);

	onNavigate((navigation) => {
		if(!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	document.addEventListener('keydown', event => {
		switch(event.key) {
			case 'F5':
			case 'Tab':
				event.preventDefault();
				return false;
				break;
		}
		return true;
	});
	document.addEventListener('contextmenu', event => {
		event.preventDefault();
		return false;
	});
	
	const settings = library.getSettings();
	
	fetch(settings.updates_api_url + "launcher").then(r => r.text()).then(async function(response) {
		const version = await getVersion();
		if(version != response) {
			open("updater.exe");
			exit(0);
		} else {
			appWindow.show();
		}
	}).catch(e => {
		appWindow.show();
	});
</script>

<div class="app">
	<main class={style.main}>
		<Titlebar />
		{#if !$page.url.pathname.startsWith("/settings")}
			<Sidebar />
		{:else}
			<SettingsSidebar />
		{/if}
		<div class={style.content}>
			<slot />
		</div>
	</main>
</div>