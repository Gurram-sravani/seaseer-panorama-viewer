export const PANORAMAS = [
  { id: 1, label: 'Panorama 1', url: '/panoramas/panorama1.jpg' },
  { id: 2, label: 'Panorama 2', url: '/panoramas/panorama2.jpg' },
  { id: 3, label: 'Panorama 3', url: '/panoramas/panorama3.jpg' },
]

const btnStyle = {
  background: 'rgba(255,255,255,0.2)',
  border: '1px solid rgba(255,255,255,0.5)',
  color: 'white',
  padding: '6px 18px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
}

export function PanoramaNav({ currentIndex, onNavigate }) {
  return (
    <nav
      data-testid="panorama-nav"
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(0,0,0,0.65)',
        padding: '10px 28px',
        borderRadius: '10px',
        color: 'white',
        zIndex: 10,
        fontFamily: 'sans-serif',
      }}
    >
      <button
        data-testid="btn-prev"
        style={btnStyle}
        disabled={currentIndex === 0}
        onClick={() => onNavigate(currentIndex - 1)}
      >
        ← Prev
      </button>

      <span
        data-testid="panorama-label"
        style={{ minWidth: '110px', textAlign: 'center', fontSize: '15px' }}
      >
        {PANORAMAS[currentIndex].label}
      </span>

      <button
        data-testid="btn-next"
        style={btnStyle}
        disabled={currentIndex === PANORAMAS.length - 1}
        onClick={() => onNavigate(currentIndex + 1)}
      >
        Next →
      </button>
    </nav>
  )
}