<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import Titlebar from '../components/Titlebar/titlebar.svelte';
	import { onNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import library from '../libs/library.js';
	
	library.checkUpdates();

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
	appWindow.show();
</script>

<div class="app">
	<main class={style.main}>
		<Titlebar />
		<Sidebar />
		<div class={style.content}>
			<slot />
		</div>
	</main>
</div>