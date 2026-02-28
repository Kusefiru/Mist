import { BarVisualizer } from '$lib/visualizers/bar';

// Create a writable store for the selected visualizer
// Defaults to BarVisualizer
export const visualizerStore = $state({ current: BarVisualizer });
