export function extractParams(searchParams: URLSearchParams) {
  const result: Record<any, any> = {}

  for (const [key, value] of searchParams) {
    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(value)
      } else {
        result[key] = [result[key], value]
      }

      continue
    }

    result[key] = value
  }

  return result
}
