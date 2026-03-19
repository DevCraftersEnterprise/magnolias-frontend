<script setup lang="ts">
const props = defineProps<{
    latitude: number;
    longitude: number;
    name: string;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let mapInstance: any = null;

function openInGoogleMaps() {
    window.open(`https://www.google.com/maps?q=${props.latitude},${props.longitude}`, '_blank', 'noopener,noreferrer');
}

onMounted(async () => {
    if (!mapContainer.value) return;

    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    // Ícono personalizado rosa con SVG
    const pinkIcon = L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path fill="#f472b6" stroke="#fff" stroke-width="1"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });

    mapInstance = L.map(mapContainer.value, {
        center: [props.latitude, props.longitude],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance);

    L.marker([props.latitude, props.longitude], { icon: pinkIcon })
        .addTo(mapInstance)
        .bindPopup(props.name)
        .openPopup();
});
</script>

<template>
    <div class="relative w-full h-36 rounded-xl overflow-hidden z-0">
        <div ref="mapContainer" class="w-full h-full" />
        <button
            @click="openInGoogleMaps"
            class="absolute bottom-2 right-2 z-[400] flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-[#101541] shadow ring-1 ring-black/10 hover:bg-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Ver en Google Maps
        </button>
    </div>
</template>
