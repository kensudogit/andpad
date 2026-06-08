/** 全ページ共通レイアウト（Noto Sans JP・AppShell・GraphQL プロバイダ）。 */
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { AppShell } from '@/components/AppShell'
import { GraphQLProviders } from '@/components/GraphQLProviders'
import { ui } from '@/lib/ui'
import './globals.css'

const noto = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  display: 'swap',
  // CJK fonts cannot be preloaded as a single subset in next/font (Next.js #44594).
  preload: false,
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
})

export const metadata: Metadata = {
  title: ui.metaTitle,
  description: ui.metaDesc,
  icons: { icon: '/PC.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={noto.className}>
        <GraphQLProviders>
          <AppShell>{children}</AppShell>
        </GraphQLProviders>
      </body>
    </html>
  )
}
