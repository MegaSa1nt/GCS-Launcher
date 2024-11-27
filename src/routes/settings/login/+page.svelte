<script>
	import { LogIn, UserRound, KeyRound, LoaderCircle, CircleX } from 'lucide-svelte';
	import style from '../style.module.scss';
	import library from '../../../libs/library.js';
	import { goto } from '$app/navigation';
	import languageStrings from '../../../libs/languages.js';
	let strings = languageStrings;
	import('../../../libs/languages.js?' + localStorage.language).then(str => strings = str.default.default);
	
	let isLogging = isLoggingIn;
	let isLoginErrored = false;
	let errorText = '';
	
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
					goto("/");
				} else {
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
	<title>Login</title>
	<meta name="description" content="Login" />
</svelte:head>

<div class={[style.contentBlock, style.loginBlock].join(' ')}>
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
</div>