export function lazyLoad(node, callback) {
    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                callback();
                observer.disconnect();
            }
        },
        { rootMargin: '400px' }
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
}
