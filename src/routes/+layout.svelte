<script>
	import style from './style.module.scss';
	import Header from '../components/Header/header.svelte';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import SettingsSidebar from '../components/SettingsSidebar/settingsSidebar.svelte';
	import { onNavigate } from '$app/navigation';
	import library from '../libs/library.js';
	import { page } from '$app/stores';
	import { invoke } from '@tauri-apps/api/core';
	
	library.checkUpdates().then(r => {
		if(localStorage.updates_interval != 0) {
			setInterval(() => library.checkUpdates(), localStorage.updates_interval);
		}
	});

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
	
	//library.changeLauncherTheme(localStorage.theme);
	
	library.checkIfPlayerIsLoggedIn();
	
	library.checkLauncherUpdates().then(r => {
		console.log(r);
	});
</script>

<div class="app">
	<main class={style.main}>
		<Header />
		<div class={style.content}>
			<slot />
		</div>
		<Sidebar />
	</main>
	<style id="accent-color">
		:root {
			--system-accent-color: #ffffff;
		}
	</style>
</div>