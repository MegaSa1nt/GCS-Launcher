<script>
	import Select from 'svelte-select';
	
	export let items = {};
	export let value = 0;
	export let onChange;
</script>

<Select
	items={items}
	bind:value={value}
	clearable={false}
	--item-color="white"
	--item-is-active-color="black"
	--item-hover-color="black"
	--list-background="#242424"
	--item-hover-bg="#3ee667"
	--item-is-active-bg="#3ee667"
	--list-border-radius="10px"
	--multi-item-border-radius="10px"
	--font-size="15px"
	searchable={false}
	showChevron
	on:change={onChange}
	inputStyles={`
		cursor: pointer;
	`}
	containerStyles={`
		border-radius: 10px;
		background-color: #242424;
		min-width: 200px;
		max-width: 200px;
		height: max-content;
		border: none;
		cursor: pointer;
	`}
/>