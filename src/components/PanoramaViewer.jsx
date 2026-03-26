import { useRef } from 'react'
import { usePanoramaScene } from '../hooks/usePanoramaScene'

export function PanoramaViewer({ panoramaUrl }) {
  const containerRef = useRef(null)
  usePanoramaScene(containerRef, panoramaUrl)

  return (
    <div
      ref={containerRef}
      data-testid="panorama-container"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    />
  )
}