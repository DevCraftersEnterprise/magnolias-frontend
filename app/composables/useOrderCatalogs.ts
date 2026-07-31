import { addressesService } from "~/services/addresses.service";
import { catalogsService } from "~/services/catalogs.service";
import type { CommonAddress } from "~/types/address.types";
import type {
    BreadTypeItem,
    ColorItem,
    FillingItem,
    FlowerItem,
    FrostingItem,
    StyleItem
} from "~/types/catalog.types"

export function useOrderCatalogs() {
    const breadTypes = ref<BreadTypeItem[]>([]);
    const fillings = ref<FillingItem[]>([]);
    const frostings = ref<FrostingItem[]>([]);
    const styles = ref<StyleItem[]>([]);
    const flowerCatalog = ref<FlowerItem[]>([]);
    const colorCatalog = ref<ColorItem[]>([]);
    const commonAddresses = ref<CommonAddress[]>([]);

    Promise.all([
        catalogsService.getBreadTypes().then(r => { breadTypes.value = r.items; }),
        catalogsService.getFillings().then(r => { fillings.value = r.items; }),
        catalogsService.getFrostings().then(r => { frostings.value = r.items; }),
        catalogsService.getStyles().then(r => { styles.value = r.items; }),
        catalogsService.getFlowers().then(r => { flowerCatalog.value = r.items; }),
        catalogsService.getColors().then(r => { colorCatalog.value = r; }),
        addressesService.getAddresses().then(r => { commonAddresses.value = r; })
    ]).catch(() => { });

    function colorName(colorId: string) {
        return colorCatalog.value.find(c => c.id === colorId)?.name ?? '';
    }

    function colorHex(colorId: string) {
        return colorCatalog.value.find(c => c.id === colorId)?.value ?? '';
    }

    function catalogLabel(arr: { id: string; name: string; }[], id: string) {
        return arr.find(x => x.id === id)?.name ?? '-';
    }

    function locationLabel(val?: string | null) {
        if (!val) return "";
        return LOCATION_LABELS[val.toUpperCase()] ?? val;
    }

    return {
        breadTypes, fillings, frostings, styles, flowerCatalog, colorCatalog, commonAddresses,
        colorName, colorHex, catalogLabel, locationLabel
    };
}