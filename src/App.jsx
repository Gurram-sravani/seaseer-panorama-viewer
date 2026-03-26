import { useState } from 'react'
import { PanoramaViewer } from './components/PanoramaViewer'
import { PanoramaNav, PANORAMAS } from './components/PanoramaNav'

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)

  function handleNavigate(index) {
    if (index >= 0 && index < PANORAMAS.length) {
      setCurrentIndex(index)
    }
  }

  return (
    <>
      <PanoramaViewer panoramaUrl={PANORAMAS[currentIndex].url} />
      <PanoramaNav currentIndex={currentIndex} onNavigate={handleNavigate} />
    </>
  )
}