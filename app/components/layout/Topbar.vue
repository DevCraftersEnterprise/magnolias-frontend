<script setup lang="ts">
defineProps<{ title: string }>();
defineEmits<{ (e: "toggle"): void; (e: "logout"): void }>();
const { user, loading } = useAuthUser();
const { branches, selectedBranch, bakerBranches } = useBranch();
const { viewAsBaker, canToggleViewAs, effectiveRole, enterViewAsBaker, exitViewAs } =
  useViewAs();

const username = computed(() => user.value?.username ?? "...");
const role = computed(() => user.value?.role ?? "");
const isBaker = computed(() => effectiveRole.value === "BAKER");
const canSeeBranchSelect = computed(() =>
  ["ADMIN", "SUPER"].includes(effectiveRole.value),
);

function onToggleViewAs(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) enterViewAsBaker();
  else exitViewAs();
}

const initials = computed(() => {
  const u = user.value?.username?.trim();
  if (!u) return "??";
  return u.slice(0, 2).toUpperCase();
});
</script>

<template>
  <header
    class="h-[86px] bg-white grid grid-cols-[auto_1fr_auto] items-center gap-4 px-[26px] border-b border-black/[0.06] shadow-[0_8px_22px_rgba(0,0,0,0.06)] sticky top-0 z-20 max-[900px]:h-[74px] max-[900px]:px-4 max-[640px]:h-[66px] max-[640px]:px-[14px]"
  >
    <button
      class="w-11 h-11 rounded-[14px] border border-black/[0.08] bg-white cursor-pointer grid place-items-center text-[#111] transition-[background,transform] duration-150 ease-in-out hover:bg-[#f4f4f4] hover:-translate-y-px"
      type="button"
      @click="$emit('toggle')"
      aria-label="Menú"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 7H20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M4 12H20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M4 17H20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <div class="flex items-center gap-[14px] justify-self-start min-w-0">
      <h1
        class="text-[28px] font-semibold m-0 text-[#111] max-[900px]:text-[22px] max-[640px]:hidden"
      >
        {{ title }}
      </h1>

      <!-- Aviso de vista simulada como pastelero -->
      <div
        v-if="viewAsBaker"
        class="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl py-[6px] pl-3 pr-[6px]"
      >
        <span class="text-[12px] font-semibold text-amber-700 whitespace-nowrap"
          >Viendo como: PASTELERO</span
        >
        <button
          type="button"
          class="text-[11px] font-semibold text-amber-700 underline hover:text-amber-900"
          @click="exitViewAs"
        >
          Salir
        </button>
      </div>

      <!-- ADMIN / SUPER: selector de todas las sucursales -->
      <div
        v-if="canSeeBranchSelect && branches.length > 0"
        class="relative flex items-center"
      >
        <svg
          class="absolute left-[10px] w-[15px] h-[15px] text-pink-400 pointer-events-none z-[1]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
        <select
          class="appearance-none bg-white border border-black/10 rounded-xl py-[7px] pl-[32px] pr-[34px] text-sm font-semibold text-[#101541] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] outline-none transition-[border-color,box-shadow] duration-150 max-w-[200px] focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(244,114,182,0.15)] max-[900px]:max-w-[140px] max-[900px]:text-[13px] max-[640px]:max-w-[140px] max-[640px]:text-xs max-[640px]:py-[6px] max-[640px]:px-[28px]"
          :value="selectedBranch?.id ?? ''"
          @change="
            (e) => {
              const v = (e.target as HTMLSelectElement).value;
              selectedBranch = v
                ? (branches.find((b) => b.id === v) ?? null)
                : null;
            }
          "
        >
          <option value="">Todas las sucursales</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
        <svg
          class="absolute right-[9px] w-[14px] h-[14px] text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <!-- BAKER: selector entre sus sucursales asignadas -->
      <div
        v-else-if="isBaker && bakerBranches.length > 1"
        class="relative flex items-center"
      >
        <svg
          class="absolute left-[10px] w-[15px] h-[15px] text-pink-400 pointer-events-none z-[1]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
        <select
          class="appearance-none bg-white border border-black/10 rounded-xl py-[7px] pl-[32px] pr-[34px] text-sm font-semibold text-[#101541] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] outline-none transition-[border-color,box-shadow] duration-150 max-w-[200px] focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(244,114,182,0.15)] max-[900px]:max-w-[140px] max-[900px]:text-[13px] max-[640px]:max-w-[140px] max-[640px]:text-xs max-[640px]:py-[6px] max-[640px]:px-[28px]"
          :value="selectedBranch?.id ?? ''"
          @change="
            (e) => {
              const v = (e.target as HTMLSelectElement).value;
              selectedBranch = v
                ? (bakerBranches.find((b) => b.id === v) ?? null)
                : null;
            }
          "
        >
          <option v-for="b in bakerBranches" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
        <svg
          class="absolute right-[9px] w-[14px] h-[14px] text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <!-- Otros roles con sucursal única: solo lectura -->
      <div
        v-else-if="!canSeeBranchSelect && selectedBranch"
        class="flex items-center gap-[6px] bg-[#fdf2f8] border border-pink-200 rounded-xl pt-[6px] pb-[6px] pl-[10px] pr-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-[14px] h-[14px] text-pink-400 shrink-0"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
        <span
          class="text-[13px] font-semibold text-[#101541] whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] max-[640px]:max-w-[120px] max-[640px]:text-xs"
          >{{ selectedBranch?.name }}</span
        >
      </div>
    </div>

    <div class="flex items-center gap-3 justify-self-end bg-transparent">
      <!-- SUPER/ADMIN: interruptor para previsualizar la vista de pastelero -->
      <label
        v-if="canToggleViewAs"
        class="hidden items-center gap-2 cursor-pointer select-none min-[900px]:flex"
      >
        <span class="text-[12px] font-medium text-gray-500 whitespace-nowrap"
          >Ver como pastelero</span
        >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 accent-[#FC9AD3]"
          :checked="viewAsBaker"
          @change="onToggleViewAs"
        />
      </label>

      <div
        class="w-[46px] h-[46px] rounded-full bg-[#f3b7d1] grid place-items-center text-[#1a1a1a] font-bold shadow-[0_6px_14px_rgba(0,0,0,0.08)] shrink-0 max-[640px]:w-9 max-[640px]:h-9 max-[640px]:text-[13px]"
      >
        {{ initials }}
      </div>

      <div class="flex flex-col leading-[1.1] max-[640px]:hidden">
        <div class="font-bold text-sm text-[#1a1a1a]">
          <span v-if="loading">Cargando…</span>
          <span v-else>{{ username }}</span>
        </div>
        <div class="text-xs text-[#7a7a7a] mt-0.5">{{ role }}</div>
      </div>

      <button
        class="w-[42px] h-[42px] rounded-full border-none bg-transparent cursor-pointer grid place-items-center text-[#1a1a1a] shrink-0 transition-[background,transform] duration-150 ease-in-out hover:bg-[#fbeaf2] hover:-translate-y-px max-[640px]:w-9 max-[640px]:h-9"
        type="button"
        title="Cerrar sesión"
        @click="$emit('logout')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M16 12H4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M7 9l-3 3 3 3"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
