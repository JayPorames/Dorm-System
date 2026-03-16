import { createRouter, createWebHistory } from 'vue-router'
import RoomView from '../views/RoomView.vue'
import ContractView from '../views/ContractView.vue'
import BillingView from '../views/BillingView.vue'
import TenantView from '../views/TenantView.vue'

const routes = [
  {
    path: '/',
    redirect: '/rooms' // เปิดเว็บมาให้เด้งไปหน้าห้องพักก่อนเลย
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: RoomView
  },
  {
    path: '/tenants',
    name: 'tenants',
    component: TenantView
  },
  {
    path: '/contracts',
    name: 'contracts',
    component: ContractView
  },
  {
    path: '/billing',
    name: 'billing',
    component: BillingView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router