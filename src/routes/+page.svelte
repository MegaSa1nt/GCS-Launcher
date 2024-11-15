<script>
	import { Settings, Play } from 'lucide-svelte';
	import style from './style.module.scss';
	import library from '../libs/library.js';
	import PlayButtonIcon from '../components/PlayButtonIcon/playButtonIcon.svelte';
	
	export let buttonState = window.playButtonState;
	
	document.addEventListener("playButtonStateChange", function(event) {
		buttonState = updatePlayButtonState();
	});
	updatePlayButtonState();
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
				<div on:click={() => library.openOrInstallGame()} class={[style.loadButton, playButtonIsAvailable].join(' ')}>
					<span id="play-button-animation" class={[style.loadAnimation, gameUpdatingAnimation].join(' ')}></span>
					<PlayButtonIcon state={buttonState} />
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
