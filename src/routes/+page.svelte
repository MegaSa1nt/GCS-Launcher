<script>
	import { Settings } from 'lucide-svelte';
	import style from './style.module.scss';
	import library from '../libs/library.js';
	import PlayButtonIcon from '../components/PlayButtonIcon/playButtonIcon.svelte';
	import NotificationShort from "../components/NotificationShort/notificationShort.svelte";
	import languageStrings from '../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	import { printf } from 'fast-printf';
	
	let gameName = '';
	
	library.getSettings().then(r => gameName = r.gdps_name);
	
	let buttonState = window.playButtonState;
	let buttonIsAvailable = window.playButtonIsAvailable;
	let updatingAnimation = window.gameUpdatingAnimation;
	
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
</div>

<style>

</style>
