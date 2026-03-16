<template>
  <div>
    <div class="d-flex flex-column flex-md-row justify-space-between align-md-center mb-6 gap-4">
      <div>
        <h2 class="text-h4 font-weight-bold text-primary mb-1">Billing & Metering</h2>
        <div class="text-subtitle-1 text-medium-emphasis">Calculate monthly bills and generate invoices</div>
      </div>
      
      <v-btn
        prepend-icon="mdi-cog"
        variant="outlined"
        color="primary"
        @click="openConfigDialog"
      >
       ตั้งค่าหน่วยน้ำและไฟ
      </v-btn>
    </div>

    <v-card border elevation="0" class="rounded-lg">
        <v-data-table
            :headers="headers"
            :items="occupiedRooms"
            hover
        >
         <template v-slot:item.number="{ item }">
                <div class="d-flex align-center py-2">
                    <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                    <v-icon size="small">mdi-door</v-icon>
                    </v-avatar>
                    <div>
                    <div class="font-weight-bold">Room {{ item.number }}</div>
                    <div class="text-caption text-medium-emphasis">Floor {{ item.floor }}</div>
                    </div>
                </div>
            </template>
            <template v-slot:item.status="{ item }">
                <v-chip color="success" size="small" variant="flat" class="font-weight-bold">Occupied</v-chip>
            </template>
            <template v-slot:item.action="{ item }">
                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-calculator" @click="openBillingDialog(item)">
                  คำนวณค่าใช้จ่าย
                </v-btn>
            </template>
        </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="800">
        <v-card class="rounded-lg">
            <v-card-title class="d-flex justify-space-between align-center pa-4 border-bottom bg-grey-lighten-5">
                <span class="text-h6 font-weight-bold">Invoice Generation</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
            </v-card-title>
            
            <v-card-text class="pa-6">
                <div class="text-subtitle-2 font-weight-bold mb-2 text-primary d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-water</v-icon> หน่วยน้ำ
                </div>
                <v-row class="mb-4">
                    <v-col cols="12" sm="6">
                        <v-text-field 
                            :model-value="billForm.previousWater" 
                            label="หน่วยก่อนหน้า" 
                            variant="filled" 
                            readonly
                            bg-color="grey-lighten-4"
                        ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                        <v-text-field 
                            v-model="billForm.currentWater" 
                            type="number" 
                            label="หน่วยปัจจุบัน" 
                            variant="outlined" 
                            @input="updateWaterUsage"
                            :hint="`ใช้: ${Math.max(0, billForm.currentWater - billForm.previousWater)} หน่วย`"
                            persistent-hint
                        ></v-text-field>
                    </v-col>
                </v-row>

                <div class="text-subtitle-2 font-weight-bold mb-2 text-orange-darken-2 d-flex align-center">
                    <v-icon size="small" class="mr-2">mdi-lightning-bolt</v-icon> หน่วยไฟ
                </div>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field 
                      :model-value="billForm.previousElectric" 
                      label="หน่วยก่อนหน้า" 
                      variant="filled" 
                      readonly
                      bg-color="grey-lighten-4"
                      ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-text-field 
                      v-model="billForm.currentElectric" 
                      type="number" 
                      label="หน่วยปัจจุบัน" 
                      variant="outlined" 
                      @input="updateElectricUsage"
                      :hint="`ใช้: ${Math.max(0, billForm.currentElectric - billForm.previousElectric)} หน่วย`"
                      persistent-hint
                      ></v-text-field>
                  </v-col>
                </v-row>

                <v-expand-transition>
                  <div v-if="invoiceResult" class="mt-6">
                    <v-card variant="outlined" class="bg-grey-lighten-5 border-dashed pa-4">
                        <div class="d-flex justify-space-between mb-2">
                          <span>ค่าเช่า</span> <span>{{ invoiceResult.rentAmount }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-2">
                          <span>ค่าน้ำ</span> <span>{{ invoiceResult.waterAmount }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-2">
                          <span>ค่าไฟ</span> <span>{{ invoiceResult.electricAmount }}</span>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <div class="d-flex justify-space-between font-weight-bold text-h6 text-primary">
                          <span>รวม</span> <span>{{ invoiceResult.totalAmount }}</span>
                        </div>
                    </v-card>
                  </div>
                </v-expand-transition>
            </v-card-text>

            <v-card-actions class="pa-4 bg-grey-lighten-5">
                <v-spacer></v-spacer>
                <v-btn  @click="calculateBill" color="primary" variant="flat" :loading="loading" class="mr-2">
                  <v-icon start>{{ invoiceResult ? 'mdi-refresh' : 'mdi-calculator' }}</v-icon>
                  {{ invoiceResult ? 'คำนวณใหม่' : 'คำนวณ' }}
                </v-btn>
                <v-btn @click="printPDF" color="success" variant="flat" prepend-icon="mdi-printer" :disabled="!invoiceResult" >
                  พิมพ์ใบแจ้งหนี้
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="configDialog" max-width="400">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white">
          <v-icon start icon="mdi-cog"></v-icon>
          ตั้งค่าหน่วยน้ำและไฟ
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-2 text-medium-emphasis mb-4">ตั้งค่าราคาต่อหน่วยของน้ำและไฟ</p>
          
          <v-text-field
            v-model="configForm.waterRate"
            label="ราคาต่อหน่วยน้ำ"
            type="number"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-water"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="configForm.electricRate"
            label="ราคาต่อหน่วยไฟ"
            type="number"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lightning-bolt"
          ></v-text-field>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="configDialog = false">ยกเลิก</v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="saveConfig" 
            :loading="configLoading"
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
import pdfMake from "pdfmake/build/pdfmake";

const headers = [
  { title: 'Room Info', key: 'number', align: 'start' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'action', align: 'end', sortable: false },
]

const occupiedRooms = ref([])
const dialog = ref(false)
const configDialog = ref(false)
const selectedRoom = ref(null)
const invoiceResult = ref(null)
const configForm = ref({
  waterRate: 0,
  electricRate: 0
})
const configLoading = ref(false)
const loading = ref(false)

const billForm = ref({
  previousWater: 0,
  previousElectric: 0,
  currentWater: 0,
  currentElectric: 0,
  waterUsage: 0,
  electricUsage: 0
})

onMounted(async () => {
  try {
    const res = await api.get('/rooms')
    occupiedRooms.value = res.data.filter(r => r.status === 'OCCUPIED')
  } catch (e) {
    console.error(e)
  }
  await fetchConfig()
})

const openBillingDialog = async (room) => {
  selectedRoom.value = room
  resetForm()
  dialog.value = true
  await fetchLatestMeter(room.id)
}

const fetchLatestMeter = async (roomId) => {
  try {
    const res = await api.get(`/billing/latest/${roomId}`)
    const last = res.data
    billForm.value.previousWater = last.waterUnit || 0
    billForm.value.previousElectric = last.electricUnit || 0
    
    // Init current to previous
    billForm.value.currentWater = 0
    billForm.value.currentElectric = 0
  } catch (e) {
    console.error('Failed to fetch meter', e)
  }
}

const updateWaterUsage = () => {
  billForm.value.waterUsage = Number(billForm.value.currentWater) - Number(billForm.value.previousWater)
}

const updateElectricUsage = () => {
  billForm.value.electricUsage = Number(billForm.value.currentElectric) - Number(billForm.value.previousElectric)
}

const resetForm = () => {
  invoiceResult.value = null
  billForm.value = { 
    previousWater: 0, previousElectric: 0,
    currentWater: 0, currentElectric: 0,
    waterUsage: 0, electricUsage: 0
  }
}

const calculateBill = async () => {
  loading.value = true
  try {
    const res = await api.post('/billing/generate', {
      roomId: selectedRoom.value.id,
      currentWater: Number(billForm.value.currentWater),
      currentElectric: Number(billForm.value.currentElectric),
      // เพิ่ม 2 บรรทัดนี้ ส่งค่า Previous ไปให้ Backend ใช้คำนวณ
      previousWater: Number(billForm.value.previousWater), 
      previousElectric: Number(billForm.value.previousElectric),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })
    
    invoiceResult.value = res.data
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.msg || e.response?.data?.message || e.message
    $swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    })
  } finally {
    loading.value = false
  }
}

const loadFontToBase64 = async (path) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(new Error('FileReader failed'));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
};

const printPDF = async () => {
  try {
    const regularFontBase64 = await loadFontToBase64('/fonts/Sarabun-Regular.ttf');
    const boldFontBase64 = await loadFontToBase64('/fonts/Sarabun-Bold.ttf');

    pdfMake.vfs = {
      "Sarabun-Regular.ttf": regularFontBase64,
      "Sarabun-Bold.ttf": boldFontBase64
    };

    pdfMake.fonts = {
      Sarabun: {
        normal: 'Sarabun-Regular.ttf',
        bold: 'Sarabun-Bold.ttf',
        italics: 'Sarabun-Regular.ttf',
        bolditalics: 'Sarabun-Bold.ttf'
      }
    };

    const inv = invoiceResult.value;
    const room = selectedRoom.value;

    const docDefinition = {
      content: [
        { text: 'INVOICE / ใบแจ้งหนี้', style: 'header' },
        { text: `Room No: ${room.number}`, style: 'subheader' },
        { text: `Date: ${new Date().toLocaleDateString('th-TH')}`, margin: [0, 0, 0, 20] },
        
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'รายการ', bold: true, fillColor: '#eeeeee' }, 
                { text: 'ก่อนหน้า', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                { text: 'ปัจจุบัน', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                { text: 'จำนวนหน่วยที่ใช้', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                { text: 'จำนวนเงิน (THB)', bold: true, fillColor: '#eeeeee', alignment: 'right' }
              ],
              [
                'ค่าเช่าห้อง (Room Rent)',
                { text: '-', alignment: 'center' },
                { text: '-', alignment: 'center' },
                { text: '-', alignment: 'center' },
                { text: inv.rentAmount.toLocaleString(), alignment: 'right' }
              ],
              [
                `ค่าน้ำ (Water)`,
                { text: billForm.value.previousWater.toLocaleString(), alignment: 'center' },
                { text: billForm.value.currentWater.toLocaleString(), alignment: 'center' },
                { text: inv.waterUnit.toLocaleString(), alignment: 'center' },
                { text: inv.waterAmount.toLocaleString(), alignment: 'right' }
              ],
              [
                `ค่าไฟ (Electricity)`,
                { text: billForm.value.previousElectric.toLocaleString(), alignment: 'center' },
                { text: billForm.value.currentElectric.toLocaleString(), alignment: 'center' },
                { text: inv.electricUnit.toLocaleString(), alignment: 'center' },
                { text: inv.electricAmount.toLocaleString(), alignment: 'right' }
              ],
              [
                { text: 'รวมทั้งสิ้น (Total)', bold: true, colSpan: 3 }, 
                {}, 
                {},
                {},
                { text: inv.totalAmount.toLocaleString(), bold: true, alignment: 'right' }
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: 'กรุณาชำระภายใน 5 วัน (Please pay within 5 days)', margin: [0, 20, 0, 0], italics: true, fontSize: 10 }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
      },
      defaultStyle: {
        font: 'Sarabun'
      }
    };

    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
  }
};

const fetchConfig = async () => {
  try {
    const res = await api.get('/config')
    if (res.data) {
      configForm.value.waterRate = Number(res.data.waterRate)
      configForm.value.electricRate = Number(res.data.electricRate)
    }
  } catch (e) {
    console.error('Failed to fetch config', e)
  }
}

const openConfigDialog = async () => {
  await fetchConfig()
  configDialog.value = true
}

const saveConfig = async () => {
  configLoading.value = true
  try {
    await api.post('/config', {
      waterRate: Number(configForm.value.waterRate),
      electricRate: Number(configForm.value.electricRate)
    })
    configDialog.value = false
    $swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'System rates updated successfully!',
    })
  } catch (e) {
    $swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Update failed: ' + e.message,
    })
  } finally {
    configLoading.value = false
  }
}

</script>

<style scoped>
.gap-4 {
  gap: 1.5rem;
}
.border-dashed {
  border-style: dashed !important;
}
</style>