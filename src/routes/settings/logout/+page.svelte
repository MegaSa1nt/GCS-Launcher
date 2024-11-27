<script>
	import { LogOut } from 'lucide-svelte';
	import style from '../style.module.scss';
	import library from '../../../libs/library.js';
	import { goto } from '$app/navigation';
	import languageStrings from '../../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	function logout() {
		library.logout();
		goto("/");
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login" />
</svelte:head>

<div class={[style.contentBlock, style.loginBlock].join(' ')}>
	<div class={style.loginDiv}>
		<h1 class={style.logoutTitle}>
			{strings.settings.logout.title}
		</h1>
		<h2 class={style.logoutDesc}>
			{strings.settings.logout.description}
		</h2>
		<button class={style.loginButton} on:click={() => logout()}>
			<LogOut color="#FFFFFF" size={20} strokeWidth={3} />
			{strings.settings.logout.button}
		</button>
	</div>
</div>