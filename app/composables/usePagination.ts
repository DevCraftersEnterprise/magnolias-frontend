export function usePagination(loadFn: (reset: boolean) => Promise<void>, limitDefault: number = 10) {
    const pagination = ref({
        limit: limitDefault,
        offset: 0,
        totalPages: 1,
        currentPage: 1,
        total: 0,
    });

    function update(data: { totalPages: number, currentPage: number }, total: number) {
        pagination.value.totalPages = Math.max(1, data.totalPages);
        pagination.value.currentPage = Math.max(1, data.currentPage);
        pagination.value.total = total;
    }

    function reset() {
        pagination.value.offset = 0;
    }

    const canPrev = computed(() => pagination.value.offset > 0);
    const canNext = computed(() => pagination.value.currentPage < pagination.value.totalPages);

    function showingFrom(itemsLength: number) {
        return pagination.value.total === 0 ? 0 : pagination.value.offset + 1;
    }

    function showingTo(itemsLength: number) {
        return Math.min(pagination.value.offset + itemsLength, pagination.value.total);
    }

    async function prevPage() {
        if (!canPrev.value) return;
        pagination.value.offset = Math.max(0, pagination.value.offset - pagination.value.limit);
        await loadFn(false);
    }

    async function nextPage() {
        if (!canNext.value) return;
        pagination.value.offset += pagination.value.limit;
        await loadFn(false);
    }

    return {
        pagination,
        update,
        reset,
        canPrev,
        canNext,
        showingFrom,
        showingTo,
        prevPage,
        nextPage,
    }
}