<script>
	import { Folder, ShieldCheck, Trash2 } from 'lucide-svelte';
	import style from '../style.module.scss';
	import library from '../../../libs/library.js';
	
	function loginToAccount() {
		const formItems = new FormData(document.getElementsByName("loginForm")[0]);
		const username = formItems.get("username");
		const password = formItems.get("password");
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login" />
</svelte:head>

<div class={style.contentBlock}>
	<div class={style.head}>
		<div class={style.title}>
			Настройки
		</div>
		<div class={style.description}>
			Аккаунт
		</div>
	</div>
	
	<div class={style.loginDiv}>
		<form name="loginForm">
			<div class={style.inputDiv}>
				<h2>
					Никнейм
				</h2>
				<input class={style.inputStyle} type="text" name="username" placeholder="Ваш никнейм" />
			</div>
			
			<div class={style.inputDiv}>
				<h2>
					Пароль
				</h2>
				<input class={style.inputStyle} type="password" name="password" placeholder="Ваш пароль" />
			</div>
			
			<button class={style.loginButton} on:click={() => loginToAccount()}>
				Войти в аккаунт
			</button>
		</form>
	</div>
</div>