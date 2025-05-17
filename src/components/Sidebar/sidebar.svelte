<script lang="ts">
	import { Home, User, Bell, BellDot } from 'lucide-svelte';
    import style from './style.module.scss';
    import { page } from '$app/stores';
	import library from '../../libs/library.js';

	library.initializeVariables();

    const colors = {
        "active": 'var(--accent-color)',
        "none": '#C7C6CA'
    };

	const profileTypes = ['gd', 'launcher', 'jeros'];
	export let sidebarProfileType = profileTypes[localStorage.profile_type];

    function getButtonColor(path: string): string {
        return path == $page.url.pathname ? colors.active : colors.none;
    };
    
    let homeColor = getButtonColor("/");
    let profileColor = getButtonColor("/profile-" + sidebarProfileType);
    let notificationsColor = getButtonColor("/notifications");
    
    const updateButtonColors = () => {
        homeColor = getButtonColor("/");
        profileColor = getButtonColor("/profile-" + sidebarProfileType);
		notificationsColor = getButtonColor("/notifications");
    };

    page.subscribe(() => {
        updateButtonColors();
		sidebarProfileType = profileTypes[localStorage.profile_type];
    });
	
	let newNotifications = window.hasNewNotifications;
	document.addEventListener("notificationChange", (event) => newNotifications = window.hasNewNotifications);
</script>

<div class={style.sidebar}>
	<div class={style.buttonsSidebar}>
		<a class={style.button} href="/">
			<Home color={homeColor} size={30} strokeWidth={2.25} />
        </a>
		{#if !localStorage.auth.length}
			<a class={style.button} href={"/settings/login"}>
				<User color={profileColor} size={30} strokeWidth={2.25} />
			</a>
		{:else}
			<a class={style.button} href={"/profile-" + sidebarProfileType}>
				<User color={profileColor} size={30} strokeWidth={2.25} />
			</a>
		{/if}
	</div>
</div>