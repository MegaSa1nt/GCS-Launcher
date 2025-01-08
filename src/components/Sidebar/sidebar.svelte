<script lang="ts">
	import { Home, User, Bell, BellDot } from 'lucide-svelte';
    import style from './style.module.scss';
    import { page } from '$app/stores';
	import library from '../../libs/library.js';
	import PlayButtonIcon from '../../components/PlayButtonIcon/playButtonIcon.svelte';

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
	
	let usernameCheck = localStorage.auth.length;
    
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
	
	document.addEventListener("profileTypeChange", () => sidebarProfileType = profileTypes[localStorage.profile_type]);
	
	document.addEventListener("accountChange", (event) => usernameCheck = localStorage.auth.length);
	
	export let buttonState = window.playButtonState;
	export let buttonIsAvailable = window.playButtonIsAvailable;
	export let updatingAnimation = window.gameUpdatingAnimation;
	
	document.addEventListener("playButtonStateChange", function(event) {
		buttonState = window.playButtonState;
		buttonIsAvailable = window.playButtonIsAvailable;
		updatingAnimation = window.gameUpdatingAnimation;
	});
	updatePlayButtonState();
</script>

<div class={style.sidebar}>
	<div class={style.buttonsSidebar}>
		<a class={style.button} href="/">
			<Home color={homeColor} size={30} strokeWidth={2.25} />
        </a>
		<div class={style.positionButton} on:click={() => library.openOrInstallGame()}>
			<div class={[style.loadButton, buttonIsAvailable].join(' ')}>
				<span id="play-button-animation" class={[style.loadAnimation, updatingAnimation].join(' ')}></span>
				<span class={style.positionPlayIcon}>
					<PlayButtonIcon state={buttonState} />
				</span>
			</div>
		</div>
		{#if !usernameCheck}
			<a class={style.button} href={"/settings#login"}>
				<User color={profileColor} size={30} strokeWidth={2.25} />
			</a>
		{:else}
			<a class={style.button} href={"/profile-" + sidebarProfileType}>
				<User color={profileColor} size={30} strokeWidth={2.25} />
			</a>
		{/if}
	</div>
</div>