<script>
    import { ArrowBendUpRight, DotsThreeVertical, ListPlus, Play, Shuffle } from 'phosphor-svelte';
    import { menu } from '$lib/stores/menu.svelte';
    import ActionButton from '$lib/components/ui/ActionButton.svelte';

    import { download } from '$lib/opensubsonic/api';
    import { audio } from '$lib/audio/manager.svelte.js';

    let {
        queue = [],
        menuActions = null
    } = $props();

    let buttonEl = $state(null);
</script>

<div class="flex items-center justify-between">
    <div class="flex space-x-4">
        {#if queue.length > 0}
            <ActionButton
                Icon={Play}
                title="Play"
                onclick={() => {
                    audio.setShuffle(false);
                    audio.setQueue(queue);
                }}
            />
            <ActionButton
                Icon={Shuffle}
                title="Shuffle"
                onclick={() => {
                    audio.setShuffle(true);
                    audio.setQueue(queue);
                }}
                primary={false}
                iconOnly={true}
            />
            <ActionButton
                Icon={ArrowBendUpRight}
                title="Queue next"
                onclick={() => {
                    audio.setQueueNext(queue);
                }}
                primary={false}
                iconOnly={true}
            />
            <ActionButton
                Icon={ListPlus}
                title="Queue last"
                onclick={() => {
                    audio.setQueueLast(queue);
                }}
                primary={false}
                iconOnly={true}
            />
        {/if}
    </div>
    <div class="flex space-x-4">
        {#if menuActions?.length > 0}
            <button
                bind:this={buttonEl}
                class="cursor-pointer text-ink-900 transition-colors hover:text-primary-10"
                onclick={(e) => {
                    e.stopPropagation();
                    menu.openFromElement(buttonEl, menuActions);
                }}
            >
                <DotsThreeVertical size={'1.5rem'} weight="bold" />
            </button>
        {/if}
    </div>
    <!-- TODO: Add modal to ask if download is ok instead of immediately downloading all items -->
    <!--     <div class="flex space-x-4">
        <ActionButtonIcon
            Icon={DownloadSimple}
            onClick={() => {
                console.log(queue);
            }}
        />
    </div> -->
</div>
