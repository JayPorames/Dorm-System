import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import dotenv from 'dotenv'
dotenv.config()

// Import Controllers
import { roomController } from './controllers/room'
import { tenantController } from './controllers/tenant'
import { contractController } from './controllers/contract'
import { billingController } from './controllers/billing'
import { configController } from './controllers/config'

const app = new Elysia()
  // 1. Setup Plugins
  .use(cors()) // อนุญาตให้ Frontend ยิงเข้ามาได้ทุก Origin (Dev Mode)
  .use(swagger({
    documentation: {
      info: {
        title: 'Dormitory Management API',
        version: '1.0.0',
        description: 'ระบบจัดการหอพัก (Back-end with Elysia + Bun)'
      },
      tags: [
        { name: 'Rooms', description: 'จัดการข้อมูลห้องพัก' },
        { name: 'Tenants', description: 'จัดการข้อมูลผู้เช่า' },
        { name: 'Contracts', description: 'ทำสัญญาเช่า/แจ้งย้ายออก' },
        { name: 'Billing', description: 'คำนวณมิเตอร์และค่าใช้จ่าย' }
      ]
    }
  }))

  // 2. Register Routes
  .use(roomController)
  .use(tenantController)
  .use(contractController)
  .use(billingController)
  .use(configController)

  // 3. Health Check
  .get('/', () => ({ status: 'ok', message: 'Dorm API is running 🚀' }))
  .listen(process.env.PORT || 3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${process.env.PORT}`)
console.log(`📚 Swagger UI at http://localhost:${process.env.PORT}/swagger`)