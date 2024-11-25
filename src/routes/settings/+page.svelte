<script>
	import style from './style.module.scss';
	import Toggle from "../../components/Toggle/toggle.svelte";
	import Select from 'svelte-select';
	
	let profileTypes = [
		{value: 1, label: 'Стиль лаунчера 1'},
		{value: 2, label: 'Стиль лаунчера 2'},
		{value: 0, label: 'В стиле Geometry Dash'}
	];
	
	let value = profileTypes.find(c => c.value == localStorage.profile_type);
	let isNotificationsToggled = localStorage.enable_notifications == "true";
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
			Лаунчер
		</div>
	</div>
	
	<div class={style.allSettingsDiv}>
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					Уведомления
				</h2>
				<h3>
					Включить уведомления лаунчера, такие как найденное обновление лаунчера/игры, завершение обновления, игровые уведомления и так далее
				</h3>
			</div>
			<Toggle bind:toggled={isNotificationsToggled} on:toggle={(e) => localStorage.enable_notifications = e.detail} />
		</div>
		
		<hr>
		
		<div class={style.settingDiv}>
			<div class={style.settingDescription}>
				<h2>
					Вид профиля
				</h2>
				<h3>
					В лаунчере есть несколько видов профиля, выберите тот, который вам нравится больше всего!
				</h3>
			</div>
			<Select
				id="profile-type-select"
				items={profileTypes}
				bind:value
				clearable={false}
				--item-color="white"
				--item-is-active-color="black"
				--item-hover-color="black"
				--list-background="#242424"
				--item-hover-bg="#3ee667"
				--item-is-active-bg="#3ee667"
				--list-border-radius="10px"
				--multi-item-border-radius="10px"
				--font-size="15px"
				searchable={false}
				showChevron
				on:change={(event) => localStorage.profile_type = event.detail.value}
				inputStyles={`
					cursor: pointer;
				`}
				containerStyles={`
					border-radius: 10px;
					background-color: #242424;
					min-width: 200px;
					max-width: 200px;
					height: max-content;
					border: none;
					cursor: pointer;
				`}
			/>
		</div>
	
	</div>
</div>