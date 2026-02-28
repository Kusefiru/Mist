<script>
    let { src, alt, class: className = '', ...params } = $props();
    let loaded = $state(false);
</script>

<img
    class="{className} transition-opacity"
    class:opacity-0={!loaded}
    class:opacity-100={loaded}
    {src}
    {alt}
    {...params}
    onload={() => (loaded = true)}
/>
