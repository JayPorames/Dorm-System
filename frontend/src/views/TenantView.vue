<template>
  <div>
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-md-center mb-6 gap-4">
      <div>
        <h2 class="text-h4 font-weight-bold text-primary mb-1">Tenant Management</h2>
        <div class="text-subtitle-1 text-medium-emphasis">Manage tenants and their information</div>
      </div>
      <div class="d-flex gap-3">
        <v-text-field
          v-model="search"
          density="compact"
          variant="outlined"
          label="Search tenants..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
          bg-color="white"
        ></v-text-field>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          height="40"
          elevation="2"
          @click="openDialog()"
        >
          Add Tenant
        </v-btn>
      </div>
    </div>

    <!-- Tenant Table -->
    <v-card border elevation="0" class="rounded-lg">
      <v-data-table
        :headers="headers"
        :items="tenants"
        :search="search"
        hover
      >
        <!-- Custom Columns -->
        <template v-slot:item.firstName="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
              <span class="text-subtitle-2 font-weight-bold">{{ item.firstName.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.idCard }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.contracts="{ item }">
          <div v-if="item.contracts && item.contracts.length > 0">
            <v-chip
              v-for="con in item.contracts"
              :key="con.id"
              color="success"
              size="small"
              variant="flat"
              class="mr-1 font-weight-bold"
            >
              Room {{ con.room.number }}
            </v-chip>
          </div>
          <v-chip
            v-else
            color="grey"
            size="small"
            variant="tonal"
          >
            No Active Contract
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="medium-emphasis"
              @click="openDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Tenant Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="rounded-lg">
        <v-card-title class="d-flex justify-space-between align-center pa-4 border-bottom bg-grey-lighten-5">
          <span class="text-h6 font-weight-bold">{{ isEditing ? 'Edit Tenant' : 'Add New Tenant' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveTenant" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.firstName"
                  label="First Name"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.lastName"
                  label="Last Name"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.idCard"
                  label="ID Card Number"
                  variant="outlined"
                  density="comfortable"
                  counter="13"
                  :rules="[
                    v => !!v || 'Required',
                    v => (v && v.length === 13) || 'Must be 13 digits'
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.phone"
                  label="Phone Number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone"
                  :rules="[v => !!v || 'Required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.address"
                  label="Address"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  prepend-inner-icon="mdi-map-marker"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="medium-emphasis"
            @click="dialog = false"
            class="mr-2"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveTenant"
            :loading="loading"
            :disabled="!valid"
            min-width="100"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const tenants = ref([])
const dialog = ref(false)
const loading = ref(false)
const valid = ref(false)
const search = ref('')
const editingId = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  idCard: '',
  phone: '',
  address: ''
})

const isEditing = computed(() => !!editingId.value)

const headers = [
  { title: 'Tenant Name', key: 'firstName', align: 'start' },
  { title: 'Phone', key: 'phone' },
  { title: 'Rented Rooms', key: 'contracts', sortable: false },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const fetchTenants = async () => {
  try {
    const res = await api.get('/tenants')
    tenants.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const openDialog = (item = null) => {
  if (item) {
    editingId.value = item.id
    form.value = { ...item }
  } else {
    editingId.value = null
    form.value = { firstName: '', lastName: '', idCard: '', phone: '', address: '' }
  }
  dialog.value = true
}

const saveTenant = async () => {
  if (!valid.value) return
  
  loading.value = true
  try {
    if (isEditing.value) {
      await api.put(`/tenants/${editingId.value}`, form.value)
      $swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tenant updated successfully!',
      })
    } else {
      await api.post('/tenants', form.value)
      $swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tenant added successfully!',
      })
    }
    
    dialog.value = false
    fetchTenants()
  } catch (e) {
    $swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error: ' + (e.response?.data?.message || e.message),
    })
  } finally {
    loading.value = false
  }
}

onMounted(fetchTenants)
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
.gap-4 {
  gap: 1.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
</style>