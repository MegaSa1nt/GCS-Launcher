<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import SettingsSidebar from '../components/SettingsSidebar/settingsSidebar.svelte';
	import Titlebar from '../components/Titlebar/titlebar.svelte';
	import { onNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import library from '../libs/library.js';
	import { page } from '$app/stores';
	
	library.checkUpdates().then(r => {
		if(localStorage.updates_interval != 0) {
			setInterval(() => library.checkUpdates(), localStorage.updates_interval);
		}
	});

	const appWindow = getCurrentWindow();
	
	appWindow.setMaximizable(false);
	appWindow.setResizable(false);

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
	
	library.changeLauncherTheme(localStorage.theme);
	library.checkLauncherUpdates().then(r => {
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