<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore } from 'lucide-svelte';
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
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
			<h4 class={style.profilePostTime}>{library.timeConverter(timestamp, true)}</h4>
		</div>
	</div>
</div>