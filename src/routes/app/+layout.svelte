<!-- src/routes/app/+layout.svelte -->
<script>
    import { ArrowClockwise, SignOut } from 'phosphor-svelte';
    import { session } from '$lib/stores/auth.svelte.js';
    import { ui } from '$lib/stores/ui.svelte.js';
    import { getAvatar, getUser } from '$lib/opensubsonic/api';
    import { database } from '$lib/db/index';
    import { audioState } from '$lib/stores/audio.svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import toast from 'svelte-french-toast';

    import MenuPortal from '$lib/components/ui/menu/MenuPortal.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import FullscreenPlayer from '$lib/components/player/FullscreenPlayer.svelte';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Player from '$lib/components/player/BottomPlayer.svelte';
    import PlayQueue from '$lib/components/layout/PlayQueue.svelte';
    import SearchBar from '$lib/components/ui/search/SearchBar.svelte';
    import SplashScreen from '$lib/components/layout/SplashScreen.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { cache } from '$lib/stores/cache.svelte.js';
    import { menu } from '$lib/stores/menu.svelte.js';

    let { data, children } = $props();
    let avatar = $state(null);

    let menuButton = $state(null);
    let menuVisible = $state(null);
    let menuActions = $derived.by(() => {
        const serverGroup = [
            {
                icon: ArrowClockwise,
                label: 'Refresh',
                handler: () => {
                    toast.promise(cache.fetch(), {
                        loading: 'Refreshing library...',
                        success: 'Library successfully refreshed!',
                        error: 'Failed to refresh library.'
                    });
                }
            },
            {
                icon: SignOut,
                label: 'Logout',
                handler: () => {
                    database.clearLogin();
                    window.location.reload();
                }
            }
        ];
        return [serverGroup].filter((g) => g.length > 0);
    });

    onMount(async () => {
        audio.restore();
        avatar = await getAvatar(session.username);
    });

    // Navigation management
    let mainElement;
    const scrollPositions = new Map();

    beforeNavigate((navigation) => {
        // Save current scroll position before leaving
        if (mainElement && navigation.from) {
            scrollPositions.set(navigation.from.route.id, mainElement.scrollTop);
        }
    });

    afterNavigate((navigation) => {
        if (!mainElement) return;

        // Close fullscreen
        ui.showFullscreenPlayer = false;

        // Focus on mainElement
        mainElement.focus({ preventScroll: true });

        // On back/forward navigation, restore saved position
        if (navigation.type === 'popstate' && navigation.to?.route.id) {
            const savedPosition = scrollPositions.get(navigation.to.route.id);
            if (savedPosition !== undefined) {
                mainElement.scrollTop = savedPosition;
            } else {
                mainElement.scrollTop = 0;
            }
        } else {
            // On new navigation (link click, goto), scroll to top
            mainElement.scrollTop = 0;
        }
    });

    $effect(() => {
        // Save progress
        audioState.progress;
        audioState.volume;

        audioState.saveProgress();
    });

    $effect(() => {
        // Access the properties to track them
        audioState.index;
        audioState.playOrder;
        audioState.shuffled;

        audioState.saveQueue();
    });
</script>

{#if !cache.initialized}
    <SplashScreen />
{:else}
    <div class="fixed inset-0 flex flex-col bg-surface-50">
        <!-- Main Content Area -->
        <div class="bg-grain relative flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <div class="flex w-[4rem] flex-col select-none lg:w-[5rem]">
                <Sidebar />
            </div>

            <!-- Main Panel OR Fullscreen Player -->
            <div class="relative flex min-w-0 flex-1 flex-col bg-surface-30">
                <!-- Top Bar -->
                <header class="flex h-[4rem] items-center justify-between px-8 lg:h-[5rem]">
                    <SearchBar />

                    <div class="flex items-center select-none">
                        <span class="mr-4 text-lg text-ink-900">{session.username}</span>
                        <button
                            bind:this={menuButton}
                            class="inline-flex size-[3rem] cursor-pointer items-center justify-center rounded-full outline outline-2 outline-transparent transition-colors hover:outline-primary-20"
                            onclick={(e) => {
                                e.stopPropagation();
                                menu.openFromElement(menuButton, menuActions);
                            }}
                        >
                            <FadeImage
                                src={avatar}
                                alt="Avatar"
                                class="rounded-full object-cover"
                            />
                        </button>
                    </div>
                </header>

                <!-- Scrollable Content -->
                <main bind:this={mainElement} class="flex-1 overflow-y-auto focus:outline-none" tabindex="0">
                    {@render children()}
                </main>
            </div>

            <!-- Play Queue Sidebar (conditionally rendered) -->
            {#if ui.showPlayQueue}
                <div
                    class="relative z-30 w-[var(--min-queue-size)] flex-shrink-0"
                    transition:slide={{ axis: 'x', duration: 200 }}
                >
                    <PlayQueue />
                </div>
            {/if}

            <!-- Bottom gradient overlay -->
            <div
                class="pointer-events-none absolute right-0 bottom-0 left-0 z-40 h-8 bg-gradient-to-b from-transparent to-surface-50"
            ></div>
        </div>

        <!-- Bottom Player -->
        <footer class="relative z-50 bg-surface-50 inset-shadow-sm inset-shadow-surface-30">
            <Player />
        </footer>

        {#if ui.showFullscreenPlayer}
            <div class="fixed inset-0 z-[100]">
                <FullscreenPlayer
                    onClose={() => (ui.showFullscreenPlayer = !ui.showFullscreenPlayer)}
                />
            </div>
        {/if}
    </div>

    <MenuPortal />
{/if}
