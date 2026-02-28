<script>
    let { size = 20, color = 'currentColor', paused = false } = $props();

    const barWidth = Math.max(2, size * 0.15);
    const gap = Math.max(1, size * 0.1);
</script>

<div class="now-playing-indicator" style="width: {size}px; height: {size * 0.65}px; gap: {gap}px;">
    <div class="bar-wrapper bar-1" class:paused>
        <div class="bar" style="background-color: {color}; width: {barWidth}px;"></div>
    </div>
    <div class="bar-wrapper bar-2" class:paused>
        <div class="bar" style="background-color: {color}; width: {barWidth}px;"></div>
    </div>
    <div class="bar-wrapper bar-3" class:paused>
        <div class="bar" style="background-color: {color}; width: {barWidth}px;"></div>
    </div>
</div>

<style>
    .now-playing-indicator {
        display: inline-flex;
        align-items: flex-end;
        justify-content: center;
        flex-shrink: 0;
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    .bar-wrapper {
        display: flex;
        align-items: flex-end;
        height: 100%;
    }

    .bar {
        border-radius: 1px;
        height: 30%;
        animation: bounce 1.5s ease-in-out infinite;
    }

    .bar-1 .bar {
        animation-delay: 0s;
    }

    .bar-2 .bar {
        animation-delay: 0.4s;
    }

    .bar-3 .bar {
        animation-delay: 0.8s;
    }

    .bar-wrapper.paused .bar {
        animation: bounce-paused 0.5s ease-out forwards;
    }

    @keyframes bounce {
        0%,
        100% {
            height: 30%;
        }
        50% {
            height: 90%;
        }
    }

    @keyframes bounce-paused {
        to {
            height: 20%;
        }
    }
</style>
