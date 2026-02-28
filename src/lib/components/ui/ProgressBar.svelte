<script>
    export let value = 0; // value in [0, 100]
    export let onValueCommit = (v) => {};

    let progressBar;

    function seek(event) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        onValueCommit(percent);
    }
</script>

<!-- TODO make a generic Slider to merge with SliderVolume -->
<div
    class="h-1 w-full cursor-pointer overflow-hidden rounded bg-[rgba(0,0,0,0.1)] bg-surface-10"
    style="transform: translateZ(0); backface-visibility: hidden;"
    on:click={seek}
    bind:this={progressBar}
>
    <div class="h-full rounded bg-primary-10" style="width: {value}%"></div>
</div>
