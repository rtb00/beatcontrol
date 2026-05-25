import { ImageResponse } from 'next/og';

export const alt = 'BeatControl — Live Musikwünsche für eure Hochzeit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #faf6f0 0%, #f4ede0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: '#2a2520',
              color: '#c9a961',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              borderRadius: 12,
            }}
          >
            ♪
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#2a2520',
              letterSpacing: '-0.02em',
            }}
          >
            BeatControl
          </div>
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: '#2a2520',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 32,
            maxWidth: 980,
          }}
        >
          Eure Versicherung gegen Party-Flop.
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#8a7a6e',
            lineHeight: 1.4,
            maxWidth: 900,
            fontFamily: 'sans-serif',
          }}
        >
          Live-Musikwünsche für eure Hochzeit. Gäste schlagen vor, voten, der DJ sieht alles live.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 20,
            color: '#c9a961',
            fontFamily: 'sans-serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <span>beatcontrol.io</span>
          <span>Pilot-Saison 2026</span>
        </div>
      </div>
    ),
    size
  );
}
