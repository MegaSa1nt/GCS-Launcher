<script>
	import { Settings } from 'lucide-svelte';
	import style from './style.module.scss';
	import library from '../libs/library.js';
	import PlayButtonIcon from '../components/PlayButtonIcon/playButtonIcon.svelte';
	import languageStrings from '../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	import { printf } from 'fast-printf';
	
	library.checkIfPlayerIsLoggedIn();
	
	let gameName = '';
	
	library.getSettings().then(r => gameName = r.gdps_name);
	
	export let buttonState = window.playButtonState;
	export let buttonIsAvailable = window.playButtonIsAvailable;
	export let updatingAnimation = window.gameUpdatingAnimation;
	
	document.addEventListener("playButtonStateChange", function(event) {
		buttonState = window.playButtonState;
		buttonIsAvailable = window.playButtonIsAvailable;
		updatingAnimation = window.gameUpdatingAnimation;
	});
	updatePlayButtonState();
</script>

<svelte:head>
	<title>Лаунчер {gameName}</title>
	<meta name="description" content={gameName} />
</svelte:head>

<div class={style.mainPageBlock}>
	<div class={style.head}>
		<div class={style.title}>
			{gameName}
		</div>
		<div class={style.description}>
			{#if !localStorage.username.length}
				{printf(strings.mainPage, strings.guest)}
			{:else}
				{printf(strings.mainPage, localStorage.username)}
			{/if}
		</div>
	</div>

	<div class={style.launchBlock}>
		<div class={style.launchContent}>
			<div class={style.loadGame}>
				<div on:click={() => library.openOrInstallGame()} class={[style.loadButton, buttonIsAvailable].join(' ')}>
					<span id="play-button-animation" class={[style.loadAnimation, updatingAnimation].join(' ')}></span>
					<PlayButtonIcon state={buttonState} />
				</div>
				<a class={style.displayContents} href="/settings">
					<div class={style.settingsButton}>
						<Settings color='#FFFFFF' size={35} />
					</div>
				</a>
			</div>
		</div>
	</div>
</div>

<style>

</style>
