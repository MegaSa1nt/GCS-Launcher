<script>
	import { ThumbsUp, ThumbsDown, MessageCircleMore } from 'lucide-svelte';
    import style from './style.module.scss';
	
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
</script>

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
		<button class={style.profileReplyButton}>
			<MessageCircleMore size={20} color="#FFFFFF"/>
		</button>
		<h4 class={style.profilePostTime}>{timeConverter(timestamp, true)}</h4>
	</div>
</div>