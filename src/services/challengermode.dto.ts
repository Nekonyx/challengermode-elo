import { z } from 'zod'

export const lineupsSchema = z.object({
  lineups: z.array(
    z.object({
      name: z.string(),
      team: z.nullable(
        z.object({
          id: z.guid(),
          name: z.string(),
          description: z.string(),
          logo: z.nullable(
            z.object({
              width: z.number(),
              height: z.number(),
              url: z.url()
            })
          )
        })
      ),
      members: z.array(
        z.object({
          captain: z.boolean(),
          gameAccountId: z.string(),
          user: z.object({
            username: z.string(),
            profilePicture: z
              .object({
                url: z.string(),
                width: z.number(),
                height: z.number()
              })
              .nullable()
          })
        })
      )
    })
  )
})

export const rosterQueryData = z.object({
  tournament: z.object({
    name: z.string(),
    description: z.string(),
    attendance: z.object({
      availableSlotCount: z.number(),
      confirmedLineupCount: z.number(),
      signups: lineupsSchema,
      roster: lineupsSchema
    })
  })
})

export type RosterQueryData = z.infer<typeof rosterQueryData>
