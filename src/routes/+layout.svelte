<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let ready = false;
	
	page.subscribe(() => { 
		ready = true;
		setTimeout(() => {
			ready = !ready
		}, 750)
	});
</script>

<div class="app">
	<main class={style.main}>
		<Sidebar />
		<div class={style.content} class:anim={ready}>
			<slot />
		</div>
	</main>
</div>