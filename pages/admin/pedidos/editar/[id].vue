<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Editar Pedido · Magnolias' })

import {
  customersService,
  type CustomerItem,
} from '~/services/customers.service'
import { catalogsService, type FlowerItem, type ColorItem, type BreadTypeItem, type FillingItem, type FlavorItem, type FrostingItem, type StyleItem } from '~/services/catalogs.service'
import { usersService, type UserItem } from '~/services/users.service'
import { productsService, getProductImageUrl } from '~/services/products.service'
import type { ProductItem } from '~/services/categories.service'
import {
  ordersService,
  type UpdateOrderDetailPayload,
  type UpdateOrderPayload,
  type CreateOrderDeliveryAddress,
  type OrderDetail,
} from '~/services/orders.service'

const router  = useRouter()
const routeP  = useRoute()
const orderId = routeP.params.id as string

// ─── Loading state ───────────────────────────────────────────────────────────
const loadingOrder = ref(true)
const loadError    = ref('')

// ─── Stepper ─────────────────────────────────────────────────────────────────
const STEPS = ['Cliente', 'Tipo y logística', 'Productos', 'Pago'] as const
const step  = ref(1)

// ─── Draft data ───────────────────────────────────────────────────────────────
const selectedCustomer = ref<CustomerItem | null>(null)

// ─── Step 1 — Customer search ─────────────────────────────────────────────────
const phoneQuery  = ref('')
const searching   = ref(false)
const searchError = ref('')
const results     = ref<CustomerItem[]>([])
const hasSearched = ref(false)

async function searchByPhone() {
  const digits = phoneQuery.value.replace(/\D/g, '').trim()
  if (!digits) return
  searching.value   = true
  searchError.value = ''
  hasSearched.value = true
  try {
    const data = await customersService.getCustomers({ phone: digits, isActive: true, limit: 10 })
    results.value = data.items ?? []
  } catch (e: any) {
    searchError.value = e?.message || 'Error al buscar.'
    results.value = []
  } finally {
    searching.value = false
  }
}

function selectCustomer(c: CustomerItem) {
  selectedCustomer.value = c
}

// ─── Step 1 — Inline registration ────────────────────────────────────────────
const showRegister  = ref(false)
const registering   = ref(false)
const registerError = ref('')
const regForm = reactive({
  fullName: '', phone: '', email: '', notes: '',
  withAddress: false,
  address: { street: '', number: '', neighborhood: '', city: '', postalCode: '', interphoneCode: '', betweenStreets: '', reference: '', addressNotes: '' },
})

watch(showRegister, (open) => {
  if (open) {
    regForm.phone       = phoneQuery.value.trim()
    regForm.fullName    = ''
    regForm.email       = ''
    regForm.notes       = ''
    regForm.withAddress = false
    regForm.address     = { street: '', number: '', neighborhood: '', city: '', postalCode: '', interphoneCode: '', betweenStreets: '', reference: '', addressNotes: '' }
    registerError.value = ''
  }
})

const canRegister = computed(() => {
  if (!regForm.fullName.trim() || !regForm.phone.trim()) return false
  if (regForm.withAddress) {
    if (!regForm.address.street.trim()) return false
    if (!regForm.address.number.trim()) return false
    if (!regForm.address.neighborhood.trim()) return false
  }
  return true
})

async function registerAndSelect() {
  if (!canRegister.value) return
  registering.value   = true
  registerError.value = ''
  try {
    const payload = {
      fullName: regForm.fullName.trim(),
      phone:    regForm.phone.trim(),
      email:    regForm.email.trim() || null,
      notes:    regForm.notes.trim() || null,
      address:  regForm.withAddress ? {
        street:         regForm.address.street.trim(),
        number:         regForm.address.number.trim(),
        neighborhood:   regForm.address.neighborhood.trim(),
        city:           regForm.address.city.trim() || null,
        postalCode:     regForm.address.postalCode.trim() || null,
        interphoneCode: regForm.address.interphoneCode.trim() || null,
        betweenStreets: regForm.address.betweenStreets.trim() || null,
        reference:      regForm.address.reference.trim() || null,
        notes:          regForm.address.addressNotes.trim() || null,
      } : null,
    }
    const created = await customersService.createCustomer(payload)
    selectedCustomer.value = created
    results.value          = [created]
    hasSearched.value      = true
    phoneQuery.value       = created.phone
    showRegister.value     = false
  } catch (e: any) {
    registerError.value = e?.message || 'No se pudo registrar el cliente.'
  } finally {
    registering.value = false
  }
}

// ─── Step 2 — Tipo y logística ───────────────────────────────────────────────
type OrderTypeKey = 'DOMICILIO' | 'VITRINA' | 'FLOR' | 'EVENTO'

const ORDER_TYPES: { key: OrderTypeKey; label: string; sub: string; icon: string }[] = [
  { key: 'DOMICILIO', label: 'Domicilio', sub: 'Entrega a domicilio', icon: 'delivery' },
  { key: 'VITRINA',   label: 'Vitrina',   sub: 'Venta en mostrador', icon: 'shop'     },
  { key: 'FLOR',      label: 'Flor',      sub: 'Pedido con flores',  icon: 'flower'   },
  { key: 'EVENTO',    label: 'Evento',    sub: 'Evento especial',    icon: 'event'    },
]

const { branches, selectedBranch: topbarBranch } = useBranch()

const flowerCatalog = ref<FlowerItem[]>([])
const colorCatalog  = ref<ColorItem[]>([])
catalogsService.getFlowers(100, 0, true).then(r => { flowerCatalog.value = r.items }).catch(() => {})
catalogsService.getColors().then(r => { colorCatalog.value = r }).catch(() => {})

const usersCatalog = ref<UserItem[]>([])
usersService.getUsers({ limit: 100 }).then(r => { usersCatalog.value = r.items }).catch(() => {})

// ─── Step 3 — Productos ───────────────────────────────────────────────────────
const breadTypes = ref<BreadTypeItem[]>([])
const fillings   = ref<FillingItem[]>([])
const flavors    = ref<FlavorItem[]>([])
const frostings  = ref<FrostingItem[]>([])
const styles     = ref<StyleItem[]>([])

Promise.all([
  catalogsService.getBreadTypes(100, 0).then(r => { breadTypes.value = r.items }),
  catalogsService.getFillings(100, 0).then(r => { fillings.value = r.items }),
  catalogsService.getFlavors(100, 0).then(r => { flavors.value = r.items }),
  catalogsService.getFrostings(100, 0, true).then(r => { frostings.value = r.items }),
  catalogsService.getStyles(100, 0, true).then(r => { styles.value = r.items }),
]).catch(() => {})

const productQuery     = ref('')
const productSearching = ref(false)
const productResults   = ref<ProductItem[]>([])
const showProductPanel = ref(false)

let productSearchTimer: ReturnType<typeof setTimeout> | null = null
watch(productQuery, (q) => {
  if (productSearchTimer) clearTimeout(productSearchTimer)
  const trimmed = q.trim()
  if (!trimmed) { productResults.value = []; showProductPanel.value = false; return }
  productSearchTimer = setTimeout(() => {
    productSearching.value = true
    productsService.getProducts(12, 0, { name: trimmed })
      .then(r => { productResults.value = r.items; showProductPanel.value = true })
      .catch(() => { productResults.value = [] })
      .finally(() => { productSearching.value = false })
  }, 400)
})

const openColorPicker = ref<string | null>(null)
function colorPickerKey(prefix: string, index: number) { return `${prefix}-${index}` }
function pickColor(rowRef: { colorId: string }, colorId: string, key: string) {
  rowRef.colorId = colorId; openColorPicker.value = null
}
function colorName(colorId: string) { return colorCatalog.value.find(c => c.id === colorId)?.name ?? '' }
function colorHex(colorId: string) { return colorCatalog.value.find(c => c.id === colorId)?.value ?? '' }

if (typeof window !== 'undefined') {
  document.addEventListener('click', () => { openColorPicker.value = null })
}

const UBICACION_OPTIONS = [
  { value: 'TOP',    label: 'Arriba'  },
  { value: 'BOTTOM', label: 'Abajo'   },
  { value: 'CENTER', label: 'Centro'  },
  { value: 'FRONT',  label: 'Frente'  },
  { value: 'BACK',   label: 'Atrás'   },
  { value: 'SIDE',   label: 'Lado'    },
]

const MANGA_OPTIONS = [
  { value: 'NONE',         label: 'Ninguna'     },
  { value: 'TOP',          label: 'Arriba'       },
  { value: 'BOTTOM',       label: 'Abajo'        },
  { value: 'BOTH_BORDERS', label: 'Ambos bordes' },
  { value: 'FULL',         label: 'Completa'     },
]

type OrderProductRow = {
  product:   ProductItem
  qty:       number
  price:     number
  sizeId:    string
  colorId:   string
  breadId:   string
  flavorId:  string
  fillingId: string
  frostingId:string
  styleId:   string
  withText:  boolean
  text:      string
  textLocation: string
  mangaStyle:  string
  mangaNotes:  string
  customSize: string
  notes:     string
  withReference: boolean
  referenceFile: File | null
  referencePreview: string
}

const orderProducts = ref<OrderProductRow[]>([])

function makeProductRow(p: ProductItem): OrderProductRow {
  return {
    product: p, qty: 1, price: 0,
    sizeId: '', colorId: '', breadId: '', flavorId: '',
    fillingId: '', frostingId: '', styleId: '',
    withText: false, text: '', textLocation: 'TOP',
    mangaStyle: '', mangaNotes: '', customSize: '',
    notes: '', withReference: false, referenceFile: null, referencePreview: '',
  }
}

function addProduct(p: ProductItem) {
  const existing = orderProducts.value.find(r => r.product.id === p.id)
  if (existing) { existing.qty++ } else { orderProducts.value.push(makeProductRow(p)) }
  productQuery.value = ''; productResults.value = []; showProductPanel.value = false
}

function removeProduct(i: number) {
  const row = orderProducts.value[i]
  if (row?.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview)
  orderProducts.value.splice(i, 1)
}

const refModal = reactive({ open: false, rowIndex: -1, preview: '' })
function openRefModal(i: number) {
  refModal.rowIndex = i; refModal.preview = orderProducts.value[i]?.referencePreview ?? ''; refModal.open = true
}
function onRefFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const row = orderProducts.value[refModal.rowIndex]
  if (!row) return
  if (row.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview)
  row.referenceFile    = file
  row.referencePreview = URL.createObjectURL(file)
  refModal.preview     = row.referencePreview
}
function confirmRefImage() { refModal.open = false }
function removeRefImage(i: number) {
  const row = orderProducts.value[i]
  if (!row) return
  if (row.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview)
  row.referenceFile = null; row.referencePreview = ''; row.withReference = false
}

onUnmounted(() => {
  orderProducts.value.forEach(r => { if (r.referenceFile && r.referencePreview) URL.revokeObjectURL(r.referencePreview) })
})

type FlowerRow = { flowerId: string; colorId: string; quantity: number | ''; note: string }
const flowerRows = ref<FlowerRow[]>([{ flowerId: '', colorId: '', quantity: '', note: '' }])
function addFlowerRow() { flowerRows.value.push({ flowerId: '', colorId: '', quantity: '', note: '' }) }
function removeFlowerRow(i: number) { if (flowerRows.value.length > 1) flowerRows.value.splice(i, 1) }

const step2 = reactive({
  orderType:      null as OrderTypeKey | null,
  deliveryDate:   '',
  deliveryTime:   '',
  deliveryRound:  '',
  useCustomerAddr: false,
  newAddr: {
    street: '', number: '', neighborhood: '', city: '',
    postalCode: '', interphoneCode: '', betweenStreets: '',
    reference: '', deliveryNotes: '',
  },
  receiverName:   '',
  receiverPhone:  '',
  interphoneCode: '',
  reference:      '',
  betweenStreets: '',
  deliveryNotes:  '',
  pickupBranchId: '',
  pickupDate:     '',
  pickupTime:     '',
  eventMontageDate:    '',
  eventExitTime:       '',
  eventGuestCount:     '' as number | '',
  eventResponsibleId:  '',
  eventServices: { dessertTable: false, cake: false, montage: false },
})

const florMode = ref<'domicilio' | 'vitrina'>('domicilio')

watch(() => step2.orderType, (type) => {
  if (type === 'VITRINA') step2.pickupBranchId = topbarBranch.value?.id ?? ''
  if (type !== 'FLOR') florMode.value = 'domicilio'
})

watch(selectedCustomer, (c) => {
  step2.useCustomerAddr = !!(c?.address?.street)
})

const customerHasAddress = computed(() => !!(selectedCustomer.value?.address?.street))
const customerAddressFormatted = computed(() => {
  const a = selectedCustomer.value?.address
  if (!a) return ''
  return [a.street, a.number ? `#${a.number}` : null, a.neighborhood, a.city].filter(Boolean).join(', ')
})
const needsDelivery = computed(() =>
  step2.orderType !== null && step2.orderType !== 'VITRINA' &&
  !(step2.orderType === 'FLOR' && florMode.value === 'vitrina')
)

const MINUTE_OPTIONS = ['00', '15', '30', '45']
function buildTime24(h12: number, minute: string, period: 'AM' | 'PM'): string {
  let h = h12 % 12
  if (period === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

function parseTime24(t: string): { h: number; m: string; p: 'AM' | 'PM' } {
  const [hStr, mStr] = t.split(':')
  const h24 = parseInt(hStr ?? '8', 10)
  const m   = mStr ?? '00'
  const p   = h24 < 12 ? 'AM' : 'PM'
  const h   = h24 % 12 || 12
  // Round to nearest MINUTE_OPTIONS slot
  const mNum = parseInt(m, 10)
  const mSnap = MINUTE_OPTIONS.reduce((prev, cur) => Math.abs(parseInt(cur) - mNum) < Math.abs(parseInt(prev) - mNum) ? cur : prev, '00')
  return { h, m: mSnap, p }
}

const pickupTimeParts   = reactive({ h: 8, m: '00', p: 'AM' as 'AM' | 'PM' })
const deliveryTimeParts = reactive({ h: 8, m: '00', p: 'AM' as 'AM' | 'PM' })
const exitTimeParts     = reactive({ h: 8, m: '00', p: 'AM' as 'AM' | 'PM' })
watch(pickupTimeParts,   pts => { step2.pickupTime   = buildTime24(pts.h, pts.m, pts.p) })
watch(deliveryTimeParts, pts => { step2.deliveryTime  = buildTime24(pts.h, pts.m, pts.p) })
watch(exitTimeParts,     pts => { step2.eventExitTime = buildTime24(pts.h, pts.m, pts.p) })

function timeToMinutes(t: string) {
  if (!t) return -1
  const parts = t.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
}
const pickupTimeOutOfHours  = computed(() => { const m = timeToMinutes(step2.pickupTime); return m >= 0 && (m < 480 || m >= 1200) })
const deliveryTimeOutOfHours = computed(() => {
  const m = timeToMinutes(step2.deliveryTime)
  if (m < 0) return false
  if (step2.orderType === 'EVENTO') return m < 420
  return m < 480 || m >= 1200
})
const deliveryTimeWarningMsg = computed(() =>
  step2.orderType === 'EVENTO'
    ? 'La hora del evento parece muy temprana (antes de las 7:00 AM). ¿Estás seguro?'
    : 'La hora seleccionada está fuera del horario de atención (8:00 AM\u2013\u200B7:59 PM). ¿Estás seguro?'
)
const exitTimeOutOfHours = computed(() => { const m = timeToMinutes(step2.eventExitTime); return m >= 0 && m < 420 })

function onPhoneInput(e: Event, setter: (v: string) => void) {
  const input = e.target as HTMLInputElement
  const clean = input.value.replace(/\D/g, '').slice(0, 10)
  input.value = clean; setter(clean)
}
const minDeliveryDate = computed(() => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
})
const step2AddressValid = computed(() => {
  if (!needsDelivery.value) return true
  if (step2.useCustomerAddr) return true
  return !!(step2.newAddr.street.trim() && step2.newAddr.number.trim() && step2.newAddr.neighborhood.trim())
})

// ─── Step 4 — Pago ─────────────────────────────────────────────────────────
const PAYMENT_TYPES = [
  { value: 'EFECTIVO',      label: 'Efectivo'       },
  { value: 'TARJETA',       label: 'Tarjeta'        },
  { value: 'TRANSFERENCIA', label: 'Transferencia'  },
]

const ORDER_TYPE_LABELS: Record<string, string> = {
  DOMICILIO: 'Domicilio', VITRINA: 'Vitrina', FLOR: 'Flor', EVENTO: 'Evento',
}

const step4 = reactive({ paymentType: 'EFECTIVO', paymentMode: 'FULL' as 'FULL' | 'DEPOSIT', depositAmount: 0, requiresInvoice: false })
const serviceCost = ref<number>(0)

const detailModal = reactive({ open: false, rowIndex: -1 })
const detailRow   = computed(() => detailModal.rowIndex >= 0 ? (orderProducts.value[detailModal.rowIndex] ?? null) : null)
function openDetailModal(i: number) { detailModal.rowIndex = i; detailModal.open = true }
function closeDetailModal()         { detailModal.open = false }

function catalogLabel(arr: { id: string; name: string }[], id: string) { return arr.find(x => x.id === id)?.name ?? '—' }
function optionLabel(opts: { value: string; label: string }[], val: string) { return opts.find(o => o.value === val)?.label ?? '—' }
function formatMXN(n: number) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0) }
function formatDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`
}
function formatTime(t: string) {
  if (!t) return ''
  const parts = t.split(':'); const h = parseInt(parts[0] ?? '0', 10)
  return `${h % 12 || 12}:${parts[1] ?? '00'} ${h < 12 ? 'AM' : 'PM'}`
}
function formatCustomerAddress(c: CustomerItem) {
  const a = c.address
  if (!a) return ''
  return [a.street, a.number ? `#${a.number}` : null, a.neighborhood, a.city].filter(Boolean).join(', ')
}

const subtotal   = computed(() => orderProducts.value.reduce((s, r) => s + r.price * r.qty, 0))
const orderTotal = computed(() => subtotal.value + (serviceCost.value || 0))
const remaining  = computed(() => orderTotal.value - (step4.depositAmount || 0))

const detailRowHasDetails = computed(() => {
  const r = detailRow.value; if (!r) return false
  return !!(r.sizeId || r.colorId || r.breadId || r.flavorId || r.fillingId ||
            r.frostingId || r.styleId || (r.withText && r.text) ||
            (r.mangaStyle && r.mangaStyle !== 'NONE') || r.notes || r.referencePreview)
})

const step4PickupBranchName = computed(() => branches.value.find(b => b.id === step2.pickupBranchId)?.name ?? '')
const step4DeliveryAddr = computed(() => {
  if (step2.orderType === 'VITRINA') return ''
  const a = step2.useCustomerAddr ? selectedCustomer.value?.address : step2.newAddr
  if (!a) return ''
  return [a.street, (a as any).number ? `#${(a as any).number}` : null, (a as any).neighborhood, a.city].filter(Boolean).join(', ')
})

// ─── Navigation ──────────────────────────────────────────────────────────────
const canNext = computed(() => {
  if (step.value === 1) return !!selectedCustomer.value
  if (step.value === 2) {
    if (!step2.orderType) return false
    if (step2.orderType === 'VITRINA') return !!(step2.pickupBranchId && step2.pickupDate)
    if (!step2.deliveryDate) return false
    if (!step2AddressValid.value) return false
    return true
  }
  if (step.value === 3) {
    if (orderProducts.value.length === 0) return false
    return orderProducts.value.every(r => r.price > 0 && (!r.withText || r.text.trim()) && (!r.withReference || !!r.referenceFile || !!r.referencePreview))
  }
  return true
})

// ─── Populate wizard from loaded order ───────────────────────────────────────
function populateFromOrder(order: OrderDetail) {
  // Customer
  if (order.customer) {
    const c = order.customer
    selectedCustomer.value = {
      id: c.id, fullName: c.fullName,
      phone: c.phone ?? '', alternativePhone: null,
      email: c.email ?? null, notes: c.notes ?? null,
      isActive: c.isActive ?? true,
      address: c.address ? {
        id: '', street: c.address.street ?? null, number: c.address.number ?? null,
        neighborhood: c.address.neighborhood ?? null, city: c.address.city ?? null,
        postalCode: null, interphoneCode: null, betweenStreets: null,
        reference: null, notes: null, createdAt: '', updatedAt: '',
      } : null,
      createdAt: '', updatedAt: '',
    }
    phoneQuery.value  = c.phone ?? ''
    results.value     = [selectedCustomer.value]
    hasSearched.value = true
  }

  // Order type
  step2.orderType = order.orderType as OrderTypeKey

  // FLOR mode (domicilio vs vitrina)
  if (order.orderType === 'FLOR') {
    florMode.value = order.isCustomerPickup ? 'vitrina' : 'domicilio'
  }

  // Branch
  if (order.branch?.id) step2.pickupBranchId = order.branch.id

  // Collection datetime (VITRINA / FLOR-vitrina)
  if (order.collectionDateTime) {
    step2.pickupDate = order.collectionDateTime.split('T')[0] ?? ''
    const timePart = order.collectionDateTime.split('T')[1]?.substring(0, 5)
    if (timePart) {
      const { h, m, p } = parseTime24(timePart)
      pickupTimeParts.h = h; pickupTimeParts.m = m; pickupTimeParts.p = p
    }
  }

  // Delivery date
  if (order.deliveryDate) {
    step2.deliveryDate = order.deliveryDate.split('T')[0] ?? ''
  }

  // Delivery time
  if (order.deliveryTime) {
    const { h, m, p } = parseTime24(order.deliveryTime)
    deliveryTimeParts.h = h; deliveryTimeParts.m = m; deliveryTimeParts.p = p
  }

  // Delivery round
  const roundRev: Record<string, string> = { ROUND_1: '1', ROUND_2: '2', ROUND_3: '3' }
  if (order.deliveryRound) step2.deliveryRound = roundRev[order.deliveryRound] ?? ''

  // Delivery address
  if (order.deliveryAddress) {
    const da = order.deliveryAddress
    if (da.street) {
      step2.useCustomerAddr          = false
      step2.newAddr.street           = da.street ?? ''
      step2.newAddr.number           = da.number ?? ''
      step2.newAddr.neighborhood     = da.neighborhood ?? ''
      step2.newAddr.city             = da.city ?? ''
      step2.newAddr.postalCode       = da.postalCode ?? ''
      step2.newAddr.betweenStreets   = da.betweenStreets ?? ''
      step2.newAddr.interphoneCode   = da.interphoneCode ?? ''
      step2.newAddr.reference        = da.reference ?? ''
      step2.newAddr.deliveryNotes    = da.deliveryNotes ?? ''
    } else {
      step2.useCustomerAddr = true
    }
    step2.receiverName   = da.receiverName ?? ''
    step2.receiverPhone  = da.receiverPhone ?? ''
    step2.betweenStreets = da.betweenStreets ?? ''
    step2.interphoneCode = da.interphoneCode ?? ''
    step2.reference      = da.reference ?? ''
    step2.deliveryNotes  = da.deliveryNotes ?? ''
  }

  // EVENTO fields
  if (order.orderType === 'EVENTO') {
    step2.eventGuestCount     = order.guestCount ?? ''
    step2.eventResponsibleId  = order.setupPersonName ?? ''
    const svc = order.eventServices ?? []
    step2.eventServices.dessertTable = svc.includes('DESSERT_TABLE')
    step2.eventServices.cake         = svc.includes('CAKE')
    step2.eventServices.montage      = svc.includes('MONTAGE')
    if (order.setupTime) {
      const { h, m, p } = parseTime24(order.setupTime)
      exitTimeParts.h = h; exitTimeParts.m = m; exitTimeParts.p = p
    }
  }

  // Products
  console.log('[editar] ORDER COMPLETO:', JSON.stringify(order, null, 2))
  orderProducts.value = (order.details ?? []).map(d => {
    const product: ProductItem = {
      id: d.product?.id ?? '', name: d.product?.name ?? '',
      description: d.product?.description ?? '',
      isFavorite: d.product?.isFavorite ?? false,
      isActive: d.product?.isActive ?? true,
      category: { id: '' }, createdAt: '', updatedAt: '', pictures: [],
    }
    return {
      product,
      qty:           d.quantity,
      price:         (p => (isNaN(p) ? 0 : p))(parseFloat(String(d.price ?? '0').replace(/[^0-9.]/g, ''))),
      sizeId:        d.productSize ?? '',
      colorId:       d.color?.id ?? '',
      breadId:       d.breadType?.id ?? '',
      flavorId:      d.flavor?.id ?? '',
      fillingId:     d.filling?.id ?? '',
      frostingId:    d.frosting?.id ?? '',
      styleId:       d.style?.id ?? '',
      withText:      d.hasWriting ?? false,
      text:          d.writingText ?? '',
      textLocation:  d.writingLocation ?? 'TOP',
      mangaStyle:    d.pipingLocation ?? '',
      mangaNotes:    d.decorationNotes ?? '',
      customSize:    d.customSize ?? '',
      notes:         d.notes ?? '',
      withReference: !!d.referenceImageUrl,
      referenceFile: null,
      referencePreview: d.referenceImageUrl ?? '',
    }
  })

  // Flowers
  if (order.orderFlowers && order.orderFlowers.length > 0) {
    flowerRows.value = order.orderFlowers.map((f: any) => ({
      flowerId: f.flower?.id ?? f.flowerId ?? '',
      colorId:  f.color?.id ?? f.colorId  ?? '',
      quantity: f.quantity ?? 1,
      note:     f.notes    ?? '',
    }))
  }

  // Payment
  step4.requiresInvoice = order.requiresInvoice ?? false
  const pmRevMap: Record<string, string> = { CASH: 'EFECTIVO', CARD: 'TARJETA', TRANSFER: 'TRANSFERENCIA' }
  step4.paymentType  = pmRevMap[order.paymentMethod ?? ''] ?? 'EFECTIVO'
  const advance      = parseFloat(order.advancePayment ?? '0')
  const total        = parseFloat(order.totalAmount   ?? '0')
  if (advance > 0 && advance < total) {
    step4.paymentMode    = 'DEPOSIT'
    step4.depositAmount  = advance
  } else {
    step4.paymentMode    = 'FULL'
    step4.depositAmount  = 0
  }
  serviceCost.value = parseFloat(order.setupServiceCost ?? '0')
}

// ─── Load order on mount ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const order = await ordersService.getOrder(orderId)
    populateFromOrder(order)
  } catch (e: any) {
    loadError.value = e?.message || 'No se pudo cargar el pedido.'
  } finally {
    loadingOrder.value = false
  }
})

// ─── Submit (update) ─────────────────────────────────────────────────────────
const submitting  = ref(false)
const submitError = ref('')

async function submitOrder() {
  if (!canNext.value || submitting.value) return
  submitting.value  = true
  submitError.value = ''

  try {
    const customer  = selectedCustomer.value!
    const isVitrina = step2.orderType === 'VITRINA' || (step2.orderType === 'FLOR' && florMode.value === 'vitrina')
    const branchId  = isVitrina ? (step2.pickupBranchId || (topbarBranch.value?.id ?? '')) : (topbarBranch.value?.id ?? '')
    const isEvento  = step2.orderType === 'EVENTO'

    const deliveryDateISO = isVitrina
      ? (step2.pickupDate    ? `${step2.pickupDate}T00:00:00Z`    : undefined)
      : (step2.deliveryDate  ? `${step2.deliveryDate}T00:00:00Z`  : undefined)

    const roundMap: Record<string, string> = { '1': 'ROUND_1', '2': 'ROUND_2', '3': 'ROUND_3' }
    const deliveryRound = step2.deliveryRound ? (roundMap[step2.deliveryRound] ?? step2.deliveryRound) : undefined

    const pmMap: Record<string, string> = { EFECTIVO: 'CASH', TARJETA: 'CARD', TRANSFERENCIA: 'TRANSFER' }
    const paymentMethod  = pmMap[step4.paymentType] ?? step4.paymentType
    const advancePayment = step4.paymentMode === 'FULL' ? orderTotal.value : (step4.depositAmount || 0)

    const eventServices: string[] = []
    if (isEvento) {
      if (step2.eventServices.dessertTable) eventServices.push('DESSERT_TABLE')
      if (step2.eventServices.cake)         eventServices.push('CAKE')
      if (step2.eventServices.montage)      eventServices.push('MONTAGE')
    }

    let deliveryAddress: CreateOrderDeliveryAddress | undefined
    if (!isVitrina) {
      if (step2.useCustomerAddr) {
        deliveryAddress = {
          useCustomerAddress: true,
          betweenStreets: step2.betweenStreets || undefined,
          interphoneCode: step2.interphoneCode || undefined,
          reference:      step2.reference      || undefined,
          deliveryNotes:  step2.deliveryNotes  || undefined,
          receiverName:   step2.receiverName   || undefined,
          receiverPhone:  step2.receiverPhone  || undefined,
        }
      } else {
        deliveryAddress = {
          useCustomerAddress: false,
          newAddress: {
            street:         step2.newAddr.street,
            number:         step2.newAddr.number,
            neighborhood:   step2.newAddr.neighborhood,
            city:           step2.newAddr.city          || undefined,
            postalCode:     step2.newAddr.postalCode    || undefined,
            betweenStreets: step2.newAddr.betweenStreets || undefined,
            interphoneCode: step2.newAddr.interphoneCode || undefined,
            reference:      step2.newAddr.reference     || undefined,
          },
          deliveryNotes: step2.newAddr.deliveryNotes || undefined,
          receiverName:  step2.receiverName          || undefined,
          receiverPhone: step2.receiverPhone         || undefined,
        }
      }
    }

    const details: UpdateOrderDetailPayload[] = orderProducts.value.map(r => ({
      productId:       r.product.id,
      price:           r.price,
      quantity:        r.qty,
      productSize:     r.sizeId || undefined,
      customSize:      r.sizeId === 'CUSTOM' ? (r.customSize || undefined) : undefined,
      hasWriting:      r.withText,
      writingText:     r.withText && r.text        ? r.text          : undefined,
      writingLocation: r.withText && r.textLocation ? r.textLocation  : undefined,
      pipingLocation:  r.mangaStyle && r.mangaStyle !== 'NONE' ? r.mangaStyle : undefined,
      decorationNotes: r.mangaNotes  || undefined,
      notes:           r.notes       || undefined,
      breadTypeId:     r.breadId     || undefined,
      colorId:         r.colorId     || undefined,
      fillingId:       r.fillingId   || undefined,
      flavorId:        r.flavorId    || undefined,
      frostingId:      r.frostingId  || undefined,
      styleId:         r.styleId     || undefined,
    }))

    const flowers = (step2.orderType === 'FLOR' || isEvento)
      ? flowerRows.value.filter(f => f.flowerId).map(f => ({
          flowerId: f.flowerId,
          colorId:  f.colorId  || undefined,
          quantity: Number(f.quantity) || 1,
          notes:    f.note     || undefined,
        }))
      : undefined

    const collectionDateTime = isVitrina && step2.pickupDate
      ? `${step2.pickupDate}T${step2.pickupTime || '08:00'}:00Z`
      : undefined

    const payload: UpdateOrderPayload = {
      id:           orderId,
      orderType:    step2.orderType!,
      customerId:   customer.id,
      branchId,
      advancePayment,
      paymentMethod,
      deliveryDate: deliveryDateISO,
      deliveryTime: (!isVitrina && step2.deliveryTime) ? step2.deliveryTime : undefined,
      deliveryRound,
      collectionDateTime,
      ...(isEvento && {
        eventTime:           step2.deliveryTime         || undefined,
        setupTime:           step2.eventExitTime        || undefined,
        branchDepartureTime: step2.eventExitTime        || undefined,
        setupPersonName:     step2.eventResponsibleId   || undefined,
        guestCount:          step2.eventGuestCount ? Number(step2.eventGuestCount) : undefined,
        eventServices:       eventServices.length ? eventServices : undefined,
      }),
      setupServiceCost: serviceCost.value || undefined,
      requiresInvoice: step4.requiresInvoice || undefined,
      deliveryAddress,
      details,
      flowers,
    }

    await ordersService.updateOrder(payload)
    router.push('/admin/pedidos')
  } catch (e: any) {
    submitError.value = e?.message || 'Error al actualizar el pedido. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}

function back() {
  if (step.value === 1) router.push('/admin/pedidos')
  else step.value--
}
function next() {
  if (!canNext.value) return
  if (step.value < STEPS.length) step.value++
}
</script>

<template>
  <section class="min-h-[calc(100vh-86px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-8 lg:py-8">

      <!-- Loading -->
      <div v-if="loadingOrder" class="flex items-center justify-center py-24">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#FC9AD3]" />
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="rounded-2xl bg-red-50 ring-1 ring-red-200 px-6 py-8 text-center">
        <p class="text-[15px] font-semibold text-red-700">{{ loadError }}</p>
        <button type="button" class="mt-4 text-[13px] font-semibold text-red-500 underline" @click="router.push('/admin/pedidos')">
          Volver a pedidos
        </button>
      </div>

      <!-- Wizard (identical structure to crear.vue, data is pre-populated) -->
      <template v-else>

        <!-- ── Page header ──────────────────────────────────────────────── -->
        <div class="flex items-center gap-3 mb-7">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-black/5 transition text-[#111827]"
            title="Atrás"
            @click="back"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h1 class="text-[22px] font-bold text-[#111827]">Editar Pedido</h1>
        </div>

        <!-- ── Stepper ───────────────────────────────────────────────────── -->
        <div class="mb-8">
          <div class="flex items-center">
            <template v-for="(label, idx) in STEPS" :key="label">
              <div class="flex flex-col items-center gap-1.5">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-all duration-300"
                  :class="idx + 1 > step ? 'bg-gray-200 text-gray-400' : 'text-white'"
                  :style="idx + 1 <= step ? { backgroundColor: '#FC9AD3' } : {}"
                >
                  <svg v-if="idx + 1 < step" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <span
                  class="hidden sm:block text-[11px] font-semibold whitespace-nowrap transition-colors"
                  :class="idx + 1 <= step ? 'text-[#d4739f]' : 'text-gray-400'"
                >{{ label }}</span>
              </div>
              <div
                v-if="idx < STEPS.length - 1"
                class="flex-1 h-0.5 mx-2 mb-4 sm:mb-0 rounded-full transition-all duration-300"
                :style="idx + 1 < step ? { backgroundColor: '#FC9AD3' } : { backgroundColor: '#e5e7eb' }"
              />
            </template>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- STEP 1 — Cliente                                               -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div v-if="step === 1" class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">
          <div class="px-6 py-5 border-b border-black/10">
            <h2 class="text-[18px] font-bold text-[#111827]">Paso 1: Información del Cliente</h2>
            <p class="mt-0.5 text-[13px] text-gray-400">Busca el cliente por teléfono o regístralo si es nuevo.</p>
          </div>
          <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:divide-x lg:divide-black/10">
            <!-- Left: search + register -->
            <div class="space-y-5 lg:pr-8">
              <div>
                <label class="block text-[13px] font-semibold text-gray-600 mb-2">Teléfono:</label>
                <div class="relative">
                  <input
                    :value="phoneQuery"
                    @input="onPhoneInput($event, v => phoneQuery = v)"
                    @keydown="(e) => { if (e.key === 'Enter') { searchByPhone(); return; } if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault() }"
                    type="tel" inputmode="numeric" maxlength="10"
                    class="w-full h-12 rounded-xl px-4 pr-12 text-[14px] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 placeholder:text-gray-400 transition"
                    placeholder="Ingresa número de teléfono"
                  />
                  <button type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5 transition"
                    :class="searching ? 'text-[#FC9AD3]' : 'text-gray-400'"
                    @click="searchByPhone"
                  >
                    <div v-if="searching" class="h-4 w-4 rounded-full border-2 border-black/10 border-t-[#FC9AD3] animate-spin" />
                    <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                  </button>
                </div>
                <p class="mt-1.5 text-[12px] text-gray-400">Presiona Enter o el ícono para buscar.</p>
                <div v-if="searchError" class="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700 ring-1 ring-red-200">{{ searchError }}</div>
              </div>

              <button type="button"
                class="flex items-center gap-2.5 text-[13px] font-semibold transition-colors"
                :style="showRegister ? { color: '#d4739f' } : { color: '#6b7280' }"
                @click="showRegister = !showRegister"
              >
                <span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all"
                  :style="showRegister ? { borderColor: '#FC9AD3', backgroundColor: '#FC9AD3' } : { borderColor: '#d1d5db', backgroundColor: '#fff' }"
                >
                  <svg v-if="showRegister" viewBox="0 0 24 24" class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                ¿No está registrado?
              </button>

              <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                <div v-if="showRegister" class="rounded-2xl ring-1 ring-black/10 bg-[#FAFAFA] p-5 space-y-4">
                  <div v-if="registerError" class="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700 ring-1 ring-red-200">{{ registerError }}</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="sm:col-span-2">
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Nombre completo *</label>
                      <input v-model="regForm.fullName" class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50" placeholder="Ej. Ana García López" />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Teléfono *</label>
                      <input v-model="regForm.phone" inputmode="numeric" class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50" placeholder="Ej. 6441234567" />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Correo (opcional)</label>
                      <input v-model="regForm.email" type="email" class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50" placeholder="ana@correo.com" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Notas (opcional)</label>
                      <textarea v-model="regForm.notes" rows="2" class="w-full rounded-xl px-3 py-2 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 resize-none" placeholder="Ej. Prefiere entregas matutinas" />
                    </div>
                  </div>
                  <button type="button" class="w-full h-11 rounded-xl text-[13px] font-bold text-white transition disabled:opacity-50" style="background-color:#FC9AD3" :disabled="!canRegister || registering" @click="registerAndSelect">
                    <span v-if="registering" class="flex items-center justify-center gap-2"><span class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />Registrando…</span>
                    <span v-else>Registrar y seleccionar →</span>
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Right: results -->
            <div class="lg:pl-8">
              <p class="text-[13px] font-semibold text-gray-600 mb-3">Seleccionar cliente</p>
              <div v-if="!hasSearched && !searching" class="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                <svg viewBox="0 0 24 24" class="h-10 w-10 text-gray-200 mb-3" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                <p class="text-[13px] text-gray-400">Busca un cliente por teléfono</p>
              </div>
              <div v-else-if="searching" class="flex justify-center py-16">
                <div class="h-6 w-6 rounded-full border-2 border-black/10 border-t-[#FC9AD3] animate-spin" />
              </div>
              <div v-else-if="hasSearched && results.length === 0" class="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                <p class="text-[13px] font-medium text-gray-500">Ningún cliente encontrado</p>
              </div>
              <div v-else class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                <button v-for="c in results" :key="c.id" type="button"
                  class="w-full text-left rounded-2xl border-2 p-4 transition-all duration-150 hover:shadow-sm"
                  :style="selectedCustomer?.id === c.id ? { borderColor: '#FC9AD3', backgroundColor: '#fff5fb' } : { borderColor: '#e5e7eb', backgroundColor: '#fff' }"
                  @click="selectCustomer(c)"
                >
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <p class="text-[14px] font-bold text-[#111827]">{{ c.fullName }}</p>
                    <span class="flex items-center gap-1 text-[13px] font-semibold" style="color:#FC9AD3">{{ c.phone }}</span>
                  </div>
                  <div class="mt-2 space-y-1">
                    <div v-if="formatCustomerAddress(c)" class="text-[12px] text-gray-500">{{ formatCustomerAddress(c) }}</div>
                    <div v-if="selectedCustomer?.id === c.id" class="mt-2 flex items-center gap-1.5 text-[12px] font-semibold" style="color:#FC9AD3">
                      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      Cliente seleccionado
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- STEP 2 — Tipo y logística                                      -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div v-else-if="step === 2" class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">
          <div class="px-6 py-5 border-b border-black/10">
            <h2 class="text-[18px] font-bold text-[#111827]">Tipo y logística</h2>
            <p class="mt-0.5 text-[13px] text-gray-400">Elige el tipo de pedido y, si aplica, los detalles de entrega</p>
          </div>
          <div class="px-6 py-6 space-y-8">

            <!-- Tipo de pedido -->
            <fieldset>
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Tipo de pedido</legend>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button v-for="t in ORDER_TYPES" :key="t.key" type="button" @click="step2.orderType = t.key"
                  :class="['relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 transition-all', step2.orderType === t.key ? 'border-[#FC9AD3] bg-pink-50 shadow-sm' : 'border-black/10 hover:border-[#FC9AD3]/60 hover:bg-pink-50/40']"
                >
                  <span v-if="step2.orderType === t.key" class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FC9AD3]">
                    <svg viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="none" stroke="white" stroke-width="2"><path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="text-2xl leading-none select-none">
                    <template v-if="t.icon === 'delivery'">🛵</template>
                    <template v-else-if="t.icon === 'shop'">🏪</template>
                    <template v-else-if="t.icon === 'flower'">🌸</template>
                    <template v-else-if="t.icon === 'event'">🎉</template>
                  </span>
                  <span class="text-[13px] font-semibold text-[#111827] text-center">{{ t.label }}</span>
                  <span class="text-[11px] text-gray-400 text-center leading-tight">{{ t.sub }}</span>
                </button>
              </div>
            </fieldset>

            <!-- VITRINA: Recolección -->
            <fieldset v-if="step2.orderType === 'VITRINA'">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Logística de Recolección</legend>
              <div class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden">
                <div class="flex items-center gap-3 px-4 py-3 bg-white">
                  <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0">Sucursal</label>
                  <div class="relative flex-1">
                    <select v-model="step2.pickupBranchId" class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                      <option value="" disabled>Selecciona sucursal</option>
                      <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                  <div class="flex items-center gap-3">
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Fecha de recolección</label>
                    <input v-model="step2.pickupDate" type="date" :min="minDeliveryDate" class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" />
                  </div>
                  <div class="flex items-center gap-3">
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora</label>
                    <div class="flex items-center gap-1">
                      <select v-model.number="pickupTimeParts.h" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="h in 12" :key="h" :value="h">{{ h }}</option></select>
                      <span class="text-gray-400 text-[13px]">:</span>
                      <select v-model="pickupTimeParts.m" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ m }}</option></select>
                      <select v-model="pickupTimeParts.p" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option value="AM">AM</option><option value="PM">PM</option></select>
                    </div>
                  </div>
                  <div v-if="pickupTimeOutOfHours" class="w-full flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700">
                    La hora seleccionada está fuera del horario de atención (8:00 AM – 7:59 PM). ¿Estás seguro?
                  </div>
                </div>
              </div>
            </fieldset>

            <!-- FLOR: modo entrega -->
            <fieldset v-if="step2.orderType === 'FLOR'" class="space-y-3">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Modo de entrega</legend>
              <div class="flex gap-6">
                <label class="flex items-center gap-2 cursor-pointer select-none"><input type="radio" v-model="florMode" value="domicilio" class="accent-[#FC9AD3]" /><span class="text-[13px] font-medium text-gray-700">🛵 Domicilio</span></label>
                <label class="flex items-center gap-2 cursor-pointer select-none"><input type="radio" v-model="florMode" value="vitrina" class="accent-[#FC9AD3]" /><span class="text-[13px] font-medium text-gray-700">🏪 Recolección en sucursal</span></label>
              </div>
              <template v-if="florMode === 'vitrina'">
                <div class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden">
                  <div class="flex items-center gap-3 px-4 py-3 bg-white">
                    <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0">Sucursal</label>
                    <div class="relative flex-1">
                      <select v-model="step2.pickupBranchId" class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                        <option value="" disabled>Selecciona sucursal</option>
                        <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                      </select>
                      <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                    <div class="flex items-center gap-3">
                      <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Fecha de recolección</label>
                      <input v-model="step2.pickupDate" type="date" :min="minDeliveryDate" class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" />
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora</label>
                      <div class="flex items-center gap-1">
                        <select v-model.number="pickupTimeParts.h" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="h in 12" :key="h" :value="h">{{ h }}</option></select>
                        <span class="text-gray-400 text-[13px]">:</span>
                        <select v-model="pickupTimeParts.m" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ m }}</option></select>
                        <select v-model="pickupTimeParts.p" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option value="AM">AM</option><option value="PM">PM</option></select>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </fieldset>

            <!-- Entrega: fecha / hora / dirección -->
            <template v-if="needsDelivery">
              <fieldset>
                <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {{ step2.orderType === 'EVENTO' ? 'Logística del evento' : 'Detalles de la entrega' }}
                </legend>
                <div class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden">
                  <!-- Ronda -->
                  <div class="flex items-center gap-3 px-4 py-3 bg-white">
                    <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0">Ronda de entrega</label>
                    <div class="relative flex-1">
                      <select v-model="step2.deliveryRound" class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                        <option value="" disabled>Selecciona ronda</option>
                        <option value="1">Ronda 1</option><option value="2">Ronda 2</option><option value="3">Ronda 3</option>
                      </select>
                      <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                  </div>
                  <!-- Fecha + Hora -->
                  <div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                    <div class="flex items-center gap-3">
                      <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">{{ step2.orderType === 'EVENTO' ? 'Fecha del evento' : 'Fecha de entrega' }} <span class="text-red-400">*</span></label>
                      <input v-model="step2.deliveryDate" type="date" :min="minDeliveryDate" class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" />
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">{{ step2.orderType === 'EVENTO' ? 'Hora del evento' : 'Hora de entrega' }}</label>
                      <div class="flex items-center gap-1">
                        <select v-model.number="deliveryTimeParts.h" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="h in 12" :key="h" :value="h">{{ h }}</option></select>
                        <span class="text-gray-400 text-[13px]">:</span>
                        <select v-model="deliveryTimeParts.m" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ m }}</option></select>
                        <select v-model="deliveryTimeParts.p" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option value="AM">AM</option><option value="PM">PM</option></select>
                      </div>
                    </div>
                    <div v-if="deliveryTimeOutOfHours" class="w-full flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700">{{ deliveryTimeWarningMsg }}</div>
                  </div>
                  <!-- EVENTO: hora de salida -->
                  <div v-if="step2.orderType === 'EVENTO'" class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                    <div class="flex items-center gap-3">
                      <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora de salida</label>
                      <div class="flex items-center gap-1">
                        <select v-model.number="exitTimeParts.h" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="h in 12" :key="h" :value="h">{{ h }}</option></select>
                        <span class="text-gray-400 text-[13px]">:</span>
                        <select v-model="exitTimeParts.m" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option v-for="m in MINUTE_OPTIONS" :key="m" :value="m">{{ m }}</option></select>
                        <select v-model="exitTimeParts.p" class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"><option value="AM">AM</option><option value="PM">PM</option></select>
                      </div>
                    </div>
                    <div v-if="exitTimeOutOfHours" class="w-full flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700">La hora de salida parece muy temprana (antes de las 7:00 AM). ¿Estás seguro?</div>
                  </div>
                </div>
              </fieldset>

              <!-- Dirección -->
              <fieldset class="space-y-3">
                <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Dirección de entrega</legend>
                <label :class="['flex items-center gap-2.5 cursor-pointer select-none', !customerHasAddress && 'opacity-40 pointer-events-none']">
                  <input v-model="step2.useCustomerAddr" type="checkbox" :disabled="!customerHasAddress" class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50" />
                  <span class="text-[13px] text-gray-700">Usar la dirección del cliente registrada<span v-if="!customerHasAddress" class="text-gray-400"> (el cliente no tiene dirección registrada)</span></span>
                </label>
                <div v-if="step2.useCustomerAddr && customerHasAddress" class="rounded-lg bg-pink-50 border border-[#FC9AD3]/40 px-4 py-3 text-[13px] text-gray-700">{{ customerAddressFormatted }}</div>
                <template v-if="!step2.useCustomerAddr">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Calle <span class="text-red-400">*</span></label><input v-model="step2.newAddr.street" type="text" placeholder="Av. Principal" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Número <span class="text-red-400">*</span></label><input v-model="step2.newAddr.number" type="text" placeholder="123" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Colonia <span class="text-red-400">*</span></label><input v-model="step2.newAddr.neighborhood" type="text" placeholder="Col. Centro" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Ciudad</label><input v-model="step2.newAddr.city" type="text" placeholder="CDMX" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Entre calles</label><input v-model="step2.newAddr.betweenStreets" type="text" placeholder="Entre A y B" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Referencia</label><input v-model="step2.newAddr.reference" type="text" placeholder="Casa color azul…" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                  </div>
                </template>
                <!-- Overrides receptor -->
                <div v-if="step2.useCustomerAddr || (step2.newAddr.street && step2.newAddr.number)" class="border-t border-dashed border-black/10 pt-4 space-y-3">
                  <p class="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Para esta entrega (opcional)</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Nombre de quien recibe</label><input v-model="step2.receiverName" type="text" placeholder="Nombre del receptor" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1"><label class="text-[13px] font-medium text-gray-600">Teléfono de quien recibe</label><input :value="step2.receiverPhone" @input="onPhoneInput($event, v => step2.receiverPhone = v)" type="tel" inputmode="numeric" maxlength="10" placeholder="5512345678" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" /></div>
                    <div class="flex flex-col gap-1 sm:col-span-2"><label class="text-[13px] font-medium text-gray-600">Indicaciones para el repartidor</label><textarea v-model="step2.deliveryNotes" rows="2" placeholder="Instrucciones especiales…" class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white resize-none" /></div>
                  </div>
                </div>
              </fieldset>
            </template>

            <!-- FLOR: flores -->
            <fieldset v-if="step2.orderType === 'FLOR'">
              <div class="flex items-center gap-2 mb-3">
                <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Flores del Pedido</legend>
                <button type="button" @click="addFlowerRow" class="flex items-center justify-center h-6 w-6 rounded-full bg-[#FC9AD3]/20 hover:bg-[#FC9AD3]/40 text-[#C9007C] transition-colors"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg></button>
              </div>
              <div class="space-y-2">
                <div v-for="(row, i) in flowerRows" :key="i" class="flex items-center gap-2 rounded-xl ring-1 ring-black/10 bg-white px-3 py-2">
                  <span class="text-[12px] font-semibold text-gray-400 w-12 flex-shrink-0">Flor {{ i + 1 }}</span>
                  <div class="relative flex-1 min-w-0">
                    <select v-model="row.flowerId" class="w-full appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                      <option value="" disabled>Selecciona flor</option>
                      <option v-for="f in flowerCatalog" :key="f.id" :value="f.id">{{ f.name }}</option>
                    </select>
                    <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <input v-model.number="row.quantity" type="number" min="1" placeholder="Cant" class="w-14 rounded-lg bg-[#F3F3F4] px-2 py-1.5 text-[12px] text-center outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" />
                  <input v-model="row.note" type="text" placeholder="Nota" class="flex-1 min-w-0 rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" />
                  <button v-if="flowerRows.length > 1" type="button" @click="removeFlowerRow(i)" class="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8" stroke-linecap="round"/></svg></button>
                </div>
              </div>
            </fieldset>

            <!-- EVENTO: Servicios + Detalles -->
            <fieldset v-if="step2.orderType === 'EVENTO'">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Servicios</legend>
              <div class="flex flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-white px-5 py-4">
                <label class="flex items-center gap-2 cursor-pointer select-none"><input v-model="step2.eventServices.dessertTable" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50" /><span class="text-[13px] text-gray-700">Mesa de Postres</span></label>
                <label class="flex items-center gap-2 cursor-pointer select-none"><input v-model="step2.eventServices.cake" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50" /><span class="text-[13px] text-gray-700">Pastel</span></label>
                <label class="flex items-center gap-2 cursor-pointer select-none"><input v-model="step2.eventServices.montage" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50" /><span class="text-[13px] text-gray-700">Montaje</span></label>
              </div>
            </fieldset>
            <fieldset v-if="step2.orderType === 'EVENTO'">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalles del Evento</legend>
              <div class="rounded-xl border border-black/10 bg-white px-5 py-4 flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Número de invitados</label>
                  <input v-model.number="step2.eventGuestCount" type="number" min="1" placeholder="150" class="w-24 rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white" />
                </div>
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Responsable del montaje</label>
                  <div class="relative flex-1 min-w-[160px]">
                    <select v-model="step2.eventResponsibleId" class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                      <option value="" disabled>Selecciona responsable</option>
                      <option v-for="u in usersCatalog" :key="u.id" :value="u.id">{{ u.name }} {{ u.lastname }}</option>
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
              </div>
            </fieldset>

          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- STEP 3 — Productos                                             -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div v-else-if="step === 3" class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">
          <div class="px-6 py-5 border-b border-black/10">
            <h2 class="text-[18px] font-bold text-[#111827]">Productos del Pedido</h2>
            <p class="mt-0.5 text-[13px] text-gray-400">Busca y agrega los productos, luego configura sus detalles</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <!-- Buscador -->
            <div>
              <p class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Agregar Productos</p>
              <div class="relative">
                <div class="flex items-center gap-2 rounded-xl ring-1 ring-black/10 bg-white px-4 py-2.5">
                  <svg viewBox="0 0 24 24" class="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input v-model="productQuery" @focus="showProductPanel = productResults.length > 0" @keydown.escape="showProductPanel = false" type="text" placeholder="Buscar producto..." class="flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder-gray-400" />
                </div>
                <div v-if="showProductPanel && productResults.length" class="absolute z-30 mt-1 w-full rounded-xl bg-white ring-1 ring-black/10 shadow-xl overflow-hidden">
                  <div class="max-h-72 overflow-y-auto divide-y divide-black/5">
                    <button v-for="p in productResults" :key="p.id" type="button" @click="addProduct(p)" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-left">
                      <div class="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-[#F3F3F4]">
                        <img v-if="getProductImageUrl(p)" :src="getProductImageUrl(p)!" :alt="p.name" class="h-full w-full object-cover" />
                        <div v-else class="h-full w-full flex items-center justify-center text-gray-300"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 15l-5-5L5 21"/></svg></div>
                      </div>
                      <div class="min-w-0"><p class="text-[13px] font-semibold text-[#111827] truncate">{{ p.name }}</p><p class="text-[11px] text-gray-400 truncate">{{ p.description || 'Sin descripción' }}</p></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista productos -->
            <div v-if="orderProducts.length">
              <p class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalles del producto</p>
              <div class="space-y-4">
                <div v-for="(row, i) in orderProducts" :key="row.product.id" class="rounded-xl ring-1 ring-black/10 overflow-hidden">
                  <!-- Header row -->
                  <div class="flex items-center gap-3 bg-[#F3F3F4] px-4 py-3">
                    <div class="h-8 w-8 flex-shrink-0 rounded-md overflow-hidden bg-white">
                      <img v-if="getProductImageUrl(row.product)" :src="getProductImageUrl(row.product)!" :alt="row.product.name" class="h-full w-full object-cover" />
                      <div v-else class="h-full w-full flex items-center justify-center text-gray-300"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 15l-5-5L5 21"/></svg></div>
                    </div>
                    <span class="flex-1 text-[14px] font-semibold text-[#111827] truncate">{{ row.product.name }}</span>
                    <!-- Precio -->
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="text-[12px] text-gray-500">Precio:</span>
                      <div class="flex items-center h-6 rounded-lg bg-white ring-1 ring-black/10 overflow-hidden">
                        <span class="px-1.5 text-[12px] text-gray-400 font-medium border-r border-black/10 h-full flex items-center">$</span>
                        <input type="number" step="0.01" min="0" :value="row.price" @input="row.price = parseFloat(($event.target as HTMLInputElement).value) || 0" placeholder="0.00" class="w-16 bg-transparent px-1.5 text-[12px] font-semibold text-[#111827] outline-none" />
                      </div>
                    </div>
                    <!-- Cantidad -->
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <span class="text-[12px] text-gray-500 mr-1">Cant:</span>
                      <button type="button" @click="row.qty = Math.max(1, row.qty - 1)" class="h-6 w-6 rounded-md bg-white ring-1 ring-black/10 text-gray-500 hover:bg-pink-50 flex items-center justify-center"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14" stroke-linecap="round"/></svg></button>
                      <span class="w-6 text-center text-[13px] font-semibold text-[#111827]">{{ row.qty }}</span>
                      <button type="button" @click="row.qty++" class="h-6 w-6 rounded-md bg-white ring-1 ring-black/10 text-gray-500 hover:bg-pink-50 flex items-center justify-center"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg></button>
                    </div>
                    <button type="button" @click="removeProduct(i)" class="ml-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg></button>
                  </div>
                  <!-- Atributos -->
                  <div class="divide-y divide-black/5 bg-white">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Tamaño</span>
                        <div class="relative"><select v-model="row.sizeId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option value="10P">10 P</option><option value="15P">15 P</option><option value="20P">20 P</option><option value="25P">25 P</option><option value="30P">30 P</option><option value="40P">40 P</option><option value="50P">50 P</option><option value="CUSTOM">Personalizado</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                        <input v-if="row.sizeId === 'CUSTOM'" v-model="row.customSize" type="text" placeholder="ej. 100 personas" class="w-28 rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" />
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Tipo de Pan</span>
                        <div class="relative"><select v-model="row.breadId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="b in breadTypes" :key="b.id" :value="b.id">{{ b.name }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Sabor</span>
                        <div class="relative"><select v-model="row.flavorId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="f in flavors" :key="f.id" :value="f.id">{{ f.name }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Relleno</span>
                        <div class="relative"><select v-model="row.fillingId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="f in fillings" :key="f.id" :value="f.id">{{ f.name }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Frosting</span>
                        <div class="relative"><select v-model="row.frostingId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="f in frostings" :key="f.id" :value="f.id">{{ f.name }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Estilo</span>
                        <div class="relative"><select v-model="row.styleId" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="s in styles" :key="s.id" :value="s.id">{{ s.name }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      </div>
                    </div>
                    <!-- Texto -->
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <label class="flex items-center gap-2 cursor-pointer select-none flex-shrink-0"><input v-model="row.withText" type="checkbox" class="h-4 w-4 rounded border-gray-300 accent-[#FC9AD3]" /><span class="text-[12px] font-medium text-gray-500">Texto</span></label>
                      <template v-if="row.withText">
                        <input v-model="row.text" type="text" placeholder="Texto en el pastel" class="flex-1 min-w-[140px] rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" :class="{ 'ring-red-300': row.withText && !row.text.trim() }" />
                        <div class="flex items-center gap-2">
                          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Ubicación <span class="text-red-400">*</span></span>
                          <div class="relative"><select v-model="row.textLocation" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option v-for="o in UBICACION_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                        </div>
                      </template>
                    </div>
                    <!-- Manga -->
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Decoración con manga</span>
                      <div class="relative"><select v-model="row.mangaStyle" class="appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"><option value="">—</option><option v-for="o in MANGA_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                      <input v-if="row.mangaStyle && row.mangaStyle !== 'NONE'" v-model="row.mangaNotes" type="text" placeholder="Notas de decoración" class="flex-1 min-w-[140px] rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" />
                    </div>
                    <!-- Notas + Referencia -->
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <div class="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span class="text-[12px] font-medium text-gray-500 flex-shrink-0">Notas</span>
                        <input v-model="row.notes" type="text" placeholder="Notas de decoración" class="flex-1 rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60" />
                      </div>
                      <label class="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
                        <input v-model="row.withReference" type="checkbox" class="h-4 w-4 rounded border-gray-300 accent-[#FC9AD3]" @change="row.withReference && !row.referencePreview ? openRefModal(i) : null" />
                        <span class="text-[12px] font-medium text-gray-500">Subir Referencia</span>
                      </label>
                      <template v-if="row.withReference">
                        <div v-if="row.referencePreview" class="flex items-center gap-2">
                          <img :src="row.referencePreview" class="h-8 w-8 rounded-md object-cover ring-1 ring-black/10" />
                          <button type="button" @click="openRefModal(i)" class="text-[11px] text-[#C9007C] hover:underline">Cambiar</button>
                          <button type="button" @click="removeRefImage(i)" class="text-[11px] text-gray-400 hover:text-red-400">Quitar</button>
                        </div>
                        <button v-else type="button" @click="openRefModal(i)" class="flex items-center gap-1.5 rounded-lg bg-[#F3F3F4] px-3 py-1.5 text-[12px] text-gray-500 ring-1 ring-black/8 hover:ring-[#FC9AD3]/60 transition-colors" :class="{ 'ring-red-300 text-red-400': row.withReference && !row.referenceFile && !row.referencePreview }">
                          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          Adjuntar imagen
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center py-12 text-gray-300">
              <svg viewBox="0 0 24 24" class="h-12 w-12 mb-3" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
              <p class="text-[13px] text-gray-400">Busca un producto para comenzar</p>
            </div>
          </div>
        </div>

        <!-- Modal imagen de referencia -->
        <Teleport to="body">
          <Transition name="fade">
            <div v-if="refModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" @click.self="refModal.open = false">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-black/8 flex items-center justify-between">
                  <h3 class="text-[16px] font-bold text-[#111827]">Imagen de referencia</h3>
                  <button type="button" @click="refModal.open = false" class="text-gray-400 hover:text-gray-600"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
                <div class="px-5 py-5 space-y-4">
                  <div class="rounded-xl overflow-hidden bg-[#F3F3F4] flex items-center justify-center" style="min-height:200px">
                    <img v-if="refModal.preview" :src="refModal.preview" class="max-h-64 w-full object-contain" />
                    <div v-else class="flex flex-col items-center text-gray-300 py-10"><svg viewBox="0 0 24 24" class="h-12 w-12 mb-2" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 15l-5-5L5 21"/></svg><p class="text-[13px]">Sin imagen</p></div>
                  </div>
                  <label class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#FC9AD3]/50 hover:border-[#FC9AD3] px-4 py-3 cursor-pointer transition-colors">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 text-[#C9007C]" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span class="text-[13px] font-medium text-[#C9007C]">Seleccionar imagen</span>
                    <input type="file" accept="image/*" class="sr-only" @change="onRefFileChange" />
                  </label>
                </div>
                <div class="px-5 pb-5 flex justify-end gap-2">
                  <button type="button" @click="refModal.open = false" class="px-4 py-2 rounded-xl text-[13px] text-gray-500 ring-1 ring-black/10 hover:bg-gray-50">Cancelar</button>
                  <button type="button" @click="confirmRefImage" :disabled="!refModal.preview" class="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#FC9AD3] disabled:opacity-40 transition-colors">Confirmar</button>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- ══════════════════════════════════════════════════════════════ -->
        <!-- STEP 4 — Pago                                                  -->
        <!-- ══════════════════════════════════════════════════════════════ -->
        <div v-if="step === 4" class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <!-- Tipo de Pago -->
          <div class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">
            <div class="px-6 py-4 border-b border-black/10"><h2 class="text-[16px] font-bold text-[#111827]">Tipo de Pago</h2></div>
            <div class="px-6 py-5 space-y-5">
              <div class="relative">
                <select v-model="step4.paymentType" class="w-full appearance-none rounded-xl bg-[#F3F3F4] pl-4 pr-9 py-2.5 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer">
                  <option v-for="pt in PAYMENT_TYPES" :key="pt.value" :value="pt.value">{{ pt.label }}</option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <!-- Requiere factura -->
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <input v-model="step4.requiresInvoice" type="checkbox" class="h-4 w-4 rounded border-gray-300 accent-[#FC9AD3] focus:ring-[#FC9AD3]/50" />
                <span class="text-[13px] font-medium text-gray-700">Requiere factura</span>
              </label>
              <div>
                <p class="text-[14px] font-semibold text-[#111827] mb-2">Costo por servicio</p>
                <div class="flex items-center h-10 rounded-xl bg-[#F3F3F4] ring-1 ring-black/10 overflow-hidden">
                  <span class="px-3 text-[12px] text-gray-400 font-medium border-r border-black/10 h-full flex items-center">$</span>
                  <input type="number" step="0.01" min="0" v-model.number="serviceCost" placeholder="0.00" class="flex-1 bg-transparent px-3 text-[13px] font-semibold text-[#111827] outline-none" />
                </div>
              </div>
              <div>
                <p class="text-[14px] font-semibold text-[#111827] mb-3">Monto</p>
                <div class="space-y-3">
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input type="radio" v-model="step4.paymentMode" value="FULL" class="mt-0.5 accent-[#FC9AD3]" />
                    <div class="flex-1"><span class="text-[13px] font-medium text-[#111827]">Pago completo</span><div class="mt-1.5 rounded-lg bg-[#F3F3F4] px-3 py-2 text-[13px] font-semibold text-gray-500">{{ formatMXN(orderTotal) }}</div></div>
                  </label>
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input type="radio" v-model="step4.paymentMode" value="DEPOSIT" class="mt-0.5 accent-[#FC9AD3]" />
                    <div class="flex-1">
                      <span class="text-[13px] font-medium text-[#111827]">Pago con depósito</span>
                      <div class="mt-1.5 space-y-2" :class="step4.paymentMode !== 'DEPOSIT' ? 'opacity-50' : ''">
                        <div class="flex items-center h-9 rounded-lg bg-[#F3F3F4] ring-1 ring-black/10 overflow-hidden">
                          <span class="px-2.5 text-[12px] text-gray-400 font-medium border-r border-black/10 h-full flex items-center">$</span>
                          <input type="number" step="0.01" min="0" v-model.number="step4.depositAmount" placeholder="Monto de depósito" :disabled="step4.paymentMode !== 'DEPOSIT'" class="flex-1 bg-transparent px-2.5 text-[13px] text-[#111827] outline-none" />
                        </div>
                        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F3F3F4] text-[12px]">
                          <span class="text-gray-500">Restante:</span>
                          <span class="font-semibold" :class="remaining < 0 ? 'text-red-500' : 'text-[#111827]'">{{ formatMXN(remaining) }}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden flex flex-col">
            <div class="px-6 py-4 border-b border-black/10"><h2 class="text-[16px] font-bold text-[#111827]">Resumen del Pedido</h2></div>
            <div class="divide-y divide-black/5 overflow-y-auto max-h-72">
              <div v-for="(row, i) in orderProducts" :key="row.product.id" class="flex items-start gap-3 px-5 py-3">
                <div class="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-[#F3F3F4]">
                  <img v-if="getProductImageUrl(row.product)" :src="getProductImageUrl(row.product)!" :alt="row.product.name" class="h-full w-full object-cover" />
                  <div v-else class="h-full w-full flex items-center justify-center text-gray-300"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 15l-5-5L5 21"/></svg></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-[#111827] truncate">{{ row.product.name }}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">Cantidad: {{ row.qty }}</p>
                  <span class="text-[12px] font-semibold text-[#C9007C]">{{ formatMXN(row.price * row.qty) }}</span>
                  <button type="button" @click="openDetailModal(i)" class="block mt-1 text-[11px] text-[#FC9AD3] hover:text-[#C9007C] font-medium underline underline-offset-2">Ver detalle</button>
                </div>
              </div>
            </div>
            <div class="border-t border-black/10 px-5 py-4 space-y-2.5 mt-auto">
              <div class="flex items-center justify-between text-[13px]"><span class="text-gray-500">Subtotal</span><span class="font-semibold text-[#111827]">{{ formatMXN(subtotal) }}</span></div>
              <div class="flex items-center justify-between text-[13px]"><span class="text-gray-500">Costo por servicio</span><span class="font-semibold text-[#111827]">{{ formatMXN(serviceCost) }}</span></div>
              <div class="flex items-center justify-between text-[14px] pt-1.5 border-t border-black/10"><span class="font-bold text-[#111827]">Total</span><span class="font-bold text-[#111827]">{{ formatMXN(orderTotal) }}</span></div>
            </div>
          </div>
        </div>

        <!-- Modal detalle producto -->
        <Teleport to="body">
          <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="detailModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="closeDetailModal">
              <div v-if="detailRow" class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div class="flex items-center gap-3 px-5 py-4 border-b border-black/10">
                  <div>
                    <p class="text-[15px] font-bold text-[#111827]">{{ detailRow.product.name }}</p>
                    <p class="text-[12px] text-gray-400">Detalles del producto</p>
                  </div>
                  <button type="button" @click="closeDetailModal" class="ml-auto text-gray-300 hover:text-gray-500 transition-colors"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg></button>
                </div>
                <div class="px-5 py-4 max-h-[55vh] overflow-y-auto divide-y divide-black/5">
                  <div v-if="!detailRowHasDetails" class="flex flex-col items-center py-8 text-gray-300"><p class="text-[13px] font-medium text-gray-400">Sin detalles adicionales</p></div>
                  <div v-if="detailRow.sizeId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Tamaño</span><span class="text-[12px] font-semibold text-[#111827]">{{ detailRow.sizeId }}</span></div>
                  <div v-if="detailRow.breadId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Tipo de Pan</span><span class="text-[12px] font-semibold text-[#111827]">{{ catalogLabel(breadTypes, detailRow.breadId) }}</span></div>
                  <div v-if="detailRow.flavorId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Sabor</span><span class="text-[12px] font-semibold text-[#111827]">{{ catalogLabel(flavors, detailRow.flavorId) }}</span></div>
                  <div v-if="detailRow.fillingId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Relleno</span><span class="text-[12px] font-semibold text-[#111827]">{{ catalogLabel(fillings, detailRow.fillingId) }}</span></div>
                  <div v-if="detailRow.frostingId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Frosting</span><span class="text-[12px] font-semibold text-[#111827]">{{ catalogLabel(frostings, detailRow.frostingId) }}</span></div>
                  <div v-if="detailRow.styleId" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Estilo</span><span class="text-[12px] font-semibold text-[#111827]">{{ catalogLabel(styles, detailRow.styleId) }}</span></div>
                  <div v-if="detailRow.withText && detailRow.text" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Texto</span><span class="text-[12px] font-semibold text-[#111827] text-right max-w-[60%]">&ldquo;{{ detailRow.text }}&rdquo; · {{ optionLabel(UBICACION_OPTIONS, detailRow.textLocation) }}</span></div>
                  <div v-if="detailRow.mangaStyle && detailRow.mangaStyle !== 'NONE'" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Manga</span><span class="text-[12px] font-semibold text-[#111827]">{{ optionLabel(MANGA_OPTIONS, detailRow.mangaStyle) }}</span></div>
                  <div v-if="detailRow.notes" class="flex justify-between py-2"><span class="text-[12px] text-gray-500">Notas</span><span class="text-[12px] font-semibold text-[#111827] text-right max-w-[60%]">{{ detailRow.notes }}</span></div>
                  <div v-if="detailRow.referencePreview" class="pt-3 pb-1"><p class="text-[12px] text-gray-500 mb-2">Imagen de referencia</p><img :src="detailRow.referencePreview" alt="Referencia" class="w-full max-h-44 object-contain rounded-lg ring-1 ring-black/10" /></div>
                </div>
                <div class="px-5 py-3 border-t border-black/10 flex justify-end"><button type="button" @click="closeDetailModal" class="h-9 px-6 rounded-xl text-[13px] font-semibold bg-[#111827] text-white hover:bg-black/80 transition-colors">Cerrar</button></div>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- ── Barra de cliente seleccionado (steps 2–4) ─────────────── -->
        <div v-if="step > 1 && selectedCustomer" class="mt-4 rounded-2xl bg-white ring-1 ring-black/10 px-5 py-3 flex items-center gap-3">
          <div class="h-8 w-8 shrink-0 rounded-full grid place-items-center font-bold text-[12px] text-white" style="background-color:#FC9AD3">{{ selectedCustomer.fullName.slice(0, 2).toUpperCase() }}</div>
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-semibold text-[#111827] truncate">{{ selectedCustomer.fullName }}</p>
            <p class="text-[12px] text-gray-400">{{ selectedCustomer.phone }}</p>
          </div>
          <button type="button" class="ml-auto text-[12px] font-semibold transition-colors shrink-0" style="color:#FC9AD3" @click="step = 1">Cambiar</button>
        </div>

        <!-- ── Footer navegación ─────────────────────────────────────── -->
        <div class="mt-6 flex items-center justify-between gap-4">
          <button type="button" class="h-11 px-6 rounded-xl text-[14px] font-semibold bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition" @click="back">
            {{ step === 1 ? 'Cancelar' : '← Atrás' }}
          </button>
          <div class="flex flex-col items-end gap-1">
            <p v-if="submitError" class="text-[12px] text-red-500 text-right max-w-xs">{{ submitError }}</p>
            <button type="button" class="h-11 px-7 rounded-xl text-[14px] font-bold text-white transition disabled:opacity-40 flex items-center gap-2" style="background-color:#FC9AD3" :disabled="!canNext || submitting" @click="step === STEPS.length ? submitOrder() : next()">
              <div v-if="submitting" class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {{ step === STEPS.length ? 'Guardar cambios ✓' : 'Siguiente →' }}
            </button>
          </div>
        </div>

      </template>

    </div>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
