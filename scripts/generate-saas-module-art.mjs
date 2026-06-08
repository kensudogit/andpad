/**
 * Generates SaaS module card background SVGs into frontend/public/saas-modules/
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'frontend', 'public', 'saas-modules')

/** @type {Record<string, { from: string; to: string; accent: string; body: string }>} */
const modules = {
  chatbot: {
    from: '#ede9fe',
    to: '#c4b5fd',
    accent: '#7c3aed',
    body: `<ellipse cx="320" cy="60" rx="70" ry="45" fill="#fff" opacity="0.5"/>
      <rect x="260" y="100" width="120" height="55" rx="12" fill="#fff" opacity="0.65"/>
      <circle cx="290" cy="128" r="8" fill="${'#7c3aed'}"/><circle cx="320" cy="128" r="8" fill="${'#7c3aed'}"/><circle cx="350" cy="128" r="8" fill="${'#7c3aed'}"/>
      <path d="M80 160 Q120 80 180 120 T280 140" stroke="#7c3aed" stroke-width="3" fill="none" opacity="0.4"/>`,
  },
  construction: {
    from: '#ede9fe',
    to: '#ddd6fe',
    accent: '#6d28d9',
    body: `<rect x="200" y="70" width="160" height="120" fill="#fff" opacity="0.35"/>
      <polygon points="280,40 380,90 180,90" fill="#6d28d9" opacity="0.5"/>
      <rect x="240" y="110" width="30" height="80" fill="#6d28d9" opacity="0.3"/>
      <rect x="290" y="90" width="50" height="100" fill="#fff" opacity="0.5"/>`,
  },
  drawings: {
    from: '#dbeafe',
    to: '#93c5fd',
    accent: '#2563eb',
    body: `<rect x="220" y="50" width="150" height="130" fill="#fff" opacity="0.6" stroke="#2563eb" stroke-width="2"/>
      <line x1="240" y1="80" x2="350" y2="80" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
      <line x1="240" y1="110" x2="320" y2="110" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
      <rect x="250" y="130" width="80" height="40" fill="none" stroke="#2563eb" stroke-width="1.5" opacity="0.4"/>`,
  },
  blackboard: {
    from: '#fef3c7',
    to: '#fcd34d',
    accent: '#d97706',
    body: `<rect x="210" y="55" width="160" height="110" rx="4" fill="#1f2937" opacity="0.75"/>
      <line x1="230" y1="85" x2="350" y2="85" stroke="#fff" stroke-width="2" opacity="0.5"/>
      <line x1="230" y1="110" x2="330" y2="110" stroke="#fff" stroke-width="2" opacity="0.4"/>
      <rect x="230" y="130" width="60" height="20" fill="#fff" opacity="0.25"/>`,
  },
  inspection: {
    from: '#ffe4e6',
    to: '#fda4af',
    accent: '#e11d48',
    body: `<rect x="240" y="60" width="120" height="140" rx="8" fill="#fff" opacity="0.65"/>
      <rect x="260" y="85" width="16" height="16" rx="3" fill="#e11d48" opacity="0.6"/>
      <line x1="285" y1="93" x2="340" y2="93" stroke="#e11d48" stroke-width="2" opacity="0.4"/>
      <rect x="260" y="115" width="16" height="16" rx="3" fill="#e11d48" opacity="0.4"/>
      <line x1="285" y1="123" x2="320" y2="123" stroke="#e11d48" stroke-width="2" opacity="0.3"/>`,
  },
  'project-board': {
    from: '#cffafe',
    to: '#67e8f9',
    accent: '#0891b2',
    body: `<rect x="200" y="50" width="55" height="150" rx="6" fill="#fff" opacity="0.55"/>
      <rect x="270" y="50" width="55" height="150" rx="6" fill="#fff" opacity="0.55"/>
      <rect x="340" y="50" width="55" height="150" rx="6" fill="#fff" opacity="0.55"/>
      <rect x="210" y="70" width="35" height="25" rx="4" fill="#0891b2" opacity="0.45"/>
      <rect x="280" y="90" width="35" height="25" rx="4" fill="#0891b2" opacity="0.35"/>`,
  },
  'inquiry-profit': {
    from: '#e0e7ff',
    to: '#a5b4fc',
    accent: '#4f46e5',
    body: `<polyline points="220,170 260,120 300,140 340,80 380,100" fill="none" stroke="#4f46e5" stroke-width="4" opacity="0.55"/>
      <rect x="220" y="170" width="160" height="4" fill="#4f46e5" opacity="0.3"/>
      <text x="300" y="65" font-size="28" fill="#4f46e5" opacity="0.5" font-family="sans-serif">%</text>`,
  },
  orders: {
    from: '#ede9fe',
    to: '#c4b5fd',
    accent: '#7c3aed',
    body: `<rect x="230" y="55" width="130" height="160" rx="6" fill="#fff" opacity="0.6"/>
      <line x1="250" y1="90" x2="340" y2="90" stroke="#7c3aed" stroke-width="2" opacity="0.45"/>
      <line x1="250" y1="115" x2="310" y2="115" stroke="#7c3aed" stroke-width="2" opacity="0.35"/>
      <rect x="250" y="150" width="80" height="30" rx="4" fill="#7c3aed" opacity="0.25"/>`,
  },
  'remote-site': {
    from: '#dbeafe',
    to: '#93c5fd',
    accent: '#2563eb',
    body: `<rect x="250" y="70" width="100" height="70" rx="8" fill="#1f2937" opacity="0.5"/>
      <circle cx="300" cy="105" r="20" fill="none" stroke="#2563eb" stroke-width="3" opacity="0.7"/>
      <circle cx="300" cy="105" r="8" fill="#2563eb" opacity="0.6"/>
      <path d="M180 180 L300 120 L420 180 Z" fill="#2563eb" opacity="0.15"/>`,
  },
  'doc-approval': {
    from: '#fef3c7',
    to: '#fcd34d',
    accent: '#d97706',
    body: `<rect x="220" y="60" width="100" height="130" fill="#fff" opacity="0.55"/>
      <rect x="260" y="80" width="100" height="130" fill="#fff" opacity="0.65"/>
      <circle cx="330" cy="160" r="35" fill="#d97706" opacity="0.35"/>
      <text x="315" y="170" font-size="22" fill="#fff" opacity="0.8" font-family="serif">承</text>`,
  },
  'scan-3d': {
    from: '#ffe4e6',
    to: '#fda4af',
    accent: '#e11d48',
    body: `<path d="M200 180 L280 60 L360 180 Z" fill="none" stroke="#e11d48" stroke-width="2" opacity="0.4"/>
      <circle cx="280" cy="120" r="3" fill="#e11d48"/><circle cx="260" cy="150" r="3" fill="#e11d48"/>
      <circle cx="300" cy="140" r="3" fill="#e11d48"/><circle cx="320" cy="100" r="3" fill="#e11d48"/>
      <line x1="280" y1="60" x2="280" y2="180" stroke="#e11d48" stroke-width="1" opacity="0.3" stroke-dasharray="4"/>`,
  },
  billing: {
    from: '#cffafe',
    to: '#67e8f9',
    accent: '#0891b2',
    body: `<rect x="230" y="55" width="140" height="160" rx="6" fill="#fff" opacity="0.6"/>
      <text x="255" y="100" font-size="20" fill="#0891b2" opacity="0.6" font-family="sans-serif">¥</text>
      <line x1="250" y1="120" x2="350" y2="120" stroke="#0891b2" stroke-width="2" opacity="0.4"/>
      <line x1="250" y1="145" x2="320" y2="145" stroke="#0891b2" stroke-width="2" opacity="0.3"/>`,
  },
  'work-rate': {
    from: '#e0e7ff',
    to: '#a5b4fc',
    accent: '#4f46e5',
    body: `<circle cx="280" cy="110" r="45" fill="none" stroke="#4f46e5" stroke-width="8" opacity="0.35" stroke-dasharray="80 200"/>
      <circle cx="280" cy="110" r="45" fill="none" stroke="#4f46e5" stroke-width="8" opacity="0.6" stroke-dasharray="50 230" transform="rotate(-90 280 110)"/>
      <rect x="320" y="150" width="60" height="50" rx="4" fill="#4f46e5" opacity="0.2"/>`,
  },
  'site-access': {
    from: '#ede9fe',
    to: '#c4b5fd',
    accent: '#7c3aed',
    body: `<rect x="200" y="80" width="180" height="100" fill="#fff" opacity="0.4"/>
      <rect x="270" y="100" width="40" height="80" fill="#7c3aed" opacity="0.35"/>
      <rect x="240" y="130" width="30" height="45" rx="4" fill="#fff" opacity="0.7" stroke="#7c3aed" stroke-width="2"/>`,
  },
  'e-delivery': {
    from: '#dbeafe',
    to: '#93c5fd',
    accent: '#2563eb',
    body: `<rect x="250" y="70" width="120" height="90" rx="8" fill="#fff" opacity="0.55"/>
      <path d="M270 160 L300 130 L330 160 Z" fill="#2563eb" opacity="0.4"/>
      <circle cx="300" cy="115" r="25" fill="none" stroke="#2563eb" stroke-width="3" opacity="0.5"/>
      <polyline points="290,115 298,123 315,105" fill="none" stroke="#2563eb" stroke-width="3" opacity="0.6"/>`,
  },
  bm: {
    from: '#fef3c7',
    to: '#fcd34d',
    accent: '#d97706',
    body: `<rect x="210" y="70" width="160" height="120" fill="#fff" opacity="0.45"/>
      <rect x="240" y="95" width="25" height="25" fill="#d97706" opacity="0.35"/>
      <rect x="280" y="95" width="25" height="25" fill="#d97706" opacity="0.35"/>
      <rect x="320" y="95" width="25" height="25" fill="#d97706" opacity="0.35"/>
      <rect x="240" y="130" width="25" height="25" fill="#d97706" opacity="0.25"/>
      <circle cx="300" cy="50" r="15" fill="#d97706" opacity="0.4"/>`,
  },
  analytics: {
    from: '#cffafe',
    to: '#67e8f9',
    accent: '#0891b2',
    body: `<rect x="220" y="130" width="30" height="70" fill="#0891b2" opacity="0.45"/>
      <rect x="260" y="100" width="30" height="100" fill="#0891b2" opacity="0.55"/>
      <rect x="300" y="80" width="30" height="120" fill="#0891b2" opacity="0.65"/>
      <rect x="340" y="110" width="30" height="90" fill="#0891b2" opacity="0.5"/>`,
  },
  'api-integration': {
    from: '#e0e7ff',
    to: '#a5b4fc',
    accent: '#4f46e5',
    body: `<circle cx="280" cy="120" r="25" fill="#4f46e5" opacity="0.45"/>
      <circle cx="220" cy="80" r="18" fill="#fff" opacity="0.6" stroke="#4f46e5" stroke-width="2"/>
      <circle cx="360" cy="80" r="18" fill="#fff" opacity="0.6" stroke="#4f46e5" stroke-width="2"/>
      <circle cx="360" cy="170" r="18" fill="#fff" opacity="0.6" stroke="#4f46e5" stroke-width="2"/>
      <line x1="238" y1="92" x2="258" y2="108" stroke="#4f46e5" stroke-width="2" opacity="0.4"/>
      <line x1="302" y1="108" x2="342" y2="92" stroke="#4f46e5" stroke-width="2" opacity="0.4"/>`,
  },
  bim: {
    from: '#ffe4e6',
    to: '#fda4af',
    accent: '#e11d48',
    body: `<path d="M220 170 L280 50 L340 170 Z" fill="#fff" opacity="0.4" stroke="#e11d48" stroke-width="2"/>
      <path d="M280 50 L340 170 L400 170 L340 50 Z" fill="#e11d48" opacity="0.2"/>
      <line x1="280" y1="50" x2="280" y2="170" stroke="#e11d48" stroke-width="1.5" opacity="0.4"/>
      <line x1="220" y1="170" x2="340" y2="50" stroke="#e11d48" stroke-width="1" opacity="0.3"/>`,
  },
}

mkdirSync(outDir, { recursive: true })

for (const [slug, cfg] of Object.entries(modules)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cfg.from}"/>
      <stop offset="100%" stop-color="${cfg.to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="240" fill="url(#bg)"/>
  ${cfg.body}
</svg>`
  writeFileSync(join(outDir, `${slug}.svg`), svg, 'utf8')
  console.log(`wrote ${slug}.svg`)
}

console.log(`Done: ${Object.keys(modules).length} files → ${outDir}`)
