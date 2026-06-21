import { ImageResponse } from 'next/og'

export const alt = 'TradingLog — Swing 4H'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0b0f 0%, #16181f 50%, #1c1f2a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#F8FAFC',
            letterSpacing: '-0.02em',
          }}
        >
          TradingLog
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: '#6366f1',
            fontWeight: 600,
          }}
        >
          Swing 4H Protocol
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 24,
            color: '#94A3B8',
          }}
        >
          Journal de trading professionnel · BTC · ETH · SOL · SPX · QQQ
        </div>
      </div>
    ),
    { ...size },
  )
}
