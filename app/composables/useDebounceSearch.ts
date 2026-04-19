// app/composables/useDebounceSearch.ts
export function useDebounceSearch(fn: () => void, delay = 350) {
    const query = ref('');
    const debouncedQuery = ref('');

    let timer: ReturnType<typeof setTimeout> | undefined;

    watch(query, v => {
        clearTimeout(timer)
        timer = setTimeout(() => { debouncedQuery.value = v.trim(); fn() }, delay)
    });
    function clear() {
        query.value = '';
        debouncedQuery.value = '';
        fn()
    }

    return { query, debouncedQuery, clear };
}