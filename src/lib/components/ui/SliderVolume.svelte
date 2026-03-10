<script>
    import { SpeakerSimpleLow, SpeakerSimpleHigh, SpeakerSimpleX } from 'phosphor-svelte';
    import Slider from '$lib/components/ui/Slider.svelte';

    let { value = $bindable() } = $props();

    let Icon = $derived(
        value === 0 ? SpeakerSimpleX : value < 50 ? SpeakerSimpleLow : SpeakerSimpleHigh
    );
</script>

<div class="flex w-full items-center justify-end">
    <div class="pr-2 text-lg text-ink-700">
        <Icon size={28} />
    </div>
    <Slider bind:value />
</div>
