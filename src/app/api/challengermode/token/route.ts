import { ChallengermodeTokenService } from '@/services/challengermode-token.service'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(
      'This endpoint is only available in development mode.',
      {
        status: 403
      }
    )
  }

  const token = await ChallengermodeTokenService.singleton.fetch()

  return new Response(token, {
    status: 200
  })
}
