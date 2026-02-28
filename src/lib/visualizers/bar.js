const CONFIG = {
    BAR_COUNT: 128,
    BAR_WIDTH_RATIO: 0.5,
    GAP_RATIO: 0.5,
    MAX_HEIGHT_RATIO: 0.3,
    BASE_COLOR: { r: 157, g: 41, b: 51 },
};

export class BarVisualizer {
    render(ctx, width, height, frequencyData) {
        ctx.clearRect(0, 0, width, height);
        if (!frequencyData) return;

        const centerX = width / 2;

        // One visual bar represents binsPerBar FFT bins
        // - 2 is a bit agressive but it filters last datas which are usually 0...
        const binsPerBar = Math.floor(frequencyData.length / CONFIG.BAR_COUNT) - 2;

        const unitWidth = centerX / CONFIG.BAR_COUNT;
        const barWidth = unitWidth * CONFIG.BAR_WIDTH_RATIO;
        const gap = unitWidth * CONFIG.GAP_RATIO;
        const maxBarHeight = height * CONFIG.MAX_HEIGHT_RATIO;

        ctx.fillStyle = `rgba(
            ${CONFIG.BASE_COLOR.r},
            ${CONFIG.BASE_COLOR.g},
            ${CONFIG.BASE_COLOR.b},
            0.4
        )`;
        ctx.filter = 'blur(0px)';

        for (let i = 0; i < CONFIG.BAR_COUNT; i++) {
            let sum = 0;
            for (let j = (i * binsPerBar); j < ((i * binsPerBar) + binsPerBar); j++) {
                sum += frequencyData[j] || 0;
            }

            const value = sum / binsPerBar;
            const normalizedHeight = value / 255;
            const barHeight = normalizedHeight * maxBarHeight;

            const offset = i * unitWidth + gap / 2;

            // Right side
            ctx.beginPath();
            ctx.roundRect(
                centerX + offset,
                height,
                barWidth,
                -barHeight,
                2
            );
            ctx.fill();

            // Left side (mirrored)
            ctx.beginPath();
            ctx.roundRect(
                centerX - offset - barWidth,
                height,
                barWidth,
                -barHeight,
                2
            );
            ctx.fill();
        }

        ctx.filter = 'none';
    }

    reset() { }
}
