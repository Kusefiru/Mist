<script>
    import { House, Playlist, Users, VinylRecord } from 'phosphor-svelte';
    import MenuButton from '$lib/components/ui/MenuButton.svelte';
    import logo from '$lib/assets/logo.svg';

    import { onMount } from 'svelte';
    import { getAvatar, getPlaylists, getUser } from '$lib/opensubsonic/api';

    let playlists = $state([]);

    onMount(async () => {
        playlists = await getPlaylists();
    });
</script>

<div class="flex w-18 flex-col bg-gradient-to-b from-surface-40 to-surface-10 select-none">
    <aside class="flex flex-col justify-between overflow-y-auto text-ink-800">
        <div class="mt-2 flex flex-col items-center gap-2">
            <img src={logo} alt="Mist" class="size-14" />
            <MenuButton href="/app/home" Icon={House} />
            <MenuButton href="/app/album/all" Icon={VinylRecord} />
            <MenuButton href="/app/artist/all" Icon={Users} />
            <MenuButton href="/app/playlist/all" Icon={Playlist} />
        </div>
    </aside>
</div>
