<script>
    import { ArrowBendUpRight, DownloadSimple, ListPlus, Play, Shuffle } from 'phosphor-svelte';
    import ActionButton from '$lib/components/ui/ActionButton.svelte';

    import { download } from '$lib/opensubsonic/api';
    import { audio } from '$lib/audio/manager.svelte.js';

    let { queue, starId = null } = $props();
</script>

<div class="flex justify-between">
    <div class="flex space-x-4">
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
