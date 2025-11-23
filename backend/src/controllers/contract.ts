import { Elysia, t } from 'elysia'
import { prisma } from '../utils/prisma'

export const contractController = new Elysia({ prefix: '/contracts', tags: ['Contracts'] })
  // CREATE CONTRACT
  .post('/', async ({ body, set }) => {
    try {
      return await prisma.$transaction(async (tx) => {
        let tenantId = body.tenantId

        // Case: ผู้เช่าใหม่ (Auto Create Tenant)
        if (!tenantId && body.newTenant) {
          const newTenant = await tx.tenant.create({
            data: body.newTenant
          })
          tenantId = newTenant.id
        }

        if (!tenantId) throw new Error("Tenant ID or New Tenant Data required")

        // Create Contract
        const contract = await tx.contract.create({
          data: {
            roomId: body.roomId,
            tenantId: tenantId,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : null,
            deposit: body.deposit
          }
        })

        // Update Room Status
        await tx.room.update({
          where: { id: body.roomId },
          data: { status: 'OCCUPIED' }
        })

        return contract
      })
    } catch (error: any) {
      set.status = 400
      return { success: false, message: error.message }
    }
  }, {
    body: t.Object({
      roomId: t.Numeric(),
      tenantId: t.Optional(t.Numeric()),
      startDate: t.String(),
      deposit: t.Numeric(),
      endDate: t.Optional(t.String()),
      newTenant: t.Optional(t.Object({
        firstName: t.String(),
        lastName: t.String(),
        idCard: t.String(),
        phone: t.String(),
        address: t.Optional(t.String())
      }))
    })
  })