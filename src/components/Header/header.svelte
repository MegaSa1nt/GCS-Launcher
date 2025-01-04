<script>
    import style from './style.module.scss';
	import { Bell, Settings } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	const profileTypes = ['gd', 'launcher', 'jeros'];
	let sidebarProfileType = profileTypes[localStorage.profile_type];
	
	let username = localStorage.username;
	let mainIcon = localStorage.main_icon;
</script>

<div class={style.mobileSettingsHeader}>
	{#if localStorage.username.length}
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
		<div class={style.usernameSmallDiv} on:click={() => goto("/settings/login")}>
			<img src='https://icons.gcs.icu/icon.png?type=cube&value=1&color1=0&color2=3' />
			<p>{strings.settings.loginButton}</p>
		</div>
		<div class={style.profileButtonsDiv}>
			<button class={style.profileButton} on:click={() => goto("/settings")}>
				<Settings size={20} color="#FFFFFF" />
			</button>
		</div>
	{/if}
</div>