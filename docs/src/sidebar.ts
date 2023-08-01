import { grid as rectGrid } from "./render/rectangular"
import { grid as hexGrid } from "./render/hexagonal"
import {
  sizeMorphRenderer,
  upAndDownRenderer,
  viridisRenderer,
} from "./render/points"
import { setGrid, setPointRenderer } from "./canvas"

import type { StandingWave } from "./types"

export const NUM_WAVES = 40

export interface WaveComponent {
  index: number
  coefficient: number
}
const defaultWaveComponents: WaveComponent[] = Array.from(
  { length: NUM_WAVES },
  (_, i) => ({ index: i === 0 ? 77 : i - 1, coefficient: i === 0 ? 1 : 0 })
)
let waveComponents: WaveComponent[] = defaultWaveComponents
export const getWaveComponents = () => waveComponents
export function setWaveComponents (newWaveComponents: WaveComponent[]) {
  waveComponents = newWaveComponents
  for (let i = 0; i < Math.min(NUM_WAVES, waveComponents.length); i++) {
    const eigenIndexInput = document.getElementById(`eigenIndex${i}`)
    const coefficientInput = document.getElementById(`coefficient${i}`)
    if (eigenIndexInput && eigenIndexInput instanceof HTMLInputElement) {
      eigenIndexInput.value = waveComponents[i].index.toString()
    }
    if (coefficientInput && coefficientInput instanceof HTMLInputElement) {
      coefficientInput.value = waveComponents[i].coefficient.toString()
    }
  }
}

let slowdown = 200
export const getSlowdown = () => slowdown

export function mountSidebar() {
  const coefficientsDiv = document.getElementById("eigenvectorCoefficients")
  if (coefficientsDiv == null) return
  for (let i = 0; i < NUM_WAVES; i++) {
    const section = document.createElement("div")
    section.className = "section"
    section.innerHTML = `
      <label>Standing wave index:</label>
      <input type="number" id="eigenIndex${i}" min="0" max="9999" step="1" value="${
      i === 0 ? 78 : i
    }">
      <span id="eigenvalue${i}">Eigenvalue: Loading...</span>
      <label>Relative Weight:</label>
      <input type="range" id="coefficient${i}" min="0" max="1" step="0.01" value="${
      i === 0 ? 1 : 0
    }">
    `
    coefficientsDiv.appendChild(section)
    if (i < NUM_WAVES - 1) {
      const hr = document.createElement("hr")
      section.appendChild(hr)
    }
  }

  // After creating all input elements, add event listeners to them
  for (let i = 0; i < NUM_WAVES; i++) {
    const eigenIndexInput = document.getElementById(`eigenIndex${i}`)
    const coefficientInput = document.getElementById(`coefficient${i}`)

    if (eigenIndexInput && eigenIndexInput instanceof HTMLInputElement) {
      eigenIndexInput.addEventListener("input", function () {
        waveComponents[i].index = parseInt(eigenIndexInput.value) - 1
      })
    }

    if (coefficientInput && coefficientInput instanceof HTMLInputElement) {
      coefficientInput.addEventListener("input", function () {
        waveComponents[i].coefficient = parseFloat(coefficientInput.value)
      })
    }
  }

  const slowdownInput = document.getElementById("slowdown")
  if (slowdownInput && slowdownInput instanceof HTMLInputElement) {
    slowdownInput.addEventListener("input", function () {
      slowdown = parseFloat(slowdownInput.value)
    })
  }
}

export function setEigenvalues(standingWaves: StandingWave[]) {
  for (let i = 0; i < NUM_WAVES; i++) {
    const { index } = waveComponents[i]
    const wave = standingWaves[index]
    if (wave == null) continue
    const eigenvalueSpan = document.getElementById(`eigenvalue${i}`)
    if (eigenvalueSpan) {
      eigenvalueSpan.innerHTML = `Eigenvalue: ${wave.eigenvalue.toFixed(8)}`
    }

    const eigenIndexInput = document.getElementById(`eigenIndex${i}`)
    eigenIndexInput?.setAttribute("max", `${standingWaves.length}`)
  }

  const nEigenvectorsSpan = document.getElementById("nEigenvectors")
  if (nEigenvectorsSpan) {
    nEigenvectorsSpan.innerHTML = `${standingWaves.length}`
  }
}

document?.getElementById("sidebar-collapse")?.addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar")
  const sidebarCollapse = document.getElementById("sidebar-collapse")
  if (sidebar)
    sidebar.style.display = sidebar.style.display !== "block" ? "block" : "none"
  if (sidebarCollapse)
    sidebarCollapse.innerHTML =
      sidebar?.style.display !== "block" ? "Open Options" : "Close Options"
})

document?.getElementById("reset-weights")?.addEventListener("click", () => {
  setWaveComponents(defaultWaveComponents)
})

const tilingSelect = document.getElementById("tiling")
if (tilingSelect instanceof HTMLSelectElement) {
  tilingSelect.addEventListener("change", () => {
    if (tilingSelect.value === "hex") {
      setGrid(hexGrid)
    } else if (tilingSelect.value === "rect") {
      setGrid(rectGrid)
    }
  })
}

const pointStyleSelect = document.getElementById("pointStyle")
if (pointStyleSelect instanceof HTMLSelectElement) {
  pointStyleSelect.addEventListener("change", () => {
    if (pointStyleSelect.value === "morphSize") {
      setPointRenderer(sizeMorphRenderer)
    } else if (pointStyleSelect.value === "upAndDown") {
      setPointRenderer(upAndDownRenderer)
    } else if (pointStyleSelect.value === "viridis") {
      setPointRenderer(viridisRenderer)
    }
  })
}
