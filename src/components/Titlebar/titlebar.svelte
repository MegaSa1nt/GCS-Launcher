<script lang="ts">
    import { onMount } from 'svelte';
	import { Minus, X } from 'lucide-svelte';
    import style from './style.module.scss';
    import { page } from '$app/stores';
	import { getCurrentWindow } from '@tauri-apps/api/window';

	const appWindow = getCurrentWindow();

	function minimizeLauncher() {
		appWindow.minimize();
	}
	
	function closeLauncher() {
		appWindow.close();
	}
</script>

<div data-tauri-drag-region class={style.titlebar}>
	<button class={[style.titleButton, style.titleButtonMinimize].join(" ")} on:click={() => {minimizeLauncher()}}>
		<Minus color='#FFFFFF' size={17} alt="Свернуть" />
	</button>
	<button class={[style.titleButton, style.titleButtonClose].join(" ")} on:click={() => {closeLauncher()}}>
		<X color='#FFFFFF' size={17} alt="Закрыть" />
	</button>
</div>