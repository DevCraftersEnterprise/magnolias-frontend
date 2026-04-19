export function useCatalogBlock<T>(
    fetcher: (
        limit: number,
        offset: number,
    ) => Promise<{
        items: T[];
        pagination: { totalPages: number; currentPage: number };
    }>,
    options: { filterActive?: boolean } = {},
) {
    const items = ref<T[]>([]);
    const loading = ref(false);

    const lm = useLoadMore(load);

    async function load() {
        loading.value = true;
        try {
            const data = await fetcher(lm.limit.value, lm.offset.value);
            const newItems = options.filterActive
                ? (data.items ?? []).filter((x) => Boolean((x as any).isActive))
                : (data.items ?? []);
            items.value = [...items.value, ...newItems];
            lm.update(data.pagination);
        } finally {
            loading.value = false;
        }
    }

    async function reset() {
        items.value = [];
        lm.reset();
        await load();
    }

    return { items, loading, lm, load, reset };
}
