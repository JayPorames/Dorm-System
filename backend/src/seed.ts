// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')
  
  await prisma.invoice.deleteMany()
  await prisma.meterReading.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.repairRequest.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.room.deleteMany()
  await prisma.systemConfig.deleteMany()

  console.log('🧹 Old data cleared.')
  
  // 1. สร้าง SystemConfig (ค่าเริ่มต้น)
  await prisma.systemConfig.create({
    data: {
      waterRate: 18.00,
      electricRate: 7.00
    }
  })
  console.log('⚙️  SystemConfig created.')
  
  // 2. สร้างห้องพัก
  const roomsData = []
  for (let i = 1; i <= 5; i++) {
    roomsData.push({ number: `10${i}`, floor: 1, basePrice: 3500 })
    roomsData.push({ number: `20${i}`, floor: 2, basePrice: 3800 })
  }

  await prisma.room.createMany({ data: roomsData })
  console.log('🏠 10 Rooms created.')

  // 3. สร้างผู้เช่า (Tenants)
  const tenant1 = await prisma.tenant.create({
    data: {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      idCard: '1100123456789',
      phone: '0812345678',
      address: '123 กทม.'
    }
  })

  const tenant2 = await prisma.tenant.create({
    data: {
      firstName: 'สมหญิง',
      lastName: 'รักสงบ',
      idCard: '1200987654321',
      phone: '0898765432',
      address: '456 เชียงใหม่'
    }
  })
  console.log('👥 2 Tenants created.')

  // 4. ทำสัญญาเช่า (Contracts) & Update สถานะห้อง
  const room101 = await prisma.room.findUnique({ where: { number: '101' } })
  if (room101) {
    await prisma.contract.create({
      data: {
        roomId: room101.id,
        tenantId: tenant1.id,
        startDate: new Date(),
        deposit: 7000,
        isActive: true
      }
    })
    await prisma.room.update({
      where: { id: room101.id },
      data: { status: 'OCCUPIED' }
    })
  }

  const room201 = await prisma.room.findUnique({ where: { number: '201' } })
  if (room201) {
    await prisma.contract.create({
      data: {
        roomId: room201.id,
        tenantId: tenant2.id,
        startDate: new Date(),
        deposit: 7600,
        isActive: true
      }
    })
    await prisma.room.update({
      where: { id: room201.id },
      data: { status: 'OCCUPIED' }
    })
  }
  console.log('📝 Contracts signed & Rooms updated.')

  // 5. สร้างเลขมิเตอร์ตั้งต้น (Initial Meter)
  if (room101) {
    await prisma.meterReading.create({
      data: {
        roomId: room101.id,
        waterUnit: 100,
        electricUnit: 500,
        month: new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
        year: new Date().getFullYear()
      }
    })
  }
  console.log('⚡ Initial meters set.')

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })