<script setup lang="ts">
defineProps<{
  name: string;
  address: string;
  phone1?: string | null;
  phone2?: string | null;
  whatsapp?: string | null;
  isActive: boolean;
  locationUrl?: string | null;
}>();

const emit = defineEmits<{ (e: "edit"): void }>();
</script>

<template>
  <div
    class="relative bg-white rounded-2xl shadow p-5 min-w-[240px] max-w-xs transition-opacity"
    :class="!isActive ? 'opacity-60' : ''"
  >
    <div class="flex items-center justify-between mb-1">
      <span class="font-bold text-lg text-[#1E1E1E]">{{ name }}</span>
      <button
        class="text-gray-300 hover:text-pink-400 transition-colors"
        type="button"
        @click="emit('edit')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          class="w-5 h-5"
          viewBox="0 0 24 24"
        >
          <path
            d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4"
          />
        </svg>
      </button>
    </div>

    <div class="mb-3">
      <span
        v-if="!isActive"
        class="inline-flex items-center gap-1 rounded-full bg-black/8 px-2.5 py-0.5 text-[10px] font-semibold text-black/50"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-black/30"></span>
        No disponible
      </span>
    </div>

    <hr class="border-b border-gray-200 my-2" />

    <div class="flex items-center gap-2 text-[#6B7280] mb-2">
      <div class="flex items-center gap-2 text-[#6B7280] mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#f472b6"
          class="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
        <span class="text-sm">{{ address }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 text-[#6B7280] mb-1">
      <div class="flex items-center gap-2 text-[#6B7280] mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#f472b6"
          class="w-5 h-5"
          viewBox="0 0 24 24"
        >
          <path
            d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
          />
        </svg>
        <span v-if="phone1" class="text-sm">{{ formatPhone(phone1) }}</span>
        <span v-else class="text-sm italic text-[#9CA3AF]"
          >Sin teléfono registrado</span
        >
      </div>
    </div>
    <div v-if="phone2" class="flex items-center gap-2 text-[#6B7280] mb-1">
      <div class="flex items-center gap-2 text-[#6B7280] mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#f472b6"
          class="w-5 h-5"
          viewBox="0 0 24 24"
        >
          <path
            d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
          />
        </svg>
        <span class="text-sm">{{ formatPhone(phone2) }}</span>
      </div>
    </div>
    <div v-if="whatsapp" class="flex items-center gap-2 text-[#6B7280]">
      <div class="flex items-center gap-2 text-[#6B7280] mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#f472b6"
          class="w-5 h-5"
          viewBox="0 0 24 24"
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
        <span class="text-sm">{{ formatPhone(whatsapp) }}</span>
      </div>
    </div>

    <BranchMap :location-url="locationUrl" :name="name" class="mt-3" />
  </div>
</template>
