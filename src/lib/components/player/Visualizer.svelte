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
            visualizer.render(ctx, freqData);
        }

        animationId = requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        visualizer.resize(canvas.offsetHeight, canvas.offsetWidth);
    }

    onMount(() => {
        if (!canvas) return;

        ctx = canvas.getContext('2d');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();
    });

    onDestroy(() => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);

        // Clean up visualizer
        if (visualizer && visualizer.reset) {
            visualizer.reset();
        }
    });

    $effect(() => {
        /* Set visualizer color to match CSS color */
        const color = getComputedStyle(canvas).color;
        visualizer.color = color.replace(')', ' / 0.6)');
        visualizer.resize(canvas.offsetWidth, canvas.offsetHeight);
    })
</script>

<canvas bind:this={canvas} class="absolute inset-0 h-full w-full text-primary-10"></canvas>
