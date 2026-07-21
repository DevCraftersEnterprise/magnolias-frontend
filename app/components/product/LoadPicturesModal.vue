<script setup lang="ts">
import { productsService } from "~/services/products.service";
import type { ProductItem } from "~/types/product.types";
import { useToast } from "vue-toastification";

const props = defineProps<{
  open: boolean;
  product: ProductItem;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "uploaded"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref<File[]>([]);
const previews = ref<string[]>([]);
const saving = ref(false);
const toast = useToast();

watch(
  () => props.open,
  (v) => {
    if (!v) return;
    files.value = [];
    previews.value = [];
  },
);

function addFiles(list: FileList | File[]) {
  const arr = Array.from(list);
  arr.forEach((f) => {
    if (!f.type.startsWith("image/")) return;
    files.value.push(f);
    previews.value.push(URL.createObjectURL(f));
  });
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  addFiles(input.files);
  input.value = "";
}

function onDrop(e: DragEvent) {
  if (!e.dataTransfer?.files) return;
  addFiles(e.dataTransfer.files);
}

function removeAt(i: number) {
  const url = previews.value[i];
  if (url) URL.revokeObjectURL(url);
  files.value.splice(i, 1);
  previews.value.splice(i, 1);
}

function clearFiles() {
  previews.value.forEach((u) => URL.revokeObjectURL(u));
  files.value = [];
  previews.value = [];
}

async function upload() {
  saving.value = true;
  try {
    await productsService.uploadPictures({
      id: props.product.id,
      name: props.product.name,
      description: props.product.description,
      isFavorite: props.product.isFavorite,
      categoryId: props.product.category.id,
      isActive: props.product.isActive,
      files: files.value,
    });

    clearFiles();
    toast.success("Fotos subidas correctamente.");
    emit("uploaded");
    emit("close");
  } catch (e: any) {
    toast.error(e?.message || "No se pudieron subir las fotos.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UiBaseModal :model-value="open" @update:model-value="emit('close')">
    <template #title>Agregar fotografía</template>
    <div class="space-y-4">
      <!-- Dropzone -->
      <div
        class="rounded-2xl border border-dashed border-black/20 bg-black/5 p-6 text-center"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <div
          class="mx-auto grid h-12 w-12 place-content-center rounded-xl bg-white shadow-sm ring-1 ring-black/5"
        >
          <svg class="h-6 w-6 text-black/60" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M7 10l5-5 5 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5 19h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <p class="mt-3 text-sm font-semibold text-black/70">
          Arrastre o haga click para agregar archivo
        </p>
        <p class="mt-1 text-xs text-black/45">
          PNG, JPG. Puede subir varias fotos.
        </p>

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          multiple
          accept="image/*"
          @change="onPick"
        />

        <button
          type="button"
          class="mt-4 h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:shadow"
          @click="fileInput?.click()"
        >
          Elegir archivos
        </button>
      </div>

      <!-- Preview list -->
      <div v-if="files.length" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-black/60">
            Seleccionadas ({{ files.length }})
          </p>

          <button
            type="button"
            class="text-xs font-semibold text-red-600 hover:underline"
            @click="clearFiles"
          >
            Limpiar
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(f, idx) in files"
            :key="idx"
            class="relative overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10"
          >
            <img :src="previews[idx]" class="h-20 w-full object-cover" />
            <button
              type="button"
              class="absolute right-1 top-1 grid h-7 w-7 place-content-center rounded-lg bg-white/90 ring-1 ring-black/10 hover:bg-white"
              @click="removeAt(idx)"
              title="Quitar"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="h-10 rounded-xl bg-black/10 px-4 text-sm font-semibold text-black/80 hover:bg-black/15"
          @click="emit('close')"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="h-10 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          :disabled="saving || files.length === 0"
          @click="upload"
        >
          {{ saving ? "Subiendo..." : "Aceptar" }}
        </button>
      </div>
    </div>
  </UiBaseModal>
</template>
