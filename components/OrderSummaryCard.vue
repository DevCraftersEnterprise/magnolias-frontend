<script setup lang="ts">
defineProps<{
    label: string;
    item: {
        key: string;
        label: string;
        value: number;
        icon: string;
        backgroundColor?: string;
        textColor?: string;
    }
}>();

</script>

<template>
    <div
        class="rounded-3xl border border-[#F3DCE8] bg-white p-4 shadow-[0_10px_24px_rgba(226,184,206,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(226,184,206,0.22)]">
        <div class="flex flex-col gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                :style="{ backgroundColor: item.backgroundColor, color: item.textColor }">

                <svg fill="none" class="h-6 w-6" v-if="item.icon === 'created'" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 5v14m-7-7h14" />
                </svg>

                <svg fill="none" class="h-6 w-6" v-else-if="item.icon === 'process'" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
                </svg>

                <svg fill="none" class="h-6 w-6" v-else-if="item.icon === 'done'" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"
                        d="m5 12 4 4 10-9" />
                </svg>

                <svg fill="none" class="h-6 w-6" v-else-if="item.icon === 'delivered'" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-width="2" d="M3 7h11v8H3z" />
                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M14 10h3l2 2v3h-5z" />
                    <circle cx="7" cy="18" r="1.6" fill="currentColor" />
                    <circle cx="17" cy="18" r="1.6" fill="currentColor" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    class="lucide lucide-store-icon lucide-store" v-else-if="item.icon === 'store'" viewBox="0 0 24 24">
                    <path
                        d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5m8.774-10.69a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
                    <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    class="lucide lucide-party-popper-icon lucide-party-popper" v-else-if="item.icon === 'event'"
                    viewBox="0 0 24 24">
                    <path
                        d="M5.8 11.3 2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10m8 3-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17M11 2l.33.82c.34.86-.2 1.82-1.11 1.98-.7.1-1.22.72-1.22 1.43V7" />
                    <path d="M11 13c1.93 1.93 2.83 4.17 2 5s-3.07-.07-5-2-2.83-4.17-2-5 3.07.07 5 2" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    class="lucide lucide-house-icon lucide-house" v-else-if="item.icon === 'delivery'"
                    viewBox="0 0 24 24">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                    <path
                        d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    class="lucide lucide-cake-icon lucide-cake" v-else-if="item.icon === 'custom'" viewBox="0 0 24 24">
                    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                    <path
                        d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3m5-3v3m5-3v3M7 4h.01M12 4h.01M17 4h.01" />
                </svg>

                <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
                    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
            </div>

            <div>
                <p class="text-3xl font-bold text-[#1E1E1E] leading-none">{{ item.value }}</p>
                <p class="mt-1.5 text-[12px] font-semibold text-[#B58A9F] uppercase tracking-wide">{{ item.label }}</p>
            </div>
        </div>
    </div>
</template>