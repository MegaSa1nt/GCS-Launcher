<script>
	/* Credits for toast to https://github.com/zerodevx/svelte-toast */
	
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<SvelteToast />

<style>
	:global(._toastContainer) {
		top: 8.5% !important;
		z-index: 20 !important;
		width: 100% !important;
		left: 0 !important;
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
		align-items: center;
	}

	:global(._toastItem) {
		width: max-content !important;
		min-height: 0px !important;
		margin: var(--toastMargin, 0 0 0.5rem 0);
		padding: 0px 0px !important;
		background: #222222 !important;
		color: var(--toastColor, #fff);
		box-shadow: var(
			--toastBoxShadow,
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06)
		);
		border: var(--toastBorder, none);
		border-radius: 500px !important;
	}

	:global(._toastMsg) {
		padding: 10px 15px !important;
		font-size: 17px !important;
	}

	:global(._toastBtn),
	:global(._toastBar) {
		display: none !important;
	}
	
	:global([launcher-theme="mica"] ._toastItem) {
		border-radius: 10px !important;
	}
</style>