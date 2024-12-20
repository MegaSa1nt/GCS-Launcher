<script>
    import style from './style.module.scss';
	
	export let show = true;
	
</script>

{#if show}
	<div class={style.notificationDiv}>
		<div class={style.notificationDescription}>
			<h2>
				<span class={[style.notificationTypeSquare, style.skeletonSpan].join(' ')}></span>
				<span class={[style.notificationTitleSkeleton, style.skeletonSpan].join(' ')}></span>
			</h2>
			<h3>
				<span class={[style.notificationDescriptionSkeleton, style.skeletonSpan].join(' ')}></span>
			</h3>
		</div>
	</div>
{/if}