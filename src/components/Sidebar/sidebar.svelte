<script lang="ts">
    import { onMount } from 'svelte';
	import { Home, Upload } from 'lucide-svelte';
    import style from './style.module.scss'
    import { page } from '$app/stores';

    const colors = {
        "active": '#139CFF',
        "none": '#C7C6CA'
    }

    function getButtonColor(path: string): string {
        return path == $page.url.pathname ? colors.active : colors.none;
    };
    
    let homeColor = getButtonColor("/")
    let updaterColor = getButtonColor("/update")
    
    const updateButtonColors = () => {
        homeColor = getButtonColor("/")
        updaterColor = getButtonColor("/update")
    }

    page.subscribe(() => {
        updateButtonColors()
    })
</script>

<div class={style.sidebar}>
	<div class={style.buttonsSidebar}>
		<a class={style.button} href="/">
			<Home color={homeColor} size={30} stroke-width={2.25} />
        </a>
		<a class={style.button} href="/update">
			<Upload color={updaterColor} className="active" size={30} stroke-width={2.25} />
        </a>
	</div>
</div>