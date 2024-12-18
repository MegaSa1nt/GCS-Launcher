<script>
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	export let index = 0;
	export let action = [];
	export let timestamp = 0;
	
	let notificationTitle = '';
	let notificationType = style.squareYellow;
	
	let notification = library.getNotificationTitle(action);
	notificationTitle = notification.title;
	notificationType = notification.type;
</script>

{#if index != 0}
	<hr class={style.notificationsHR}>
{/if}
<div class={style.notificationDiv}>
	<div class={style.notificationDescription}>
		<h2>
			<span class={[style.notificationTypeSquare, notificationType].join(' ')}></span>
			{notificationTitle}
			<span class={style.notificationCircle}></span>
			<p>
				{library.timeConverter(timestamp, true)}
			</p>
		</h2>
	</div>
</div>