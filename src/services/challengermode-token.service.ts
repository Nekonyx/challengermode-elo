import { z } from 'zod'

const authResponseSchema = z.object({
  value: z.string(),
  expiresAt: z.iso.datetime()
})

type AuthResponseType = z.infer<typeof authResponseSchema>

export class ChallengermodeTokenService {
  public static readonly singleton = new ChallengermodeTokenService()

  private token: string | null = null
  private tokenExpiresAt: Date | null = null
  private tokenFetchPromise: Promise<string> | null = null

  private constructor() {}

  public async fetch(): Promise<string> {
    if (this.isAlive()) {
      return this.token!
    }

    if (!this.tokenFetchPromise) {
      this.tokenFetchPromise = this.refreshToken()
        .then(() => this.token!)
        .finally(() => {
          this.tokenFetchPromise = null
        })
    }

    return this.tokenFetchPromise
  }

  public isAlive(): boolean {
    return Boolean(
      this.token !== null &&
        this.tokenExpiresAt &&
        this.tokenExpiresAt > new Date()
    )
  }

  private async refreshToken() {
    const refreshKey = process.env.CHALLENGERMODE_REFRESH_KEY

    if (!refreshKey) {
      throw new Error('No refresh key found')
    }

    console.log('Refreshing Challengermode token...')

    const response = await fetch(
      'https://publicapi.challengermode.com/mk1/v1/auth/access_keys',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshKey
        })
      }
    )

    if (!response.ok) {
      console.log(await response.text())

      throw new Error('Failed to authenticate', {
        cause: await response.text()
      })
    }

    const data: AuthResponseType = authResponseSchema.parse(
      await response.json()
    )

    console.log('Challengermode token refreshed', {
      token: data.value,
      expiresAt: data.expiresAt
    })

    this.token = data.value
    this.tokenExpiresAt = new Date(data.expiresAt)
  }
}
