import { NextRequest } from 'next/server'
import { z } from 'zod'
import { extractParams } from '@/lib/search-params'
import { ChallengermodeService } from '@/services/challengermode.service'

const paramsSchema = z.object({
  tournamentId: z.guid()
})

const challengermodeService = new ChallengermodeService()

export async function GET(req: NextRequest) {
  const { tournamentId } = paramsSchema.parse(
    extractParams(req.nextUrl.searchParams)
  )

  const roster = await challengermodeService.fetchRoster({ tournamentId })

  return new Response(JSON.stringify(roster), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
