<script>
	import { Folder, ShieldCheck, Trash2, RefreshCw, Gamepad } from 'lucide-svelte';
	import style from '../style.module.scss';
	import Select from '../../../components/Select/select.svelte';
	import library from '../../../libs/library.js';
	import languageStrings from '../../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	import { printf } from 'fast-printf';
	
	let updatesIntervals = [
		{value: 600000, label: strings.settings.intervals.every10Minutes},
		{value: 1800000, label: strings.settings.intervals.every30Minutes},
		{value: 3600000, label: strings.settings.intervals.every1Hour},
		{value: 21600000, label: strings.settings.intervals.every6Hours},
		{value: 0, label: strings.settings.intervals.onlyAtStartup}
	];
	
	let updatesIntervalsValue = updatesIntervals.find(c => c.value == localStorage.updates_interval);
	
	let isVerifyDisabled = false;
	let isUninstallDisabled = false;
	let isCheckUpdatesDisabled = false;
	
	function disableButtons() {
		switch(true) {
			case isUpdatingGame:
			case isGameStarting:
			case isGameRunning:
			case localStorage.update_time == 0:
				isVerifyDisabled = true;
				isUninstallDisabled = true;
				isCheckUpdatesDisabled = true;
				break;
			default:
				isVerifyDisabled = false;
				isUninstallDisabled = false;
				isCheckUpdatesDisabled = false;
				break;
		}
	}
	document.addEventListener("playButtonStateChange", () => disableButtons());
	disableButtons();
	
	let gameName = '';
	
	library.getSettings().then(r => {
		gameName = r.gdps_name;
	});
	
	let isCheckingUpdatesStyle = style.notSpinning;
	function checkUpdates() {
		isCheckingUpdatesStyle = style.spin;
		library.checkUpdates().then(r => isCheckingUpdatesStyle = style.notSpinning);
	}
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Settings" />
</svelte:head>

<div class={style.contentBlock}>
	<div class={style.head}>
		<div class={style.title}>
			{strings.settings.title}
		</div>
		<div class={style.description}>
			{strings.settings.game}
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.gameFolder.title}
				</h2>
				<h3>
					{strings.settings.gameFolder.description}
				</h3>
			</div>
			<button class={style.settingsButton} on:click={() => library.openGameFolder()}>
				<Folder color="#FFFFFF"/>
			</button>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.filesIntegrity.title}
				</h2>
				<h3>
					{strings.settings.filesIntegrity.description}
				</h3>
			</div>
			<button disabled={isVerifyDisabled} class={style.settingsButton} on:click={() => library.verifyGameFilesIntegrity()}>
				<ShieldCheck color="#FFFFFF"/>
			</button>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.deleteGame.title}
				</h2>
				<h3>
					{strings.settings.deleteGame.description}
				</h3>
			</div>
			<button disabled={isUninstallDisabled} class={[style.settingsButton, style.dangerButton].join(' ')} on:click={() => library.uninstallGame()}>
				<Trash2 color="#FFFFFF"/>
			</button>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.updatesInterval.title}
				</h2>
				<h3>
					{strings.settings.updatesInterval.description}
				</h3>
			</div>
			<Select
				items={updatesIntervals}
				value={updatesIntervalsValue}
				onChange={(event) => localStorage.updates_interval = event.detail.value}
			/>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.versionIcon}>
				<Gamepad size={45} />
			</div>
			<div class={style.settingDescription}>
				<h2>
					{gameName}
				</h2>
				<h3>
					{#if localStorage.update_time != 0}
						{printf(strings.settings.versions.game, library.timeConverter(localStorage.update_time, false))}
					{:else}
						{strings.settings.versions.notInstalled}
					{/if}
				</h3>
			</div>
			<button disabled={isCheckUpdatesDisabled} title={strings.settings.versions.checkUpdates} class={style.settingsButton} on:click={() => checkUpdates()}>
				<span class={isCheckingUpdatesStyle}>
					<RefreshCw color="#FFFFFF"/>
				</span>
			</button>
		</div>
	</div>
</div>