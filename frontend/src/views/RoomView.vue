<template>
  <div>
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-md-center mb-6 gap-4">
      <div>
        <h2 class="text-h4 font-weight-bold text-primary mb-1">Room Management</h2>
        <div class="text-subtitle-1 text-medium-emphasis">Overview of all dormitory rooms</div>
      </div>
      <div class="d-flex gap-3">
        <v-text-field
          density="compact"
          variant="outlined"
          label="ค้นหาห้องพัก"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
          bg-color="white"
        ></v-text-field>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          height="40"
          elevation="2"
          @click="dialog = true"
        >
          เพิ่มห้องพัก
        </v-btn>
      </div>
    </div>

    <!-- Room Grid -->
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="room in rooms" :key="room.id">
        <v-card
          class="room-card h-100"
          elevation="0"
          border
          @click="() => {}"
        >
          <div class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-overline text-medium-emphasis mb-1">หมายเลขห้อง</div>
                <div class="text-h5 font-weight-bold">{{ room.number }}</div>
              </div>
              <v-chip
                :color="getStatusColor(room.status)"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ getStatusText(room.status) }}
              </v-chip>
            </div>

            <v-divider class="mb-4 border-opacity-50"></v-divider>

            <div class="d-flex justify-space-between align-center mb-2">
              <div class="d-flex align-center text-body-2 text-medium-emphasis">
                <v-icon icon="mdi-stairs" size="small" class="mr-2"></v-icon>
                ชั้น {{ room.floor }}
              </div>
              <div class="text-h6 text-primary font-weight-bold">
                ฿{{ room.basePrice.toLocaleString() }}
                <span class="text-caption text-medium-emphasis">/เดือน</span>
              </div>
            </div>
          </div>
          
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              block
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-eye-outline"
            >
              ดูรายละเอียด
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Room Dialog -->
    <v-dialog v-model="dialog" max-width="450">
      <v-card class="rounded-lg">
        <v-card-title class="d-flex justify-space-between align-center pa-4 border-bottom">
          <span class="text-h6 font-weight-bold">เพิ่มห้องพัก</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.number"
                label="Room Number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-door"
                placeholder="e.g. 101"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.floor"
                type="number"
                label="Floor"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stairs"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.basePrice"
                type="number"
                label="Base Price"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-currency-thb"
                suffix="THB"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="medium-emphasis"
            @click="dialog = false"
            class="mr-2"
          >
            ยกเลิก
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveRoom"
            :loading="loading"
            min-width="100"
          >
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const rooms = ref([])
const dialog = ref(false)
const loading = ref(false)
const form = ref({ number: '', floor: 1, basePrice: 3500 })

const fetchRooms = async () => {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data
  } catch (error) {
    console.error('Error fetching rooms:', error)
  }
}

const saveRoom = async () => {
  loading.value = true
  try {
    await api.post('/rooms', {
      ...form.value,
      floor: Number(form.value.floor),
      basePrice: Number(form.value.basePrice)
    })
    dialog.value = false
    fetchRooms()
    // Reset form
    form.value = { number: '', floor: 1, basePrice: 3500 }
  } catch (error) {
    console.error('Error saving room:', error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    'VACANT': 'success',
    'OCCUPIED': 'error',
    'MAINTENANCE': 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const statusTexts = {
    'VACANT': 'ว่าง',
    'OCCUPIED': 'เต็ม',
    'MAINTENANCE': 'ปิดปรับปรุง'
  }
  return statusTexts[status] || status
}

onMounted(fetchRooms)
</script>

<style scoped>
.search-field {
  max-width: 300px;
}

.room-card {
  transition: all 0.2s ease-in-out;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}

.gap-4 {
  gap: 1.5rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>