import { Elysia, t } from "elysia";
import { prisma } from "../utils/prisma";

export const roomController = new Elysia({ prefix: "/rooms", tags: ["Rooms"]  })
  // GET ALL ROOMS  
  .get('/', async () => await prisma.room.findMany({orderBy: {number: "asc"}}))

  // CREATE ROOM
  .post('/', async ({ body }) => {
    return await prisma.room.create({
      data: {
        number: body.number,
        floor: body.floor,
        basePrice: body.basePrice,
        status: 'VACANT'
      }
    })
  }, {
    body: t.Object({
      number: t.String(),
      floor: t.Numeric(),
      basePrice: t.Numeric()
    })
  })

