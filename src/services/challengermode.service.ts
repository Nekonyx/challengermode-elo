import { Client, cacheExchange, fetchExchange, gql } from '@urql/core'
import { RosterQueryData, rosterQueryData } from './challengermode.dto'
import { ChallengermodeTokenService } from './challengermode-token.service'

const ROSTER_QUERY = gql`
  query ($tournamentId: UUID!) {
    tournament(tournamentId: $tournamentId) {
      name
      description
      attendance {
        availableSlotCount
        confirmedLineupCount
        signups {
          lineups {
            name
            team {
              id
              name
              description
              logo {
                width,
                height,
                url
              }
            }
            members {
              captain
              gameAccountId
              user {
                username
                profilePicture {
                  url
                  width
                  height
                }
              }
            }
          }
        }
        roster {
          lineups(limit: 100) {
            name
            team {
              id
              name
              description
              logo {
                width,
                height,
                url
              }
            }
            members {
              captain
              gameAccountId
              user {
                username
                profilePicture {
                  url
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`

export class ChallengermodeService {
  public readonly client: Client
  public readonly tokenService: ChallengermodeTokenService

  public constructor() {
    this.tokenService = ChallengermodeTokenService.singleton
    this.client = new Client({
      url: 'https://publicapi.challengermode.com/graphql',
      exchanges: [cacheExchange, fetchExchange],
      fetch: async (info, init) => {
        const token = await this.tokenService.fetch()

        if (info instanceof Request) {
          info.headers.set('Authorization', `Bearer ${token}`)
        }

        if (init?.headers) {
          if (init.headers instanceof Headers) {
            init.headers.set('Authorization', `Bearer ${token}`)
          } else {
            init.headers = {
              ...init.headers,
              Authorization: `Bearer ${token}`
            }
          }
        }

        return fetch(info, init)
      }
    })
  }

  public async fetchRoster({
    tournamentId
  }: {
    tournamentId: string
  }): Promise<RosterQueryData> {
    const result = await this.client.query(ROSTER_QUERY, {
      tournamentId
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return rosterQueryData.parse(result.data) as RosterQueryData
  }
}
