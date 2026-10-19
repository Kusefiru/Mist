<script>
    import { GearSix, House, Playlist, Users, VinylRecord } from 'phosphor-svelte';
    import { onMount } from 'svelte';

    import logo from '$lib/assets/logo.svg';
    import MenuButton from '$lib/components/ui/MenuButton.svelte';
    import SettingsModal from '$lib/components/ui/modal/SettingsModal.svelte';
    import { getAvatar, getPlaylists, getUser } from '$lib/opensubsonic/api';
    import { modal } from '$lib/stores/modal.svelte.js';

    let playlists = $state([]);

    onMount(async () => {
        playlists = await getPlaylists();
    });
</script>

<aside class="flex h-full flex-col overflow-y-auto text-ink-800">
    <div class="mt-2 flex flex-col items-center">
        <img src={logo} alt="Mist" class="size-[3rem] lg:size-[3.5rem]" />
    </div>

    <div class="flex flex-col items-center gap-2 pt-4">
        <MenuButton href="/app/home" Icon={House} />
        <MenuButton href="/app/album/all" Icon={VinylRecord} />
        <MenuButton href="/app/artist/all" Icon={Users} />
        <MenuButton href="/app/playlist/all" Icon={Playlist} />
    </div>

    <div class="mt-auto flex flex-col items-center pb-4">
        <MenuButton onclick={() => modal.open(SettingsModal)} Icon={GearSix} />
    </div>
</aside>
