import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(145deg, #1a0533 0%, #2d0a5e 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
          padding: '7px 7px',
        }}
      >
        <div style={{ width: 4, height: 7, background: 'rgba(167,139,250,0.6)', borderRadius: 2 }} />
        <div style={{ width: 4, height: 11, background: 'rgba(167,139,250,0.85)', borderRadius: 2 }} />
        <div style={{ width: 4, height: 16, background: '#a78bfa', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  )
}
