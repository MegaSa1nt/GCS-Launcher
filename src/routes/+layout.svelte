<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import Titlebar from '../components/Titlebar/titlebar.svelte';
	import { onNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';

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