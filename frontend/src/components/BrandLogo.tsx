'use client'

import Image from 'next/image'
import { ui } from '@/lib/ui'

type BrandLogoProps = {
  size?: number
  animated?: boolean
  className?: string
}

export function BrandLogo({ size = 44, animated = true, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`brand-logo-wrap${animated ? ' brand-logo-wrap--animated' : ''}${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        maxWidth: size,
        minHeight: size,
        maxHeight: size,
      }}
    >
      {animated ? (
        <>
          <span className="brand-logo-ring" aria-hidden />
          <span className="brand-logo-ring brand-logo-ring--delay" aria-hidden />
        </>
      ) : null}
      <Image
        src="/PC.png"
        alt={ui.appTitle}
        width={size}
        height={size}
        className="brand-logo-img"
        priority
      />
    </div>
  )
}
