<script>
	import { AppWindow, RefreshCw, Folder, ShieldCheck, Trash2, Gamepad } from 'lucide-svelte';
	import style from './style.module.scss';
	import Toggle from "../../components/Toggle/toggle.svelte";
	import Select from '../../components/Select/select.svelte';
	import library from '../../libs/library.js';
	import { getVersion } from '@tauri-apps/api/app';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	import { printf } from 'fast-printf';
	
	let profileTypes = [
		{value: 1, label: strings.settings.profileType.firstType},
		{value: 2, label: strings.settings.profileType.secondType},
		{value: 0, label: strings.settings.profileType.thirdType}
	];
	
	let profileTypeValue = profileTypes.find(c => c.value == localStorage.profile_type);
	
	let languages = [
		{value: 'en', label: 'English'},
		{value: 'ru', label: 'Русский'},
		{value: 'fr', label: 'Français'},
		{value: 'bm', label: 'Bahasa Melayu'},
		{value: 'vi', label: 'Tiếng Việt'},
		{value: 'tt', label: 'Татарча'},
		{value: 'de', label: 'Deutsch'}
	];
	
	let languagesValue = languages.find(c => c.value == localStorage.language);
	
	let themes = [
		{value: 'main', label: strings.settings.themes.default},
		{value: 'mica', label: 'Mica'}
	];
	
	let themesValue = themes.find(c => c.value == localStorage.theme);
	
	let isNotificationsToggled = localStorage.enable_notifications == "true";
	
	let languageChangeEvent = new Event("languageChange", {bubbles: true});
	
	function changeLanguage(lang) {
		localStorage.language = lang;
		strings = languageStrings[localStorage.language];
		document.dispatchEvent(languageChangeEvent);
		profileTypes = [
			{value: 1, label: strings.settings.profileType.firstType},
			{value: 2, label: strings.settings.profileType.secondType},
			{value: 0, label: strings.settings.profileType.thirdType}
		];
		themes = [
			{value: 'main', label: strings.settings.themes.default},
			{value: 'mica', label: 'Mica'}
		];
	}
	
	let appVersion = '2.0.0';
	
	getVersion().then(r => {
		appVersion = r;
	});
	
	let isCheckingLauncherUpdate = style.notSpinning;
	function checkLauncherUpdates() {
		isCheckingLauncherUpdate = style.spin;
		library.checkLauncherUpdates().then(r => isCheckingLauncherUpdate = style.notSpinning);
	}
	
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
			{strings.settings.launcher}
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.notifications.title}
				</h2>
				<h3>
					{strings.settings.notifications.description}
				</h3>
			</div>
			<Toggle bind:toggled={isNotificationsToggled} on:toggle={(e) => localStorage.enable_notifications = e.detail} />
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.profileType.title}
				</h2>
				<h3>
					{strings.settings.profileType.description}
				</h3>
			</div>
			<Select
				items={profileTypes}
				value={profileTypeValue}
				onChange={(event) => localStorage.profile_type = event.detail.value}
			/>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.language.title}
				</h2>
				<h3>
					{strings.settings.language.description}
				</h3>
			</div>
			<Select
				items={languages}
				value={languagesValue}
				onChange={(event) => {
					changeLanguage(event.detail.value);
				}}
			/>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.themes.title}
				</h2>
				<h3>
					{strings.settings.themes.description}
				</h3>
			</div>
			<Select
				items={themes}
				value={themesValue}
				onChange={(event) => {
					localStorage.theme = event.detail.value;
					library.changeLauncherTheme(event.detail.value);
				}}
			/>
		</div>
		
		<hr class={style.settingsHR}>
		
		<div class={style.settingDiv}>
			<div class={style.versionIcon}>
				<AppWindow size={45} />
			</div>
			<div class={style.settingDescription}>
				<h2>
					{strings.settings.launcher}
				</h2>
				<h3>
					{printf(strings.settings.versions.launcher, appVersion)}
				</h3>
			</div>
			<button title={strings.settings.versions.checkUpdates} class={style.settingsButton} on:click={() => checkLauncherUpdates()}>
				<span class={isCheckingLauncherUpdate}>
					<RefreshCw color="#FFFFFF"/>
				</span>
			</button>
		</div>
	</div>
	
	<div class={style.head}>
		<div class={style.description}>
			{strings.settings.game}
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
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
	
	<div class={style.head}>
		<div class={style.description}>
			{strings.settings.game}
		</div>
	</div>
	
	
</div>