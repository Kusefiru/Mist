<script>
    import { DownloadSimple, Play, RowsPlusBottom, RowsPlusTop, Shuffle } from 'phosphor-svelte';
    import ActionButtonIcon from '$lib/components/ui/ActionButtonIcon.svelte';
    import ActionButtonPrimary from '$lib/components/ui/ActionButtonPrimary.svelte';

    import { download } from '$lib/opensubsonic/api';
    import { audio } from '$lib/audio/manager.svelte.js';

    let { queue, starId = null } = $props();
</script>

<div class="flex justify-between pt-4">
    <div class="flex space-x-4">
        <ActionButtonPrimary
            Icon={Play}
            text="Play"
            onClick={() => {
                audio.setQueue(queue);
            }}
        />
        <ActionButtonIcon
            Icon={Shuffle}
            onClick={() => {
                audio.setShuffle(true);
                audio.setQueue(queue);
            }} />
        <ActionButtonIcon
            Icon={RowsPlusTop}
            onClick={() => {
                audio.setQueueNext(queue);
            }}
        />
        <ActionButtonIcon
            Icon={RowsPlusBottom}
            onClick={() => {
                audio.setQueueLast(queue);
            }}
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
