<template>
  <v-app class="app-background">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      class="glass-drawer"
      elevation="0"
      width="280"
      color="white"
    >
      <div class="drawer-header pa-6">
        <div class="d-flex align-center gap-3 mb-6">
          <v-avatar color="primary" size="40" variant="flat">
            <v-icon color="white" icon="mdi-home-city"></v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0">Dorm System</h3>
            <span class="text-caption text-medium-emphasis">Management Panel</span>
          </div>
        </div>
      </div>

      <v-list class="px-4" nav>
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="mb-1 nav-item"
          active-class="nav-item-active"
          color="primary"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-information-outline" size="small" class="mr-2"></v-icon>
              <span class="text-caption font-weight-bold">System Status</span>
            </div>
            <div class="text-caption">All systems operational</div>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app flat color="transparent" height="80" class="px-4">
      <v-app-bar-nav-icon
        variant="text"
        @click="drawer = !drawer"
        class="mr-2"
      ></v-app-bar-nav-icon>
      
      <v-spacer></v-spacer>

      <div class="d-flex align-center gap-2">
        <v-btn icon variant="text" color="grey-darken-1">
          <v-badge dot color="error">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="text-capitalize"
              prepend-icon="mdi-account-circle-outline"
            >
              Admin User
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list width="200" class="rounded-lg elevation-4">
            <v-list-item prepend-icon="mdi-cog-outline" title="Settings"></v-list-item>
            <v-list-item prepend-icon="mdi-logout" title="Logout" color="error"></v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)

const menuItems = [
  { title: 'จัดการห้องพัก', icon: 'mdi-home-outline', to: '/rooms' },
  { title: 'ผู้เช่า', icon: 'mdi-account-group-outline', to: '/tenants' },
  { title: 'ทำสัญญา/เช็คอิน', icon: 'mdi-file-document-edit-outline', to: '/contracts' },
  { title: 'จดมิเตอร์/บิล', icon: 'mdi-cash-register', to: '/billing' },
]
</script>

<style scoped>
.app-background {
  background-color: #f8f9fa;
}

.glass-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.nav-item {
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.nav-item-active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  font-weight: 600;
}
</style>