// app/composables/useDebounceSearch.ts
export function useDebounceSearch(
    fn: () => void,
    delay: number = 350,
    transform: (v: string) => string = (v) => v.trim()
) {
    const query = ref('');
    const debouncedQuery = ref('');

    let timer: ReturnType<typeof setTimeout> | undefined;

    watch(query, v => {
        clearTimeout(timer)
        timer = setTimeout(() => { debouncedQuery.value = transform(v); fn() }, delay)
    });

    function clear() {
        query.value = '';
        debouncedQuery.value = '';
        fn();
    }

    return { query, debouncedQuery, clear };
}