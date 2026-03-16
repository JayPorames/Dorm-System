import { Elysia, t } from 'elysia'
import { prisma } from '../utils/prisma'

export const tenantController = new Elysia({ prefix: '/tenants', tags: ['Tenants'] })
  // GET ALL TENANTS
  .get('/', async () => await prisma.tenant.findMany({ 
    include: { contracts: { where: { isActive: true }, include: { room: true } } }
  }))

  // GET TENANT BY ID CARD
  .get('/search/:idCard', async ({ params }) => {
    return await prisma.tenant.findUnique({ where: { idCard: params.idCard } })
  })

  // CREATE TENANT
  .post('/', async ({ body, set }) => {
    try {
      return await prisma.tenant.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          idCard: body.idCard,
          phone: body.phone,
          address: body.address
        }
      })
    } catch (e) {
      set.status = 400
      return { message: 'ID Card likely exists already' }
    }
  }, {
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      idCard: t.String(),
      phone: t.String(),
      address: t.Optional(t.String())
    })
  })

  // UPDATE TENANT
  .put('/:id', async ({ params, body }) => {
    return await prisma.tenant.update({
      where: { id: Number(params.id) },
      data: body
    })
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      idCard: t.String(),
      phone: t.String(),
      address: t.Optional(t.String())
    })
  })