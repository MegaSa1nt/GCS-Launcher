<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore } from 'lucide-svelte';
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	function timeConverter(timestamp, min = false) {
		const a = new Date(timestamp * 1000);
		var months = '';
		if(!min) months = [strings.months.full.january, strings.months.full.february, strings.months.full.march, strings.months.full.april, strings.months.full.may, strings.months.full.june, strings.months.full.july, strings.months.full.august, strings.months.full.september, strings.months.full.october, strings.months.full.november, strings.months.full.december];
		else months = [strings.months.short.january, strings.months.short.february, strings.months.short.march, strings.months.short.april, strings.months.short.may, strings.months.short.june, strings.months.short.july, strings.months.short.august, strings.months.short.september, strings.months.short.october, strings.months.short.november, strings.months.short.december];
		const year = a.getFullYear();
		const month = months[a.getMonth()];
		const date = a.getDate();
		var time = '';
		if(!min) time = date + ' ' + month + ' ' + year;
		else {
			const b = new Date();
			if(a.getFullYear() == b.getFullYear()) time = date + ' ' + month;
			else time = date + ' ' + month + ' ' + year;
		}
		return time;
	}
	
	export let index = 0;
	export let username = '';
	export let replyText = '';
	export let timestamp = 0;
	
	var profileReplies = [];
	
	async function checkReplies(postID) {
		return new Promise(async function(r) {
			const settings = await library.getSettings();
			fetch(settings.dashboard_api_url + "replies.php", {
				method: "POST",
				body: "commentID=" + postID,
				headers: {
					"Content-type": "application/x-www-form-urlencoded"
				}
			}).then(res => res.json()).then(response => {
				profileReplies = response.replies;
				r(true);
			});
		});
	} 
</script>

<div class={style.postPlusReplies}>
	{#if index != 0}
		<hr class={style.hr}>
	{/if}
	<div class={style.profilePost}>
		<div class={style.profilePostStats}>
			<h2 class={style.profileUsername}>{username}</h2>
		</div>
		<h3>
			{replyText}
		</h3>
		<div class={style.profileCreatePostDiv}>
			<h4 class={style.profilePostTime}>{timeConverter(timestamp, true)}</h4>
		</div>
	</div>
</div>