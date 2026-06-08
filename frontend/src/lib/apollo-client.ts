'use client'

/**
 * ブラウザ用 Apollo Client シングルトン。
 * Mutation / Query は同一オリジン /graphql + credentials: include + Bearer JWT。
 */
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { getAuthToken } from '@/lib/auth-session'

/** SSR 初回は API_URL 直叩き、クライアントは Next プロキシ経由 */
function graphqlHttpUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/graphql`
  }
  const base = process.env.API_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080'
  return `${base}/graphql`
}

let client: ApolloClient | null = null

export function getApolloClient(): ApolloClient {
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({
        uri: graphqlHttpUri(),
        credentials: 'include',
        fetch(uri, options) {
          const token = getAuthToken()
          const headers = new Headers(options?.headers)
          if (token) {
            headers.set('Authorization', `Bearer ${token}`)
          }
          return fetch(uri, { ...options, headers })
        },
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'cache-and-network' },
      },
    })
  }
  return client
}

export async function resetApolloClient(): Promise<void> {
  if (client) {
    await client.clearStore()
  }
}
