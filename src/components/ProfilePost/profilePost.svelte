<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore, LoaderCircle } from 'lucide-svelte';
    import style from './style.module.scss';
	import library from '../../libs/library.js';
	import ProfilePostReply from '../../components/ProfilePostReply/profilePostReply.svelte';
	import languageStrings from '../../libs/languages.js';
	let strings = languageStrings[localStorage.language];
	
	export let username = '';
	export let postText = '';
	export let likes = 0;
	export let dislikes = 0;
	export let timestamp = 0;
	export let postID = 0;
	
	var profileReplies = [];
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
			const settings = await library.getSettings();
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
				{#if likes >= dislikes}
					<ThumbsUp size={20} /> {likes - dislikes}
				{:else}
					<ThumbsDown size={20} /> {dislikes - likes}
				{/if}
			</div>
		</div>
		<h3>
			{postText}
		</h3>
		<div class={style.profileCreatePostDiv}>
			<div class={style.repliesLoader}>
				<button on:click={() => checkReplies(postID)} class={style.profileReplyButton}>
					<MessageCircleMore size={20} color="#FFFFFF"/>
				</button>
				<span class={style.spin} id={"profilePostSpinner" + postID}>
					<LoaderCircle color="#FFFFFF" size={15} strokeWidth={3} />
				</span>
			</div>
			<h4 class={style.profilePostTime}>{library.timeConverter(timestamp, true)}</h4>
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