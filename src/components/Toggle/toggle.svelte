<script>
	/* Credits for toggle to https://github.com/metonym/svelte-toggle */
	
	export let toggled = true;
	export let label = "Label";
	export let hideLabel = true;
	export let small = false;
	export let disabled = false;
	export let on = undefined;
	export let off = undefined;
	export let switchColor = "#000";
	export let untoggledSwitchColor = "#eee";
	export let toggledColor = "var(--accent-color)";
	export let untoggledColor = "#5b5b5b";

	import { createEventDispatcher } from "svelte";
	import ToggleCore from "./ToggleCore.svelte";

	const dispatch = createEventDispatcher();

	$: dispatch("toggle", toggled);
</script>

<ToggleCore bind:toggled let:label={labelProps} let:button>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label {...labelProps} class:hideLabel>{label}</label>
	<div>
		<button
			class:small
			{...$$restProps}
			{...button}
			style:color={toggled ? switchColor : untoggledSwitchColor}
			style:background-color={toggled ? toggledColor : untoggledColor}
			{disabled}
			on:click
			on:click={() => (toggled = !toggled)}
			on:focus
			on:blur
		/>
		<slot {toggled}>
			{#if on && off}<span>{toggled ? on : off}</span>{/if}
		</slot>
	</div>
</ToggleCore>

<style>
	label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.75rem;
	}

	.hideLabel {
		display: none;
		position: absolute;
		height: 1px;
		width: 1px;
		overflow: hidden;
		clip: rect(1px 1px 1px 1px);
		clip: rect(1px, 1px, 1px, 1px);
		white-space: nowrap;
	}

	button {
		position: relative;
		padding: 0 0.25rem;
		border: 0;
		border-radius: 1rem;
		height: 1.25rem;
		width: 2.5rem;
		font: inherit;
		color: inherit;
		line-height: inherit;
		transition: 0.2s;
	}

	button:not([disabled]) {
		cursor: pointer;
	}

	button[disabled] {
		cursor: not-allowed;
		opacity: 0.6;
	}

	button:before {
		position: absolute;
		content: "";
		top: 0;
		bottom: 0;
		left: 0.125rem;
		margin: auto;
		height: 1rem;
		width: 1rem;
		text-align: center;
		border-radius: 50%;
		background-color: currentColor;
		transition: transform 0.2s ease-in-out;
		transform: scale(0.8);
	}
	
	button:active:before {
		transition: transform 0.2s ease-in-out;
		transform: scale(1.0);
	}
	
	button[aria-checked="true"]:active:before {
		transform: translateX(1.25rem) scale(1.0);
	}

	button[aria-checked="true"]:before {
		transform: translateX(1.25rem) scale(0.8);
	}

	button.small {
		height: 1rem;
		width: 1.75rem;
	}

	button.small:before {
		height: 0.75rem;
		width: 0.75rem;
	}

	button.small[aria-checked="true"]:before {
		transform: translateX(0.75rem);
	}

	div {
		display: flex;
		align-items: center;
	}

	span {
		margin-left: 0.5rem;
	}
</style>