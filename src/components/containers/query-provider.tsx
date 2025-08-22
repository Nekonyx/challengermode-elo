'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useRef } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClientRef = useRef<QueryClient>(null)

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnReconnect: false
        }
      }
    })
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </QueryClientProvider>
  )
}
