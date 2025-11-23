import { Elysia, t } from 'elysia'
import { prisma } from '../utils/prisma'

const RATES = { WATER: 18, ELECTRIC: 7 }

export const billingController = new Elysia({ prefix: '/billing', tags: ['Billing'] })
  .post('/generate', async ({ body, set }) => {
    const { roomId, currentWater, currentElectric, month, year } = body

    const activeContract = await prisma.contract.findFirst({
      where: { roomId, isActive: true }
    })
    if (!activeContract) { set.status = 400; return { msg: 'Room has no active contract' } }

    // Get Previous Meter
    const lastMeter = await prisma.meterReading.findFirst({
      where: { roomId },
      orderBy: { id: 'desc' }
    })

    const prevWater = lastMeter ? lastMeter.waterUnit : currentWater
    const prevElec = lastMeter ? lastMeter.electricUnit : currentElectric
    
    // Calc
    const wUsed = currentWater - prevWater
    const eUsed = currentElectric - prevElec
    
    if (wUsed < 0 || eUsed < 0) { set.status = 400; return { msg: 'Meter reading error' } }

    const wCost = wUsed * RATES.WATER
    const eCost = eUsed * RATES.ELECTRIC
    
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    const rent = Number(room?.basePrice) || 0
    const total = rent + wCost + eCost

    // Save
    return await prisma.$transaction(async (tx) => {
      await tx.meterReading.create({
        data: { roomId, waterUnit: currentWater, electricUnit: currentElectric, month, year }
      })
      
      return await tx.invoice.create({
        data: {
          contractId: activeContract.id,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          rentAmount: rent,
          waterAmount: wCost,
          electricAmount: eCost,
          totalAmount: total
        }
      })
    })
  }, {
    body: t.Object({
      roomId: t.Numeric(),
      currentWater: t.Numeric(),
      currentElectric: t.Numeric(),
      month: t.Numeric(),
      year: t.Numeric()
    })
  })