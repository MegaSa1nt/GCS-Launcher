<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore } from 'lucide-svelte';
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	
	function timeConverter(timestamp, min = false) {
		const a = new Date(timestamp * 1000);
		var months = '';
		if(!min) months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
		else months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
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