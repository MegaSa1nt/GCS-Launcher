<script lang="ts">
    import { onMount } from 'svelte';
	import { Home, User, Settings } from 'lucide-svelte';
    import style from './style.module.scss'
    import { page } from '$app/stores';

    const colors = {
        "active": '#3EE667',
        "none": '#C7C6CA'
    }

    function getButtonColor(path: string): string {
        return path == $page.url.pathname ? colors.active : colors.none;
    };
    
    let homeColor = getButtonColor("/")
    let profileColor = getButtonColor("/profile")
    let settingsColor = getButtonColor("/settings")
    
    const updateButtonColors = () => {
        homeColor = getButtonColor("/")
        profileColor = getButtonColor("/profile")
        settingsColor = getButtonColor("/settings")
    }

    page.subscribe(() => {
        updateButtonColors()
    })
</script>

<div class={style.sidebar}>
	<div class={style.buttonsSidebar}>
		<a class={style.button} href="/">
			<Home color={homeColor} size={30} strokeWidth={2.25} />
        </a>
		<a class={style.button} href="/profile">
			<User color={profileColor} size={30} strokeWidth={2.25} />
        </a>
		<a class={style.button} href="/settings">
			<Settings color={settingsColor} size={30} strokeWidth={2.25} />
        </a>
	</div>
</div>