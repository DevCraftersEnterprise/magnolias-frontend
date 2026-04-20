export function useLoadMore(loadFn: () => Promise<void>, limitDefault = 10) {
    const limit = ref(limitDefault);
    const offset = ref(0);
    const currentPage = ref(1);
    const totalPages = ref(1);

    const hasMore = computed(() => currentPage.value < totalPages.value);

    function update(data: { totalPages: number; currentPage: number }) {
        totalPages.value = data.totalPages;
        currentPage.value = data.currentPage;
    }

    function reset() {
        offset.value = 0;
        currentPage.value = 1;
    }

    async function loadMore() {
        if (!hasMore.value) return;
        offset.value += limit.value;
        await loadFn();
    }

    return { limit, offset, hasMore, update, reset, loadMore };
}