<script lang="ts">
	import { ArrowLeft, LogIn, AppWindow, Gamepad, LogOut } from 'lucide-svelte';
    import style from './style.module.scss';
    import { page } from '$app/stores';

    const colors = {
        "active": 'var(--accent-color)',
        "none": '#C7C6CA'
    };

	const profileTypes = ['gd', 'launcher', 'jeros'];
	export let sidebarProfileType = profileTypes[localStorage.profile_type];

    function getButtonColor(path: string): string {
        return path == $page.url.pathname ? colors.active : colors.none;
    };
    
    let launcherSettingsColor = getButtonColor("/settings");
    let gameSettingsColor = getButtonColor("/settings/game");
    let loginColor = getButtonColor("/settings/login");
    let logoutColor = getButtonColor("/settings/logout");
    
    const updateButtonColors = () => {
		launcherSettingsColor = getButtonColor("/settings");
		gameSettingsColor = getButtonColor("/settings/game");
		loginColor = getButtonColor("/settings/login");
		logoutColor = getButtonColor("/settings/logout");
    }

    page.subscribe(() => {
        updateButtonColors();
		sidebarProfileType = profileTypes[localStorage.profile_type];
    })
</script>

<div class={style.sidebar}>
	<div class={style.buttonsSidebar}>
		<a class={style.button} href="/">
			<ArrowLeft color="#C7C6CA" size={30} strokeWidth={2.25} />
        </a>
		<div class={style.settingsButtons}>
			<a class={style.button} href="/settings">
				<AppWindow color={launcherSettingsColor} size={30} strokeWidth={2.25} />
			</a>
			<a class={style.button} href="/settings/game">
				<Gamepad color={gameSettingsColor} size={30} strokeWidth={2.25} />
			</a>
		</div>
		{#if !localStorage.auth.length}
			<a class={style.button} href={"/settings/login"}>
				<LogIn color={loginColor} size={30} strokeWidth={2.25} />
			</a>
		{:else}
			<a class={style.button} href={"/settings/logout"}>
				<LogOut color={logoutColor} size={30} strokeWidth={2.25} />
			</a>
		{/if}
	</div>
</div>