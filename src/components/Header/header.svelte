<script>
	import { Bell, Settings, LogIn } from 'lucide-svelte';
    import style from './style.module.scss';
	import { goto } from '$app/navigation';
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	document.addEventListener("languageChange", (event) => strings = languageStrings[localStorage.language]);
	
	const profileTypes = ['gd', 'launcher', 'jeros'];
	let sidebarProfileType = profileTypes[localStorage.profile_type];
	
	let username = localStorage.username;
	let mainIcon = localStorage.main_icon;

	document.addEventListener("profileTypeChange", () => sidebarProfileType = profileTypes[localStorage.profile_type]);
	
	document.addEventListener("accountChange", (event) => {
		username = localStorage.username;
		mainIcon = localStorage.main_icon;
	});
</script>

<div class={style.mobileSettingsHeader}>
	{#if username.length}
		<div class={style.usernameSmallDiv} on:click={() => goto("/profile-" + sidebarProfileType)}>
			<img src={mainIcon} />
			<p>{username}</p>
		</div>
		<div class={style.profileButtonsDiv}>
			<button class={style.profileButton} on:click={() => goto("/notifications")}>
				<Bell size={20} color="#FFFFFF"/>
			</button>
			<button class={style.profileButton} on:click={() => goto("/settings")}>
				<Settings size={20} color="#FFFFFF" />
			</button>
		</div>
	{:else}
		<div class={style.usernameSmallDiv} on:click={() => goto("/settings#login")}>
			<LogIn size={20} color='#FFFFFF' />
			<p>{strings.settings.loginButton}</p>
		</div>
		<div class={style.profileButtonsDiv}>
			<button class={style.profileButton} on:click={() => goto("/settings")}>
				<Settings size={20} color="#FFFFFF" />
			</button>
		</div>
	{/if}
</div>