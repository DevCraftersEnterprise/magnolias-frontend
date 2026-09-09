<script setup lang="ts">
const props = defineProps<{
    address: string;
    name: string;
}>();

const BUSINESS_NAME = 'Pastelería Magnolias';

// Enlace de búsqueda de Google Maps (no requiere API key ni que la
// sucursal tenga un enlace guardado; siempre funciona a partir de la
// dirección de la sucursal). Se arma como
// https://www.google.com/maps/search/Pastelería+Magnolias,+<dirección>
// codificando espacios como "+" y dejando comas/puntos literales, igual
// que el formato que usa Google al compartir una búsqueda.
const mapsUrl = computed(() => {
    const query = `${BUSINESS_NAME}, ${props.address}`;
    const encoded = encodeURIComponent(query)
        .replaceAll('%20', '+')
        .replaceAll('%2C', ',');
    return `https://www.google.com/maps/search/${encoded}`;
});
</script>

<template>
    <a
        :href="mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Ver ${name} en Google Maps`"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Ver en Google Maps
    </a>
</template>
