<script>
	import style from './style.module.scss';
	import Sidebar from '../components/Sidebar/sidebar.svelte';
</script>

<div class="app">
	<main class={style.main}>
		<Sidebar />
		<div class={style.content}>
			<slot />
		</div>
	</main>
</div>