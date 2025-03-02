<script>
	import { AppWindow, RefreshCw, Folder, ShieldCheck, Trash2, Gamepad, LogOut, LogIn, UserRound, KeyRound, LoaderCircle, CircleX } from 'lucide-svelte';
	import style from './style.module.scss';
	import Toggle from "../../components/Toggle/toggle.svelte";
	import Select from '../../components/Select/select.svelte';
	import library from '../../libs/library.js';
	import { getVersion } from '@tauri-apps/api/app';
	import { goto } from '$app/navigation';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	import { printf } from 'fast-printf';
	
	let profileTypeChangeEvent = new Event("profileTypeChange", {bubbles: true});
	
	let profileTypes = [
		{value: 1, label: strings.settings.profileType.firstType},
		{value: 2, label: strings.settings.profileType.secondType}
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
	
	let isNotificationsToggled = localStorage.enable_notifications == "true";
	
	let languageChangeEvent = new Event("languageChange", {bubbles: true});
	
	function changeLanguage(lang) {
		localStorage.language = lang;
		strings = languageStrings[localStorage.language];
		document.dispatchEvent(languageChangeEvent);
		profileTypes = [
			{value: 1, label: strings.settings.profileType.firstType},
			{value: 2, label: strings.settings.profileType.secondType}
		];
		updatesIntervals = [
			{value: 600000, label: strings.settings.intervals.every10Minutes},
			{value: 1800000, label: strings.settings.intervals.every30Minutes},
			{value: 3600000, label: strings.settings.intervals.every1Hour},
			{value: 21600000, label: strings.settings.intervals.every6Hours},
			{value: 0, label: strings.settings.intervals.onlyAtStartup}
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
	
	function logout() {
		library.logout();
		goto("/");
	}
	
	let isLogging = isLoggingIn;
	let isLoginErrored = false;
	let errorText = '';
	
	let accountChangeEvent = new Event("accountChange", {bubbles: true});
	
	function loginToAccount() {
		if(isLogging) return;
		library.getSettings().then(settings => {
			const formItems = new FormData(document.getElementsByName("loginForm")[0]);
			const username = encodeURIComponent(formItems.get("username"));
			const password = encodeURIComponent(formItems.get("password"));
			if(!username.length || !password.length) return;
			isLoggingIn = isLogging = true;
			fetch(settings.dashboard_api_url + "login.php", {
				method: "POST",
				body: "userName=" + username + "&password=" + password,
				headers: {
					"Content-type": "application/x-www-form-urlencoded"
				}
			}).then(r => r.json()).then(response => {
				isLoggingIn = isLogging = false;
				if(response.success) {
					localStorage.username = response.user;
					localStorage.auth = response.auth;
					localStorage.color = response.color;
					localStorage.accountID = response.accountID;
					localStorage.main_icon = response.mainIcon;
					localStorage.clan_name = response.clan.name;
					localStorage.clan_color = response.clan.color;
					document.dispatchEvent(accountChangeEvent);
					library.getNotifications();
					isLoggingIn = isLogging = false;
					goto("/");
				} else {
					isLoggingIn = isLogging = false;
					library.logout();
					isLoginErrored = true;
					switch(response.error) {
						case '-1':
							errorText = strings.settings.error.wrongLoginOrPassword;
							break;
						case '-2':
							errorText = strings.settings.error.activateAccount;
							break;
						default:
							errorText = strings.settings.error.unexpectedError;
							break;
					}
				}
			}).catch(e => {
				isLoggingIn = isLogging = true;
				library.logout();
				isLoginErrored = true;
				errorText = strings.settings.error.unexpectedError;
			});
		});
	}
	
	function random(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
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
				onChange={(event) => {
					localStorage.profile_type = event.detail.selected.value;
					document.dispatchEvent(profileTypeChangeEvent);
				}}
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
					changeLanguage(event.detail.selected.value);
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
				onChange={(event) => localStorage.updates_interval = event.detail.selected.value}
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
		<div class={style.description} id="login">
			{strings.settings.account}
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
		<div class={style.settingDiv}>
			{#if localStorage.username.length}
				<div class={style.usernameDiv}>
					<div class={style.mainIcon}>
						<img src={localStorage.main_icon} />
					</div>
					<div class={style.mainUsername}>
						<h1 style={['color: rgb(', localStorage.color, ')'].join('')}>{localStorage.username}</h1>
						{#if localStorage.clan_name.length}
							<h2 style={['color: #', localStorage.clan_color].join('')}>{localStorage.clan_name}</h2>
						{/if}
					</div>
				</div>
				<button class={style.loginButton} on:click={() => logout()}>
					<LogOut color="#FFFFFF" size={20} strokeWidth={3} />
					{strings.settings.logout.button}
				</button>
			{:else}
				<div class={style.loginDiv}>
					<form name="loginForm" autocomplete="off">
						<div class={style.inputDiv}>
							<h2>
								<UserRound size={20} strokeWidth={2.5} />{strings.settings.username}
							</h2>
							{#if random(0, 1000) == 1}
								<input class={style.inputStyle} type="text" name="username" placeholder="M336" />
							{:else}
								<input class={style.inputStyle} type="text" name="username" placeholder="YourVeryPrettyUsername" />
							{/if}
						</div>
						
						<div class={style.inputDiv}>
							<h2>
								<KeyRound size={20} strokeWidth={2.5} />{strings.settings.password}
							</h2>
							<input class={style.inputStyle} type="password" name="password" placeholder="••••••••••••" />
						</div>
						
						{#if isLoginErrored}
							<h1 class={style.error}>
								<CircleX size={20} strokeWidth={2.5} />
								{errorText}
							</h1>
						{/if}
						
						<button class={style.loginButton} on:click={() => loginToAccount()}>
							{#if !isLogging}
								<LogIn color="#FFFFFF" size={20} strokeWidth={3} />
							{:else}
								<span class={style.spin}>
									<LoaderCircle color="#FFFFFF" size={20} strokeWidth={3} />
								</span>
							{/if}
							{strings.settings.loginButton}
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>