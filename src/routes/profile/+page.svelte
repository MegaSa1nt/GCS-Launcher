<script>
	import { Download } from 'lucide-svelte';
	import style from './style.module.scss';
	import game from '$lib/images/game.png';
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="Profile" />
</svelte:head>

<div class={style.updaterBlock}>
	<div class={style.head}>
		<div class={style.button}>
			<Download size={46} color='#FFFFFF' stroke-width={4} />
		</div>

		<div class={style.textContent}>
			<div class={style.title}>
				Профиль
			</div>
			<div class={style.description}>
				Хуёфиль
			</div>
		</div>
	</div>
</div>