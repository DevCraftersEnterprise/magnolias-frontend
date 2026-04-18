<template>
    <BaseModal v-model="open">
      <template #title>
        {{ mode === 'create' ? 'Agregar color' : 'Editar color' }}
      </template>
  
      <template #subtitle>
        Elige un color y guarda su código en hexadecimal.
      </template>
  
      <div class="space-y-4">
        <div>
          <label class="block text-[12px] font-semibold text-gray-600 mb-1">Nombre</label>
          <input
            v-model.trim="local.name"
            type="text"
            class="w-full h-11 rounded-xl bg-gray-100 px-4 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10"
            placeholder="Ej: Rosa pastel"
          />
        </div>
  
        <div class="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label class="block text-[12px] font-semibold text-gray-600 mb-1">Hex</label>
            <input
              v-model.trim="local.value"
              type="text"
              inputmode="text"
              class="w-full h-11 rounded-xl bg-gray-100 px-4 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10"
              placeholder="#FFB6C1"
              @blur="normalizeHex"
            />
            <p v-if="hexError" class="mt-1 text-[12px] text-red-600">
              {{ hexError }}
            </p>
          </div>
  
          <!-- Picker + preview -->
          <div class="flex items-center gap-3">
            <div
              class="h-11 w-11 rounded-xl border border-black/10 shadow-sm"
              :style="{ backgroundColor: safeHex }"
              title="Vista previa"
            />
            <input
              class="h-11 w-11 cursor-pointer rounded-xl border border-black/10 bg-white p-1"
              type="color"
              :value="safeHex"
              @input="onPickColor"
              aria-label="Selector de color"
            />
          </div>
        </div>
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
            class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!canSave"
            @click="submit"
          >
            Guardar
          </button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import BaseModal from '~/components/BaseModal.vue'
  
  export type ColorEditPayload = {
    id?: string
    name: string
    value: string // "#RRGGBB"
  }
  
  const open = defineModel<boolean>({ required: true })
  
  const props = defineProps<{
    mode: 'create' | 'edit'
    model: ColorEditPayload | null
  }>()
  
  const emit = defineEmits<{
    (e: 'save', payload: ColorEditPayload): void
  }>()
  
  const local = reactive<ColorEditPayload>({
    id: undefined,
    name: '',
    value: '#FFB6C1',
  })
  
  watch(
    () => props.model,
    (m) => {
      local.id = m?.id
      local.name = m?.name ?? ''
      local.value = m?.value ?? '#FFB6C1'
    },
    { immediate: true }
  )
  
  function isValidHex(v: string) {
    return /^#([0-9A-Fa-f]{6})$/.test(v)
  }
  
  const safeHex = computed(() => (isValidHex(local.value) ? local.value : '#000000'))
  
  const hexError = computed(() => {
    if (!local.value) return 'Escribe un color en formato #RRGGBB'
    if (!local.value.startsWith('#')) return 'Debe iniciar con #'
    if (!isValidHex(local.value)) return 'Formato inválido. Ej: #FFB6C1'
    return ''
  })
  
  const canSave = computed(() => {
    return !!local.name && !hexError.value
  })
  
  function normalizeHex() {
    if (!local.value) return
    if (!local.value.startsWith('#')) local.value = `#${local.value}`
    local.value = local.value.toUpperCase()
  }
  
  function onPickColor(e: Event) {
    const v = (e.target as HTMLInputElement).value
    local.value = v.toUpperCase()
  }
  
  function submit() {
    normalizeHex()
    if (!canSave.value) return
    emit('save', { id: local.id, name: local.name, value: local.value })
  }
  </script>