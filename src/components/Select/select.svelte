<script>
	/* Credits for radio buttons to https://github.com/metonym/svelte-radio */

	import { RadioGroup, Radio } from "svelte-radio";

	export let items = {};
	export let value = 0;
	export let onChange;
</script>

<RadioGroup value={value.value} legend="" on:change={onChange}>
	{#each items as item}
		<Radio label={item.label} value={item.value} />
	{/each}
</RadioGroup>

<style>
	:global(.svelte-radio-group) {
		display: flex;
		grid-gap: 5px;
		flex-direction: column;
		border: none;
		width: 100%;
		padding: 0px;
	}
	:global(.svelte-radio) {
		display: flex;
		flex-direction: row-reverse;
		justify-content: space-between;
		align-items: center;
	}

	:global(.svelte-radio label) {
		font-size: 17px;
		width: 100%;
		color: #c0c0c0;
		padding: 2.5px 0px;
	}

	:global(.svelte-radio input) {
		appearance: none;
		display: inline-block;
		width: 2em;
		height: 2em;
		flex-shrink: 0;
		flex-grow: 0;
		border: 1px solid #D9D9D9;
		border-radius: 500px;
		margin-right: 0.5em;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: 50% 50%;
		opacity: 1;
		transition: 0.2s;
	}

	:global(.svelte-radio input):checked {
		border: 1px solid var(--accent-color);
		background: var(--accent-color);
	}

	:global(.svelte-radio input):active {
		background: color-mix(in srgb, var(--accent-color) 100%, transparent 50%);
	}
</style>