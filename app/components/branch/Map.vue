<script setup lang="ts">
const props = defineProps<{
    locationUrl?: string | null;
    name: string;
}>();

/**
 * Convierte un enlace normal de Google Maps (el que se comparte o se copia
 * de la barra de direcciones) en uno embebible dentro de un iframe. Si el
 * enlace ya es un enlace de inserción ("Insertar un mapa") o ya trae
 * output=embed, se usa tal cual.
 */
const embedUrl = computed(() => {
    const url = props.locationUrl?.trim();
    if (!url) return null;
    if (url.includes('/maps/embed') || url.includes('output=embed')) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}output=embed`;
});

function openInGoogleMaps() {
    if (!props.locationUrl) return;
    window.open(props.locationUrl, '_blank', 'noopener,noreferrer');
}
</script>

<template>
    <div class="relative w-full h-36 rounded-xl overflow-hidden z-0">
        <iframe
            v-if="embedUrl"
            :src="embedUrl"
            :title="`Mapa de ${name}`"
            class="w-full h-full border-0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
        />
        <div
            v-else
            class="w-full h-full bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] flex items-center justify-center"
        >
            <svg class="h-8 w-8 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        </div>
        <button
            v-if="locationUrl"
            @click="openInGoogleMaps"
            class="absolute bottom-2 right-2 z-[400] flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-[#101541] shadow ring-1 ring-black/10 hover:bg-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Ver en Google Maps
        </button>
    </div>
</template>
