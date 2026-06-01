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

<aside class="flex flex-col justify-between overflow-y-auto text-ink-800">
    <div class="mt-2 flex flex-col items-center gap-2">
        <img src={logo} alt="Mist" class="size-[3rem] lg:size-[3.5rem]" />
        <MenuButton href="/app/home" Icon={House} />
        <MenuButton href="/app/album/all" Icon={VinylRecord} />
        <MenuButton href="/app/artist/all" Icon={Users} />
        <MenuButton href="/app/playlist/all" Icon={Playlist} />
    </div>
</aside>
