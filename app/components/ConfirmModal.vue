<!-- components/ConfirmModal.vue -->
<template>
    <BaseModal v-model="open">
      <template #title>
        {{ title }}
      </template>
  
      <div class="text-[14px] text-gray-700 leading-relaxed">
        <slot>
          {{ message }}
        </slot>
      </div>
  
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            @click="open = false"
          >
            Cancelar
          </button>
  
          <button
            type="button"
            class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition"
            @click="$emit('confirm')"
          >
            Aceptar
          </button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script setup lang="ts">
  import BaseModal from '~/components/BaseModal.vue'
  
  const open = defineModel<boolean>({ required: true })
  
  defineProps<{
    title: string
    message?: string
  }>()
  
  defineEmits<{
    (e: 'confirm'): void
  }>()
  </script>