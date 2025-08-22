import { to64 } from 'steam-id-convertor'

export function toSteamId64(input: string) {
  const { id32 } = extractAuthAndId32(input)

  return to64(id32.toString())
}

function extractAuthAndId32(input: string): { auth: bigint; id32: bigint } {
  const match = input.match(/^\[U:(\d+):(\d+)\]$/)

  if (!match) {
    throw new Error('Invalid SteamID32 format')
  }

  const auth = BigInt(match[1]) // "1"
  const id32 = BigInt(match[2]) // "1075413651"

  return { auth, id32 }
}
