<script>
    import { onMount, onDestroy } from 'svelte';
    import { audio } from '$lib/audio/manager.svelte.js';

    // Props - accepts any visualizer implementation
    let { visualizerClass } = $props();

    // Canvas state
    let visualizer = $derived(new visualizerClass());
    let canvas;
    let ctx;
    let animationId;
    let freqData;

    function animate() {
        if (!ctx || !canvas) return;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Get audio analyser and extract frequency data
        const analyser = audio.getAnalyser();
        if (analyser) {
            if (!freqData) freqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(freqData);
            visualizer.render(ctx, canvas.offsetWidth, canvas.offsetHeight, freqData);
        }

        animationId = requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx?.scale(dpr, dpr);
    }

    onMount(() => {
        if (!canvas) return;

        ctx = canvas.getContext('2d');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();
    });

    onDestroy(() => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        window.removeEventListener('resize', resizeCanvas);

        // Clean up visualizer
        if (visualizer && visualizer.reset) {
            visualizer.reset();
        }
    });
</script>

<canvas bind:this={canvas} class="absolute inset-0 h-full w-full"></canvas>
