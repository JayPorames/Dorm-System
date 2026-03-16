import { Elysia, t } from 'elysia'
import { prisma } from '../utils/prisma'

export const billingController = new Elysia({ prefix: '/billing', tags: ['Billing'] })
  .get('/latest/:roomId', async ({ params }) => {
    const lastMeter = await prisma.meterReading.findFirst({
      where: { roomId: Number(params.roomId) },
      orderBy: { id: 'desc' }
    })
    return lastMeter || { waterUnit: 0, electricUnit: 0 }
  })

  .post('/generate', async ({ body, set }) => {
    const { roomId, currentWater, currentElectric, previousWater, previousElectric, month, year } = body

    const activeContract = await prisma.contract.findFirst({
      where: { roomId, isActive: true }
    })
    if (!activeContract) { 
      set.status = 400; 
      return { msg: 'Room has no active contract' } 
    }

    const existingMeter = await prisma.meterReading.findFirst({
      where: { roomId, month, year }
    })

    const lastMeter = await prisma.meterReading.findFirst({
      where: { 
        roomId,
        id: existingMeter ? { not: existingMeter.id } : undefined
      },
      orderBy: { id: 'desc' }
    })

    const prevWater = lastMeter ? lastMeter.waterUnit : previousWater
    const prevElec = lastMeter ? lastMeter.electricUnit : previousElectric
    
    const wUsed = currentWater - prevWater
    const eUsed = currentElectric - prevElec
    
    if (wUsed < 0 || eUsed < 0) { 
      set.status = 400; 
      return { msg: `Meter Error: Current reading must be >= Previous (${prevWater}/${prevElec})` } 
    }

    const config = await prisma.systemConfig.findFirst()
    const waterRate = Number(config?.waterRate) || 18
    const electricRate = Number(config?.electricRate) || 7

    const wCost = wUsed * waterRate
    const eCost = eUsed * electricRate
    
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    const rent = Number(room?.basePrice) || 0
    const total = rent + wCost + eCost

    return await prisma.$transaction(async (tx) => {
      await tx.meterReading.create({
        data: { 
          roomId, 
          waterUnit: currentWater, 
          electricUnit: currentElectric, 
          month, 
          year,
          recordDate: new Date()
        }
      })

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      await tx.invoice.updateMany({
        where: {
          contractId: activeContract.id,
          issueDate: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' }
        },
        data: { status: 'CANCELLED' }
      })

      return await tx.invoice.create({
        data: {
          contractId: activeContract.id,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          rentAmount: rent,
          waterUnit: wUsed,
          electricUnit: eUsed,
          previousWater: prevWater,
          previousElectric: prevElec,
          waterAmount: wCost,
          electricAmount: eCost,
          totalAmount: total,
          status: 'PENDING'
        }
      })
    })
  }, {
    body: t.Object({
      roomId: t.Numeric(),
      currentWater: t.Numeric(),
      currentElectric: t.Numeric(),
      previousWater: t.Numeric(),
      previousElectric: t.Numeric(),
      month: t.Numeric(),
      year: t.Numeric()
    })
  })