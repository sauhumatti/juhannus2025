import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Saku 30v - Syntymäpäivä & Valmistujaisjuhlat'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 'bold',
            marginBottom: 20,
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          30
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          SAKU
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.9,
          }}
        >
          🎉 Syntymäpäivä & Valmistujaisjuhlat 🎓
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}