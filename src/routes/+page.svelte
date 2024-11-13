<script>
	import { Settings, Play } from 'lucide-svelte';
	import style from './style.module.scss';
	import game from '$lib/images/game.png';
</script>

<svelte:head>
	<title>Лаунчер GreenCatsServer</title>
	<meta name="description" content="GreenCatsServer" />
</svelte:head>

<div class={style.contentBlock}>
	<div class={style.head}>
		<div class={style.title}>
			GreenCatsServer
		</div>
		<div class={style.description}>
			Привет, Sa1ntSosetHui!
		</div>
	</div>

	<div class={style.launchBlock}>
		<div class={style.launchContent}>
			<div class={style.loadGame}>
				<div class={style.loadButton}>
					<Play color='#000000' size={35} />
				</div>
				<div class={style.settingsButton}>
					<Settings color='#FFFFFF' size={35} />
				</div>
			</div>
		</div>
	</div>
</div>

<style>

</style>
