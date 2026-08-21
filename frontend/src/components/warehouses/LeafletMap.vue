<script setup lang="ts">
/**
 * @description Reusable Leaflet map with canvas-based comet arcs animating along curved Bezier routes.
 */

// external imports
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

interface MapMarker {
  id: string
  label: string
  lat: number
  lng: number
  popupHtml?: string
}

export interface MapRoute {
  fromId: string
  toId: string
}

interface Props {
  markers: MapMarker[]
  routes?: MapRoute[]
  zoom?: number
  center?: [number, number]
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 4,
  center: () => [39.5, -98.35] as [number, number],
  routes: () => [],
})

interface Pt {
  x: number
  y: number
}

interface Particle {
  routeIndex: number
  t: number
  speed: number
}

const mapContainer = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null
let animFrameId: number | null = null
const particles: Particle[] = []

const TEAL_ICON = L.divIcon({
  className: 'leaflet-marker-custom',
  html: '<span class="material-symbols-outlined" style="font-size:28px;color:#2dd4bf;">location_on</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// ─── Bezier helpers ────────────────────────────────────────────────────────

function bezierPt(t: number, p0: Pt, ctrl: Pt, p2: Pt): Pt {
  const inverseT = 1 - t
  return {
    x: inverseT * inverseT * p0.x + 2 * inverseT * t * ctrl.x + t * t * p2.x,
    y: inverseT * inverseT * p0.y + 2 * inverseT * t * ctrl.y + t * t * p2.y,
  }
}

/** Control point that makes the arc bow gracefully between two screen points. */
function arcCtrl(p0: Pt, p2: Pt): Pt {
  const midpointX = (p0.x + p2.x) / 2
  const midpointY = (p0.y + p2.y) / 2
  const deltaX = p2.x - p0.x
  const deltaY = p2.y - p0.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1
  const lift = Math.min(distance * 0.4, 140)
  // Perpendicular that consistently bows the arc upward on screen
  return { x: midpointX + (deltaY / distance) * lift, y: midpointY - (deltaX / distance) * lift }
}

// ─── Particle system ───────────────────────────────────────────────────────

function buildParticles(): void {
  particles.length = 0
  const routes = props.routes ?? []
  routes.forEach((_, i) => {
    // 3 comets per route, staggered and with slightly different speeds
    for (let j = 0; j < 3; j++) {
      particles.push({
        routeIndex: i,
        t: j / 3,
        speed: 0.0022 + j * 0.0005,
      })
    }
  })
}

// ─── Canvas sizing ─────────────────────────────────────────────────────────

function syncCanvasSize(): void {
  const canvas = canvasRef.value
  const container = mapContainer.value
  if (!canvas || !container) return
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
}

// ─── Main animation loop ───────────────────────────────────────────────────

function drawFrame(): void {
  animFrameId = requestAnimationFrame(drawFrame)

  const canvas = canvasRef.value
  if (!canvas || !map) return
  const canvasContext = canvas.getContext('2d')
  if (!canvasContext) return

  const routes = props.routes ?? []
  canvasContext.clearRect(0, 0, canvas.width, canvas.height)
  if (routes.length === 0) return

  const coordMap = new Map(props.markers.map((m) => [m.id, L.latLng(m.lat, m.lng)]))

  // Pre-compute pixel arcs for this frame (coordinates change on pan/zoom)
  type Arc = { p0: Pt; ctrl: Pt; p2: Pt }
  const arcs: Array<Arc | null> = routes.map((route) => {
    const from = coordMap.get(route.fromId)
    const to = coordMap.get(route.toId)
    if (!from || !to) return null
    const p0 = map!.latLngToContainerPoint(from) as Pt
    const p2 = map!.latLngToContainerPoint(to) as Pt
    return { p0, ctrl: arcCtrl(p0, p2), p2 }
  })

  // 1. Ghost arc baselines
  for (const routeArc of arcs) {
    if (!routeArc) continue
    canvasContext.beginPath()
    canvasContext.moveTo(routeArc.p0.x, routeArc.p0.y)
    canvasContext.quadraticCurveTo(routeArc.ctrl.x, routeArc.ctrl.y, routeArc.p2.x, routeArc.p2.y)
    canvasContext.strokeStyle = 'rgba(45, 212, 191, 0.10)'
    canvasContext.lineWidth = 1.5
    canvasContext.setLineDash([])
    canvasContext.stroke()
  }

  // 2. Comet particles
  const TRAIL_STEPS = 30
  const TRAIL_LEN = 0.13

  for (const p of particles) {
    const routeArc = arcs[p.routeIndex]
    if (!routeArc) continue

    // Advance position
    p.t = (p.t + p.speed) % 1

    // Trail — gradient orbs fading behind the head
    for (let i = 0; i < TRAIL_STEPS; i++) {
      const ti = p.t - TRAIL_LEN * (1 - i / TRAIL_STEPS)
      const tw = ((ti % 1) + 1) % 1
      const ratio = i / TRAIL_STEPS
      const bezierPoint = bezierPt(tw, routeArc.p0, routeArc.ctrl, routeArc.p2)

      const r = 1 + ratio * 4
      const alpha = ratio * ratio * 0.8
      const radialGradient = canvasContext.createRadialGradient(bezierPoint.x, bezierPoint.y, 0, bezierPoint.x, bezierPoint.y, r * 2.2)
      radialGradient.addColorStop(0, `rgba(45, 212, 191, ${alpha})`)
      radialGradient.addColorStop(1, 'rgba(45, 212, 191, 0)')
      canvasContext.beginPath()
      canvasContext.arc(bezierPoint.x, bezierPoint.y, r * 2.2, 0, Math.PI * 2)
      canvasContext.fillStyle = radialGradient
      canvasContext.fill()
    }

    // Comet head — bright glowing nucleus
    const head = bezierPt(p.t, routeArc.p0, routeArc.ctrl, routeArc.p2)
    const headGradient = canvasContext.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9)
    headGradient.addColorStop(0, 'rgba(255, 255, 255, 1.00)')
    headGradient.addColorStop(0.2, 'rgba(200, 255, 248, 0.95)')
    headGradient.addColorStop(0.55, 'rgba(45,  212, 191, 0.70)')
    headGradient.addColorStop(1, 'rgba(45,  212, 191, 0.00)')
    canvasContext.beginPath()
    canvasContext.arc(head.x, head.y, 9, 0, Math.PI * 2)
    canvasContext.fillStyle = headGradient
    canvasContext.fill()
  }
}

// ─── Markers ───────────────────────────────────────────────────────────────

function renderMarkers(): void {
  if (!map) return
  if (markerLayer) markerLayer.clearLayers()
  else markerLayer = L.layerGroup().addTo(map)

  for (const m of props.markers) {
    const marker = L.marker([m.lat, m.lng], { icon: TEAL_ICON })
    if (m.popupHtml) {
      marker.bindPopup(m.popupHtml, {
        className: 'leaflet-popup-dark',
        closeButton: false,
      })
    }
    markerLayer.addLayer(marker)
  }

  if (props.markers.length > 0) {
    const bounds = L.latLngBounds(props.markers.map((m) => [m.lat, m.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 })
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: true,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)

  syncCanvasSize()
  window.addEventListener('resize', syncCanvasSize)

  buildParticles()
  renderMarkers()
  drawFrame()
})

watch(
  () => props.markers,
  () => {
    buildParticles()
    renderMarkers()
  },
  { deep: true },
)
watch(
  () => props.routes,
  () => {
    buildParticles()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncCanvasSize)
  if (animFrameId !== null) cancelAnimationFrame(animFrameId)
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="relative w-full h-full rounded-xl overflow-hidden">
    <div ref="mapContainer" class="w-full h-full"></div>
    <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none z-[400]"></canvas>
  </div>
</template>

<style>
/* Global Leaflet popup dark theme overrides */
.leaflet-popup-dark .leaflet-popup-content-wrapper {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #e6edf3;
  font-size: 13px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.leaflet-popup-dark .leaflet-popup-tip {
  background: #161b22;
  border: 1px solid #30363d;
}

.leaflet-marker-custom {
  background: none !important;
  border: none !important;
}
</style>
