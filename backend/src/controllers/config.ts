import { Elysia, t } from 'elysia'
import { prisma } from '../utils/prisma'

export const configController = new Elysia({ prefix: '/config', tags: ['System Config'] })
  // 1. ดึงการตั้งค่าปัจจุบัน (ถ้าไม่มีให้สร้าง Default)
  .get('/', async () => {
    let config = await prisma.systemConfig.findFirst()
    
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          waterRate: 18.00,
          electricRate: 7.00
        }
      })
    }
    return config
  })

  // 2. อัปเดตการตั้งค่า
  .post('/', async ({ body }) => {
    // หา record แรกเสมอ
    const existingConfig = await prisma.systemConfig.findFirst()
    
    if (existingConfig) {
      return await prisma.systemConfig.update({
        where: { id: existingConfig.id },
        data: {
          waterRate: body.waterRate,
          electricRate: body.electricRate
        }
      })
    } else {
      // กันเหนียว กรณีลบ DB ไปแล้วยังไม่มี record
      return await prisma.systemConfig.create({
        data: {
            waterRate: body.waterRate,
            electricRate: body.electricRate
        }
      })
    }
  }, {
    body: t.Object({
      waterRate: t.Numeric(),
      electricRate: t.Numeric()
    })
  })