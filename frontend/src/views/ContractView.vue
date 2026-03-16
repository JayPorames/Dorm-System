<template>
  <v-container fluid class="pa-0">
    <div class="d-flex flex-column gap-1 mb-6">
      <h2 class="text-h4 font-weight-bold text-primary">New Contract</h2>
      <div class="text-subtitle-1 text-medium-emphasis">Create a new lease agreement for a tenant</div>
    </div>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="0" border class="rounded-lg">
          <v-card-title class="pa-6 border-bottom bg-grey-lighten-5">
            <div class="d-flex align-center">
              <v-avatar color="primary" variant="tonal" class="mr-4">
                <v-icon>mdi-file-sign</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">รายละเอียดสัญญา</div>
                <div class="text-caption text-medium-emphasis">กรอกข้อมูลด้านล่างเพื่อเช็คอินผู้เช่า</div>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="submitContract" v-model="valid">
              <div class="text-subtitle-2 font-weight-bold text-primary mb-4 d-flex align-center">
                <v-icon icon="mdi-home-outline" size="small" class="mr-2"></v-icon>
                เลือกห้องและผู้เช่า
              </div>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.roomId"
                    :items="vacantRooms"
                    item-title="number"
                    item-value="id"
                    label="เลือกห้อง"
                    placeholder="ค้นหาห้องว่าง"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-door"
                    :rules="[v => !!v || 'กรุณาเลือกห้อง']"
                    bg-color="white"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :subtitle="`ชั้น ${item.raw.floor} - ฿${item.raw.basePrice}`"></v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.tenantId"
                    :items="tenants"
                    item-title="fullName"
                    item-value="id"
                    label="เลือกผู้เช่า"
                    placeholder="ค้นหาผู้เช่า"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account"
                    :rules="[v => !!v || 'กรุณาเลือกผู้เช่า']"
                    bg-color="white"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-title>
                          ไม่พบผู้เช่า 
                          <router-link to="/tenants" class="text-primary text-decoration-none font-weight-bold">
                            สร้างผู้เช่าใหม่
                          </router-link>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-divider class="my-6 border-dashed"></v-divider>

              <div class="text-subtitle-2 font-weight-bold text-primary mb-4 d-flex align-center">
                <v-icon icon="mdi-calendar-clock" size="small" class="mr-2"></v-icon>
                รายละเอียดสัญญาเช่า
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="menuDate"
                    :close-on-content-click="false"
                    location="bottom"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        :model-value="displayThaiDate"
                        label="วันที่เริ่มสัญญา"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-calendar-start"
                        readonly
                        bg-color="white"
                        :rules="[v => !!form.startDate || 'กรุณาระบุวันที่เริ่มสัญญา']"
                        style="cursor: pointer;"
                      ></v-text-field>
                    </template>

                    <v-card min-width="300">
                      <v-date-picker
                        v-model="dateObject"
                        color="primary"
                        @update:modelValue="onDateChange"
                        hide-header
                      ></v-date-picker>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.deposit"
                    type="number"
                    label="เงินมัดจำ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-cash-lock"
                    suffix="THB"
                    :rules="[v => !!v || 'กรุณาระบุเงินมัดจำ']"
                    bg-color="white"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-alert
                v-if="selectedRoom"
                color="info"
                variant="tonal"
                icon="mdi-information"
                class="mt-4"
                border="start"
              >
                <div class="text-subtitle-2 font-weight-bold">สรุป</div>
                <div class="text-body-2">
                  เช็คอิน <strong>{{ selectedTenantName }}</strong> เข้าห้อง <strong>{{ selectedRoom.number }}</strong>
                  ค่าเช่ารายเดือน: <strong>฿{{ selectedRoom.basePrice.toLocaleString() }}</strong>
                </div>
              </v-alert>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-6 bg-grey-lighten-5 d-flex justify-end gap-2">
            <v-btn
              variant="outlined"
              color="medium-emphasis"
              to="/rooms"
              height="44"
              class="px-6"
            >
              ยกเลิก
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="submitContract"
              :loading="loading"
              :disabled="!valid"
              height="44"
              class="px-6"
              prepend-icon="mdi-check"
            >
              สร้างสัญญา
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const vacantRooms = ref([])
const tenants = ref([])
const loading = ref(false)
const valid = ref(false)
const menuDate = ref(false)
const dateObject = ref(new Date())

const form = ref({
  roomId: null,
  tenantId: null,
  startDate: new Date().toISOString().substr(0, 10),
  deposit: 5000
})

const selectedRoom = computed(() => 
  vacantRooms.value.find(r => r.id === form.value.roomId)
)

const selectedTenantName = computed(() => {
  const tenant = tenants.value.find(t => t.id === form.value.tenantId)
  return tenant ? tenant.fullName : '...'
})

const displayThaiDate = computed(() => {
  if (!form.value.startDate) return ''
  
  const date = new Date(form.value.startDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear() + 543
  
  return `${day}/${month}/${year}`
})

const onDateChange = (newDate) => {
  if (!newDate) return

  const offset = newDate.getTimezoneOffset()
  const dateLocal = new Date(newDate.getTime() - (offset * 60 * 1000))
  
  form.value.startDate = dateLocal.toISOString().split('T')[0]
  menuDate.value = false 
}

const submitContract = async () => {
  if (!valid.value) return
  
  loading.value = true
  try {
    await api.post('/contracts', {
      roomId: form.value.roomId,
      tenantId: form.value.tenantId,
      startDate: form.value.startDate,
      deposit: Number(form.value.deposit)
    })
    router.push('/rooms')
  } catch (e) {
    $swal.fire({
      icon: 'error',
      title: 'ข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาด: ' + (e.response?.data?.message || e.message),
    })
  } finally {
    loading.value = false
  }
}

watch(() => form.value.startDate, (newVal) => {
  if (newVal) {
    dateObject.value = new Date(newVal)
  }
}, { immediate: true })

onMounted(async () => {
  try {
    const [roomRes, tenantRes] = await Promise.all([
      api.get('/rooms'),
      api.get('/tenants')
    ])
    
    vacantRooms.value = roomRes.data.filter(r => r.status === 'VACANT')
    tenants.value = tenantRes.data.map(t => ({
      ...t,
      fullName: `${t.firstName} ${t.lastName}`
    }))
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}
.border-dashed {
  border-style: dashed !important;
}
</style>