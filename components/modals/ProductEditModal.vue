<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/60"
        @click="close"
      ></div>

      <div
        class="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-2xl ring-1 ring-black/10"
      >
        <!-- Header -->
        <div class="px-5 pt-5 sm:px-6 sm:pt-6">
          <div class="flex items-center justify-between gap-3">
            <div class="flex-1 text-center">
              <h3 class="text-xl font-semibold tracking-tight text-[#1F2937] sm:text-2xl">
                Editar producto
              </h3>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-content-center rounded-full text-black/70 transition hover:bg-black/5"
              aria-label="Cerrar"
              @click="close"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-black/60">
                Nombre
              </label>
              <input
                v-model="form.name"
                type="text"
                class="h-12 w-full rounded-xl bg-black/[0.06] px-4 text-base text-black/75 outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-black/10"
                placeholder="Nombre del producto"
              />
            </div>

            <!-- Categoría -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-black/60">
                Categoría
              </label>
              <div class="relative">
                <select
                  v-model="form.categoryId"
                  class="h-12 w-full appearance-none rounded-xl bg-black/[0.06] px-4 pr-10 text-base text-black/75 outline-none transition focus:ring-2 focus:ring-black/10"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  <option
                    v-for="c in categories"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.name }}
                  </option>
                </select>
                <svg
                  class="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-black/60 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 9l5 5 5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-black/60">
                Descripción
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="min-h-[120px] w-full rounded-xl bg-black/[0.06] px-4 py-3 text-base text-black/75 outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-black/10"
                placeholder="Descripción"
              />
            </div>

            <!-- Imágenes -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-black/60">
                Imágenes
              </label>

              <div class="flex flex-wrap items-center gap-3">
                <div
                  v-for="(pic, idx) in pictures"
                  :key="`${form.id}-${idx}-${pic}`"
                  class="relative"
                >
                  <button
                    type="button"
                    class="h-20 w-20 overflow-hidden rounded-xl bg-[#F3D2E4] ring-1 ring-black/10 transition hover:scale-[1.02]"
                    :class="idx === activeThumb ? 'ring-2 ring-[#111827]' : ''"
                    @click="activeThumb = idx"
                  >
                    <img
                      :src="pic"
                      class="h-full w-full object-cover"
                      alt="Miniatura"
                    />
                  </button>

                  <button
                    type="button"
                    class="absolute -right-1.5 -top-1.5 grid h-8 w-8 place-content-center rounded-full bg-white shadow-md ring-1 ring-black/10 transition hover:bg-red-50"
                    title="Eliminar imagen"
                    @click.stop="askDelete(pic)"
                  >
                    <svg class="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none">
                      <path d="M6 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      <path d="M9 7l1-2h4l1 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      <path d="M7 7l1 14h8l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  class="grid h-20 w-20 place-content-center rounded-xl border border-dashed border-black/20 bg-black/[0.04] transition hover:bg-black/[0.07]"
                  title="Agregar fotografía"
                  @click="fileInput?.click()"
                >
                  <svg class="h-8 w-8 text-black/45" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>

              <input
                ref="fileInput"
                type="file"
                class="hidden"
                multiple
                accept="image/*"
                @change="onPickFiles"
              />
            </div>

            <!-- Error -->
            <div
              v-if="errorMsg"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ errorMsg }}
            </div>

            <!-- Acciones -->
            <div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                class="h-11 min-w-[140px] rounded-xl bg-black/10 px-6 text-base font-semibold text-black/80 transition hover:bg-black/15"
                @click="close"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="h-11 min-w-[140px] rounded-xl bg-[#0F172A] px-6 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saving"
                @click="save"
              >
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        v-model="confirmOpen"
        @confirm="deleteSelectedPicture"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import ConfirmModal from '~/components/modals/ConfirmModal.vue'
import { productsService, type ProductItem } from '~/services/products.service'

type CategoryOption = {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: boolean
  product: ProductItem
  categories: CategoryOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated'): void
}>()

const saving = ref(false)
const errorMsg = ref('')
const activeThumb = ref(0)
const confirmOpen = ref(false)
const selectedToDelete = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const categories = computed(() => props.categories || [])

const form = reactive({
  id: '',
  name: '',
  description: '',
  isFavorite: false,
  isActive: true,
  categoryId: '',
})

watch(
  () => [props.modelValue, props.product] as const,
  ([isOpen]) => {
    if (!isOpen || !props.product) return

    errorMsg.value = ''
    form.id = props.product.id
    form.name = props.product.name || ''
    form.description = props.product.description || ''
    form.isFavorite = !!props.product.isFavorite
    form.isActive = !!props.product.isActive
    form.categoryId = props.product.category?.id || ''
    activeThumb.value = 0
    selectedToDelete.value = ''
    confirmOpen.value = false
  },
  { immediate: true }
)

const pictures = computed(() => {
  return props.product?.pictures?.map((p) => p.imageUrl).filter(Boolean) ?? []
})

function close() {
  emit('update:modelValue', false)
}

function askDelete(url: string) {
  selectedToDelete.value = url
  confirmOpen.value = true
}

function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const files = Array.from(input.files)
  input.value = ''
  upload(files)
}

async function upload(files: File[]) {
  errorMsg.value = ''
  saving.value = true

  try {
    await productsService.uploadPictures({
      id: props.product.id,
      name: form.name.trim(),
      description: form.description.trim(),
      isFavorite: !!form.isFavorite,
      categoryId: form.categoryId,
      isActive: !!form.isActive,
      files,
    })

    emit('updated')
  } catch (e: any) {
    errorMsg.value = normalizeError(e, 'No se pudieron subir las fotos.')
  } finally {
    saving.value = false
  }
}

async function save() {
  errorMsg.value = ''
  saving.value = true

  try {
    await productsService.patchProduct({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      isFavorite: !!form.isFavorite,
      categoryId: form.categoryId,
      isActive: !!form.isActive,
    })

    emit('updated')
    close()
  } catch (e: any) {
    errorMsg.value = normalizeError(e, 'No se pudo actualizar el producto.')
  } finally {
    saving.value = false
  }
}

async function deleteSelectedPicture() {
  // Aquí conectamos luego el endpoint real.
  selectedToDelete.value = ''
  emit('updated')
}

function normalizeError(error: any, fallback: string) {
  const data = error?.data ?? error?.response?._data ?? error?.response?.data

  if (Array.isArray(data)) return data.join(', ')
  if (typeof data === 'string') return data

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]
    if (Array.isArray(firstValue)) return String(firstValue[0] ?? fallback)
    if (typeof firstValue === 'string') return firstValue
  }

  return error?.message || fallback
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && !confirmOpen.value) {
    close()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>