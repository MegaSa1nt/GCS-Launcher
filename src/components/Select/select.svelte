<script>
	import SelectCore from 'svelte-select/no-styles/Select.svelte'
	
	export let items = {};
	export let value = 0;
	export let onChange; 
	
	// It doesn't work without this "if".
</script>
{#if true}
	<SelectCore
		items={items}
		bind:value={value}
		clearable={false}
		--item-color="white"
		--item-is-active-color="black"
		--item-hover-color="black"
		--list-background="#242424"
		--item-hover-bg="var(--accent-color)"
		--item-is-active-bg="var(--accent-color)"
		--list-border-radius="10px"
		--multi-item-border-radius="10px"
		--font-size="15px"
		--list-shadow="#00000000"
		searchable={false}
		showChevron
		on:change={onChange}
		inputStyles={`
			cursor: pointer;
		`}
		containerStyles={`
			border-radius: 10px;
			background-color: #94949414;
			min-width: 200px;
			max-width: 200px;
			height: max-content;
			border: none;
			cursor: pointer;
		`}
	/>
	<style>
		.svelte-select {
			/* deprecating camelCase custom props in favour of kebab-case for v5 */
			--borderRadius: var(--border-radius);
			--clearSelectColor: var(--clear-select-color);
			--clearSelectWidth: var(--clear-select-width);
			--disabledBackground: var(--disabled-background);
			--disabledBorderColor: var(--disabled-border-color);
			--disabledColor: var(--disabled-color);
			--disabledPlaceholderColor: var(--disabled-placeholder-color);
			--disabledPlaceholderOpacity: var(--disabled-placeholder-opacity);
			--errorBackground: var(--error-background);
			--errorBorder: var(--error-border);
			--groupItemPaddingLeft: var(--group-item-padding-left);
			--groupTitleColor: var(--group-title-color);
			--groupTitleFontSize: var(--group-title-font-size);
			--groupTitleFontWeight: var(--group-title-font-weight);
			--groupTitlePadding: var(--group-title-padding);
			--groupTitleTextTransform: var(--group-title-text-transform);
			--groupTitleBorderColor: var(--group-title-border-color);
			--groupTitleBorderWidth: var(--group-title-border-width);
			--groupTitleBorderStyle: var(--group-title-border-style);
			--indicatorColor: var(--chevron-color);
			--indicatorHeight: var(--chevron-height);
			--indicatorWidth: var(--chevron-width);
			--inputColor: var(--input-color);
			--inputLeft: var(--input-left);
			--inputLetterSpacing: var(--input-letter-spacing);
			--inputMargin: var(--input-margin);
			--inputPadding: var(--input-padding);
			--itemActiveBackground: var(--item-active-background);
			--itemColor: var(--item-color);
			--itemFirstBorderRadius: var(--item-first-border-radius);
			--itemHoverBG: var(--item-hover-bg);
			--itemHoverColor: var(--item-hover-color);
			--itemIsActiveBG: var(--item-is-active-bg);
			--itemIsActiveColor: var(--item-is-active-color);
			--itemIsNotSelectableColor: var(--item-is-not-selectable-color);
			--itemPadding: var(--item-padding);
			--listBackground: var(--list-background);
			--listBorder: var(--list-border);
			--listBorderRadius: var(--list-border-radius);
			--listEmptyColor: var(--list-empty-color);
			--listEmptyPadding: var(--list-empty-padding);
			--listEmptyTextAlign: var(--list-empty-text-align);
			--listMaxHeight: var(--list-max-height);
			--listPosition: var(--list-position);
			--listShadow: var(--list-shadow);
			--listZIndex: var(--list-z-index);
			--multiItemBG: var(--multi-item-bg);
			--multiItemBorderRadius: var(--multi-item-border-radius);
			--multiItemDisabledHoverBg: var(--multi-item-disabled-hover-bg);
			--multiItemDisabledHoverColor: var(--multi-item-disabled-hover-color);
			--multiItemHeight: var(--multi-item-height);
			--multiItemMargin: var(--multi-item-margin);
			--multiItemPadding: var(--multi-item-padding);
			--multiSelectInputMargin: var(--multi-select-input-margin);
			--multiSelectInputPadding: var(--multi-select-input-padding);
			--multiSelectPadding: var(--multi-select-padding);
			--placeholderColor: var(--placeholder-color);
			--placeholderOpacity: var(--placeholder-opacity);
			--selectedItemPadding: var(--selected-item-padding);
			--spinnerColor: var(--spinner-color);
			--spinnerHeight: var(--spinner-height);
			--spinnerWidth: var(--spinner-width);

			--internal-padding: 0 0 0 16px;

			border: var(--border, 1px solid #d8dbdf);
			border-radius: var(--border-radius, 6px);
			min-height: var(--height, 42px);
			position: relative;
			display: flex;
			align-items: stretch;
			padding: var(--padding, var(--internal-padding));
			background: var(--background, #fff);
			margin: var(--margin, 0);
			width: var(--width, 100%);
			font-size: var(--font-size, 16px);
			max-height: var(--max-height);
		}

		* {
			box-sizing: var(--box-sizing, border-box);
		}

		.svelte-select:hover {
			border: var(--border-hover, 1px solid #b2b8bf);
		}

		.value-container {
			display: flex;
			flex: 1 1 0%;
			flex-wrap: wrap;
			align-items: center;
			gap: 5px 10px;
			padding: var(--value-container-padding, 5px 0);
			position: relative;
			overflow: var(--value-container-overflow, hidden);
			align-self: stretch;
		}

		.prepend,
		.indicators {
			display: flex;
			flex-shrink: 0;
			align-items: center;
		}

		.indicators {
			position: var(--indicators-position);
			top: var(--indicators-top);
			right: var(--indicators-right);
			bottom: var(--indicators-bottom);
		}

		input {
			position: absolute;
			cursor: default;
			border: none;
			color: var(--input-color, var(--item-color));
			padding: var(--input-padding, 0);
			letter-spacing: var(--input-letter-spacing, inherit);
			margin: var(--input-margin, 0);
			min-width: 10px;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background: transparent;
			font-size: var(--font-size, 16px);
		}

		:not(.multi) > .value-container > input {
			width: 100%;
			height: 100%;
		}

		input::placeholder {
			color: var(--placeholder-color, #78848f);
			opacity: var(--placeholder-opacity, 1);
		}

		input:focus {
			outline: none;
		}

		.svelte-select.focused {
			border: var(--border-focused, 1px solid #006fe8);
			border-radius: var(--border-radius-focused, var(--border-radius, 6px));
		}

		.disabled {
			background: var(--disabled-background, #ebedef);
			border-color: var(--disabled-border-color, #ebedef);
			color: var(--disabled-color, #c1c6cc);
		}

		.disabled input::placeholder {
			color: var(--disabled-placeholder-color, #c1c6cc);
			opacity: var(--disabled-placeholder-opacity, 1);
		}

		.selected-item {
			position: relative;
			overflow: var(--selected-item-overflow, hidden);
			padding: var(--selected-item-padding, 0 20px 0 0);
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--selected-item-color, inherit);
			font-size: var(--font-size, 16px);
		}

		.multi .selected-item {
			position: absolute;
			line-height: var(--height, 42px);
			height: var(--height, 42px);
		}

		.selected-item:focus {
			outline: none;
		}

		.hide-selected-item {
			opacity: 0;
		}

		.icon {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.clear-select {
			all: unset;
			display: flex;
			align-items: center;
			justify-content: center;
			width: var(--clear-select-width, 40px);
			height: var(--clear-select-height, 100%);
			color: var(--clear-select-color, var(--icons-color));
			margin: var(--clear-select-margin, 0);
			pointer-events: all;
			flex-shrink: 0;
		}

		.clear-select:focus {
			outline: var(--clear-select-focus-outline, 1px solid #006fe8);
		}

		.loading {
			width: var(--loading-width, 40px);
			height: var(--loading-height);
			color: var(--loading-color, var(--icons-color));
			margin: var(--loading--margin, 0);
			flex-shrink: 0;
		}

		.chevron {
			width: var(--chevron-width, 40px);
			height: var(--chevron-height, 20px);
			background: var(--chevron-background, transparent);
			pointer-events: var(--chevron-pointer-events, none);
			color: var(--chevron-color, var(--icons-color));
			border: var(--chevron-border, 0 0 0 1px solid #d8dbdf);
			flex-shrink: 0;
		}

		.svelte-select.error {
			border: var(--error-border, 1px solid #ff2d55);
			background: var(--error-background, #fff);
		}

		.a11y-text {
			display: none;
		}

		.svelte-select-list {
			border-radius: var(--list-border-radius, 4px);
			max-height: var(--list-max-height, 252px);
			overflow-y: auto;
			background: var(--list-background, #fff);
			z-index: 5;
		}
		
		.svelte-select-list::-webkit-scrollbar {
			width: 0px;
		}

		.prefloat {
			opacity: 0;
			pointer-events: none;
		}

		.list-group-title {
			color: var(--group-title-color, #8f8f8f);
			cursor: default;
			font-size: var(--group-title-font-size, 16px);
			font-weight: var(--group-title-font-weight, 600);
			height: var(--height, 42px);
			line-height: var(--height, 42px);
			padding: var(--group-title-padding, 0 20px);
			text-overflow: ellipsis;
			overflow-x: hidden;
			white-space: nowrap;
			text-transform: var(--group-title-text-transform, uppercase);
			border-width: var(--group-title-border-width, medium);
			border-style: var(--group-title-border-style, none);
			border-color: var(--group-title-border-color, color);
		}

		.empty {
			text-align: var(--list-empty-text-align, center);
			padding: var(--list-empty-padding, 20px 0);
			color: var(--list-empty-color, #78848f);
		}

		.item {
			cursor: default;
			height: var(--item-height, var(--height, 42px));
			line-height: var(--item-line-height, var(--height, 42px));
			padding: var(--item-padding, 0 20px);
			color: var(--item-color, inherit);
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			transition: var(--item-transition, all 0.2s);
			align-items: center;
			width: 100%;
		}

		.item.group-item {
			padding-left: var(--group-item-padding-left, 40px);
		}
		
		.item.active {
			background: var(--item-is-active-bg, #007aff);
			color: var(--item-is-active-color, #fff);
		}

		.item.first {
			border-radius: var(--item-first-border-radius, 4px 4px 0 0);
		}

		.item.hover:not(.active) {
			background: var(--item-hover-bg, #e7f2ff);
			color: var(--item-hover-color, inherit);
		}

		.item.not-selectable,
		.item.hover.item.not-selectable,
		.item.active.item.not-selectable,
		.item.not-selectable:active {
			color: var(--item-is-not-selectable-color, #999);
			background: transparent;
		}

		.required {
			opacity: 0;
			z-index: -1;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}
	</style>
{/if}