<script>
	import { BellOff } from 'lucide-svelte';
	import style from './style.module.scss';
	import NotificationSkeleton from "../../components/NotificationSkeleton/notificationSkeleton.svelte";
	import Notification from "../../components/Notification/notification.svelte";
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	let gameName = '';
	
	library.getSettings().then(r => {
		gameName = r.gdps_name;
		fetch(r.dashboard_api_url + "notify.php?auth=" + localStorage.auth + "&readNotifies");
	});
	
	library.getNotifications();
	
	let notifications = window.notifications;
	let showSkeleton = window.isNotificationsLoading;
	
	document.addEventListener("notificationChange", (event) => {
		notifications = event.detail.notifies;
		showSkeleton = false;
	});
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Settings" />
</svelte:head>

<div class={style.notificationsBlock}>
	<div class={style.head}>
		<div class={style.title}>
			{gameName}
		</div>
		<div class={style.description}>
			{strings.settings.notifications.title}
		</div>
	</div>
	
	<div class={style.allNotificationsDiv}>
		{#if showSkeleton}
			<NotificationSkeleton />
			<hr class={style.notificationsHR}>
			<NotificationSkeleton />
			<hr class={style.notificationsHR}>
			<NotificationSkeleton />
			<hr class={style.notificationsHR}>
			<NotificationSkeleton />
			<hr class={style.notificationsHR}>
			<NotificationSkeleton />
			<hr class={style.notificationsHR}>
			<NotificationSkeleton />
		{/if}
		{#each notifications as notification, index}
			<Notification index={index} action={notification.action} timestamp={notification.time} isChecked={notification.checked} />
		{/each}
		{#if !notifications.length && !showSkeleton}
			<div class={style.noNotificationsDiv}>
				<BellOff size={100} />
				<h3 class={style.noNotificationsH3}>
					Нет уведомлений
				</h3>
			</div>
		{/if}
	</div>
</div>