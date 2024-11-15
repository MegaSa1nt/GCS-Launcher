<script lang="ts">
	import style from './style.module.scss';
	import { Play, LoaderCircle, ArrowDownToLine } from 'lucide-svelte';
	export let state = 0;
</script>

{#if state == 0}
	<Play color='#000000' size={35} strokeWidth={2.5} />
{:else if state == 1}
	<span class={style.spin}>
		<LoaderCircle color='#000000' size={35} strokeWidth={3} />
	</span>
{:else if state == 2}
	<ArrowDownToLine color='#000000' size={35} strokeWidth={3} />
{/if}