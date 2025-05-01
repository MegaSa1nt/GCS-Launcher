<script>
	import { ArrowDownToLine } from 'lucide-svelte';
    import style from './style.module.scss';
    import { page } from '$app/stores';
	import library from '../../libs/library.js';
	
	let progressValue = window.progress_value;
	let progressMax = window.progress_max;
	let progressValueText = window.progress_value_text;
	let progressMaxText = window.progress_max_text;
	let progressTitleText = window.progress_title_text;
	let progressSpeedText = window.progress_speed_text;
	
	document.addEventListener("progressChange", function(event) {
		progressValue = window.progress_value;
		progressMax = window.progress_max;
		progressValueText = window.progress_value_text;
		progressMaxText = window.progress_max_text;
		progressTitleText = window.progress_title_text;
		progressSpeedText = window.progress_speed_text;
	});
</script>

{#if progressMax > 0}
	<div class={style.progressBar}>
		<div class={style.progressState}>
			<h2>
				<ArrowDownToLine size={20} color="#FFFFFF" />
				{progressTitleText}
			</h2>
			<p>
				{progressSpeedText}
			</p>
		</div>
		<progress max={progressMax} value={progressValue}></progress>
		<div class={style.progressState}>
			<p>
				{progressValueText}
			</p>
			<p>
				{progressMaxText}
			</p>
		</div>
	</div>
{/if}