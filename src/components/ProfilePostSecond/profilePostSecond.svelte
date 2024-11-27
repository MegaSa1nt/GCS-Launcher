<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore, LoaderCircle } from 'lucide-svelte';
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	import ProfilePostReply from '../../components/ProfilePostReply/profilePostReply.svelte';
	
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
	
	export let username = '';
	export let postText = '';
	export let likes = 0;
	export let dislikes = 0;
	export let timestamp = 0;
	export let postID = 0;
	
	export let profileReplies = [];
	var postReplies = {};
	
	async function checkReplies(postID) {
		if(typeof postReplies[postID] != "undefined") {
			const postRepliesDiv = document.getElementById("profilePostReplies" + postID);
			if(postReplies[postID] && postRepliesDiv != null) postRepliesDiv.classList.toggle(style.hide);
			return;
		}
		postReplies[postID] = false;
		document.getElementById("profilePostSpinner" + postID).classList.add(style.show);
		return new Promise(async function(r) {
			const settings = library.getSettings();
			fetch(settings.dashboard_api_url + "replies.php", {
				method: "POST",
				body: "commentID=" + postID,
				headers: {
					"Content-type": "application/x-www-form-urlencoded"
				}
			}).then(res => res.json()).then(response => {
				document.getElementById("profilePostSpinner" + postID).classList.remove(style.show);
				profileReplies = response.replies;
				postReplies[postID] = true;
				r(true);
			});
		});
	} 
</script>

<div class={style.postPlusReplies}>
	<div class={style.profilePost}>
		<div class={style.profilePostStats}>
			<h2 class={style.profileUsername}>{username}</h2>
			<div class={style.profilePostLikes}>
				<h4 class={style.profilePostTime}>{timeConverter(timestamp, true)}</h4>
			</div>
		</div>
		<h3>
			{postText}
		</h3>
		<div class={style.profileCreatePostDiv}>
			<div class={[style.postButtons, style.repliesLoader].join(' ')}>
				<div class={style.onlyButtons}>
					<button class={style.profileLikeButton}>
						{#if likes >= dislikes}
							<ThumbsUp color="#FFFFFF" size={20} /> {likes - dislikes}
						{:else}
							<ThumbsDown color="#FFFFFF" size={20} /> {dislikes - likes}
						{/if}
					</button>
					<button on:click={() => checkReplies(postID)} class={style.profileReplyButton}>
						<MessageCircleMore size={20} color="#FFFFFF"/>
					</button>
				</div>
				<span class={[style.spin]} id={"profilePostSpinner" + postID}>
					<LoaderCircle color="#FFFFFF" size={15} strokeWidth={3} />
				</span>
			</div>
		</div>
	</div>
	{#if profileReplies.length > 0}
		<div id={"profilePostReplies" + postID}>
			{#each profileReplies as reply, index}
				<ProfilePostReply index={index} username={reply.account.username} replyText={reply.body} timestamp={reply.timestamp} />
			{/each}
		</div>
	{/if}
</div>