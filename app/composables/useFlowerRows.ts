export type FlowerRow = {
    flowerId: string;
    colorId: string;
    quantity: number | "";
    note: string;
};

export function useFlowerRows() {
    const flowerRows = ref<FlowerRow[]>([
        { flowerId: "", colorId: "", quantity: "", note: "" },
    ]);

    function addFlowerRow() {
        flowerRows.value.push({ flowerId: "", colorId: "", quantity: "", note: "" });
    }
    function removeFlowerRow(i: number) {
        if (flowerRows.value.length > 1) flowerRows.value.splice(i, 1);
    }

    function resetFlowerRows() {
        flowerRows.value = [{ flowerId: "", colorId: "", quantity: "", note: "" }];
    }

    return { flowerRows, addFlowerRow, removeFlowerRow, resetFlowerRows };
}