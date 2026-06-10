import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(145deg, #1a0533 0%, #2d0a5e 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 14,
          padding: '40px 38px',
        }}
      >
        <div style={{ width: 22, height: 40, background: 'rgba(167,139,250,0.6)', borderRadius: 6 }} />
        <div style={{ width: 22, height: 62, background: 'rgba(167,139,250,0.85)', borderRadius: 6 }} />
        <div style={{ width: 22, height: 90, background: '#a78bfa', borderRadius: 6 }} />
      </div>
    ),
    { ...size }
  )
}
