/**
 * GraphQL / Apollo エラーの種別判定とユーザー向けヒント。
 */
import { graphQLConnectionHint } from '@/lib/resolve-api-url'

type GraphQLErrorLike = {
  message: string
  graphQLErrors?: ReadonlyArray<{ message: string }>
  networkError?: Error | null
}

/** メッセージ文字列から認証必須エラーか推定 */
function messageLooksAuthRequired(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('forbidden') ||
    m.includes('unauthorized') ||
    m.includes('sign in') ||
    m.includes('login')
  )
}

function messageLooksNetworkFailure(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('fetch failed') ||
    m.includes('non-json') ||
    m.includes('network') ||
    m.includes('502') ||
    m.includes('503') ||
    m.includes('cannot reach api')
  )
}

export function isAuthRequiredGraphQLError(error: GraphQLErrorLike | undefined): boolean {
  if (!error) return false
  const messages = [
    error.message,
    ...(error.graphQLErrors?.map((e) => e.message) ?? []),
  ]
  return messages.some((m) => messageLooksAuthRequired(m))
}

export function isNetworkGraphQLError(error: GraphQLErrorLike | undefined): boolean {
  if (!error) return false
  if (error.networkError) return true
  return messageLooksNetworkFailure(error.message)
}

function messageLooksSqlError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('sqlstate') ||
    m.includes('column reference') ||
    m.includes('syntax error at') ||
    m.includes('pq:')
  )
}

/** エラーメッセージからユーザー向け日本語ヒントを返す */
export function graphQLErrorHint(message: string | null | undefined): string {
  const text = message ?? ''
  if (messageLooksAuthRequired(text)) {
    return 'ログインが必要です。/login から demo@sakura-dental.jp / demo1234 でログインしてください。'
  }
  if (messageLooksNetworkFailure(text)) {
    return graphQLConnectionHint()
  }
  if (messageLooksSqlError(text)) {
    return 'データベースエラーです。しばらくしてから再読み込みしてください。'
  }
  return 'API エラーが発生しました。/status で接続状態を確認してください。'
}
