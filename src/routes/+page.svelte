<script>
	import { Settings } from 'lucide-svelte';
	import style from './style.module.scss';
	import game from '$lib/images/game.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class={style.contentBlock}>
	<div class={style.head}>
		<div class={style.title}>
			EronDonDonServer
		</div>
		<div class={style.description}>
			Привет, сосунок!
		</div>
	</div>

	<div class={style.launchBlock}>
		<div class={style.launchContent}>
			<img src={game} alt="ИГРУЛЕЧКА" class={style.gamePicture}>
			<div class={style.loadGame}>
				<div class={style.loadButton}>
					Играть
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
