<script>
	import { Settings, Download } from 'lucide-svelte';
	import style from './style.module.scss';
</script>

<svelte:head>
	<title>Update</title>
	<meta name="description" content="Updater" />
</svelte:head>

<div class={style.updaterBlock}>
	<div class={style.head}>
		<div class={style.button}>
			<Download size={46} color='#FFFFFF' stroke-width={4} />
		</div>

		<div class={style.textContent}>
			<div class={style.title}>
				Новая версия!
			</div>
			<div class={style.description}>
				Доступна новая версия для скачивания
			</div>
		</div>
	</div>
</div>