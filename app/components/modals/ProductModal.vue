<template>
  <BaseModal :title="mode === 'create' ? 'Agregar producto' : (productTitle || 'Editar producto')"
    @close="emit('close')">
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="text-xs font-semibold text-black/60">Nombre del producto</label>
        <input v-model="form.name"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Nombre del producto" required />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60">Descripción</label>
        <textarea v-model="form.description" rows="4"
          class="mt-1 w-full rounded-xl bg-black/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Descripción" required></textarea>
      </div>

      <div v-if="errorMsg" class="rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
        {{ errorMsg }}
      </div>

      <div class="mt-2 flex justify-end gap-2">
        <button type="button"
          class="h-10 rounded-xl bg-black/10 px-4 text-sm font-semibold text-black/80 hover:bg-black/15"
          @click="emit('close')">
          Cancelar
        </button>

        <button type="submit"
          class="h-10 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          :disabled="saving">
          {{ saving ? 'Guardando...' : (mode === 'create' ? 'Siguiente' : 'Guardar') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/modals/BaseModal.vue'
import { productsService, type ProductItem } from '~/services/products.service'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  categoryId: string
  product?: ProductItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', product: ProductItem): void
  (e: 'saved'): void
}>()

const saving = ref(false)
const errorMsg = ref('')
const form = reactive({
  name: '',
  description: '',
})

const productTitle = computed(() => (props.product?.name ? props.product.name : ''))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    errorMsg.value = ''
    form.name = props.mode === 'edit' ? (props.product?.name ?? '') : ''
    form.description = props.mode === 'edit' ? (props.product?.description ?? '') : ''
  },
  { immediate: true }
)

async function onSubmit() {
  errorMsg.value = ''
  saving.value = true
  try {
    if (props.mode === 'create') {
      const created = await productsService.createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        isFavorite: false,
        categoryId: props.categoryId,
      })
      emit('created', created)
      emit('close')
      return
    }

    // EDIT lo vemos luego (cuando definas patch de product)
    emit('saved')
    emit('close')
  } catch (e: any) {
    errorMsg.value = e?.message || 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}
</script>