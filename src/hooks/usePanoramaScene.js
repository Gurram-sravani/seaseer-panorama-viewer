import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function usePanoramaScene(containerRef, panoramaUrl) {
  const rendererRef = useRef(null)
  const cameraRef   = useRef(null)
  const sphereRef   = useRef(null)
  const sceneRef    = useRef(null)
  const isDragging  = useRef(false)
  const prevMouse   = useRef({ x: 0, y: 0 })
  const rotation    = useRef({ x: 0, y: 0 })

  // ── Initialize scene once on mount ──────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Inverse sphere: scale(-1,1,1) makes camera see the inside surface
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) 
    const material = new THREE.MeshBasicMaterial({ color: 0x111111 })
    const sphere   = new THREE.Mesh(geometry, material)
    scene.add(sphere)
    sphereRef.current = sphere

    // ── Hover hotspot (Benedikt's hint) ──────────────────────────
    const hotspotGeo = new THREE.RingGeometry(3, 7, 32)
    const hotspotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    })
    const hotspot = new THREE.Mesh(hotspotGeo, hotspotMat)
    hotspot.position.set(0, -15, -490) 
    hotspot.lookAt(0, 0, 0)
    scene.add(hotspot)

    const raycaster = new THREE.Raycaster()
    const mouse2D   = new THREE.Vector2()

    function onHoverMove(e) {
      if (!cameraRef.current) return
      const rect = container.getBoundingClientRect()
      mouse2D.x =  ((e.clientX - rect.left) / container.clientWidth)  * 2 - 1
      mouse2D.y = -((e.clientY - rect.top)  / container.clientHeight) * 2 + 1
      raycaster.setFromCamera(mouse2D, cameraRef.current)
      const hits = raycaster.intersectObject(hotspot)
      hotspotMat.opacity        = hits.length > 0 ? 0.85 : 0
      container.style.cursor    = hits.length > 0 ? 'pointer' : 'grab'
    }

    container.addEventListener('mousemove', onHoverMove)

    let animId
    function animate() {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('mousemove', onHoverMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [containerRef])

  // ── Load texture when panoramaUrl changes ────────────────────────
  useEffect(() => {
    if (!sphereRef.current || !panoramaUrl) return
    const oldMaterial = sphereRef.current.material
    new THREE.TextureLoader().load(
      panoramaUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        sphereRef.current.material = new THREE.MeshBasicMaterial({
          map: texture
        })
        if (oldMaterial) oldMaterial.dispose() 
      },
      undefined,
      (err) => console.error('Texture load error:', err)
    )
  }, [panoramaUrl])

  // ── Mouse drag: look around ───────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function onDown(e) {
      isDragging.current = true
      prevMouse.current  = { x: e.clientX, y: e.clientY }
    }

    function onMove(e) {
      if (!isDragging.current || !cameraRef.current) return
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y

      rotation.current.y -= dx * 0.003
      rotation.current.x -= dy * 0.003
      rotation.current.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, rotation.current.x))

      cameraRef.current.rotation.order = 'YXZ'
      cameraRef.current.rotation.x     = rotation.current.x
      cameraRef.current.rotation.y     = rotation.current.y
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }

    function onUp() { isDragging.current = false }

    container.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      container.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [containerRef])
}