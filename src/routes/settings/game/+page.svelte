<script>
	import { Folder, ShieldCheck, Trash2 } from 'lucide-svelte';
	import style from '../style.module.scss';
	import Select from 'svelte-select';
	import library from '../../../libs/library.js';
	
	let isVerifyDisabled = false;
	let isUninstallDisabled = false;
	
	function disableButtons() {
		switch(true) {
			case isUpdatingGame:
			case isGameStarting:
			case isGameRunning:
			case localStorage.update_time == 0:
				isVerifyDisabled = true;
				isUninstallDisabled = true;
				break;
			default:
				isVerifyDisabled = false;
				isUninstallDisabled = false;
				break;
		}
	}
	document.addEventListener("playButtonStateChange", () => disableButtons());
	disableButtons()
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Settings" />
</svelte:head>

<div class={style.contentBlock}>
	<div class={style.head}>
		<div class={style.title}>
			Настройки
		</div>
		<div class={style.description}>
			Игра
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					Папка с игрой
				</h2>
				<h3>
					Открыть папку с игрой
				</h3>
			</div>
			<button class={style.settingsButton} on:click={() => library.openGameFolder()}>
				<Folder color="#FFFFFF"/>
			</button>
		</div>
		
		<hr>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					Целостность игры
				</h2>
				<h3>
					Проверить целостность файлов игры
				</h3>
			</div>
			<button disabled={isVerifyDisabled} class={style.settingsButton} on:click={() => library.verifyGameFilesIntegrity()}>
				<ShieldCheck color="#FFFFFF"/>
			</button>
		</div>
		
		<hr>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					Удалить игру
				</h2>
				<h3>
					Удалить файлы игры с компьютера
				</h3>
			</div>
			<button disabled={isUninstallDisabled} class={[style.settingsButton, style.dangerButton].join(' ')} on:click={() => library.uninstallGame()}>
				<Trash2 color="#FFFFFF"/>
			</button>
		</div>
	</div>
</div>