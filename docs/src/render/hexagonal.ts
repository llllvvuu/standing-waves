import { drawCenteredText } from "./text"
import { worker } from "../worker/client"
import {
  getWaveComponents,
  getSlowdown,
  setEigenvalues,
  setWaveComponents,
  type WaveComponent,
} from "../sidebar"
import { weightedWave } from "../util"

import type { Renderer, PointRenderer } from "../canvas"
import type { MaybeStandingWaves, StandingWave } from "../types"

const waveMap: Record<`${number}-${number}-${number}`, MaybeStandingWaves> = {}

function waveMapKey(
  k: number,
  m: number,
  n: number,
): `${number}-${number}-${number}` {
  return `${k}-${m}-${n}`
}

function loadWaves(k: number, m: number, n: number) {
  const key = waveMapKey(k, m, n)
  if (key in waveMap) {
    return
  }
  waveMap[key] = "loading"
  worker.postMessage({
    type: "getHexStandingWaves",
    parameters: [k, m, n],
  })
}

export function setWaves(
  k: number,
  m: number,
  n: number,
  waves: StandingWave[],
) {
  waveMap[waveMapKey(k, m, n)] = waves
}

function drawHexagons(
  k: number,
  m: number,
  n: number,
  wave: number[],
  context: CanvasRenderingContext2D,
  renderPoint: PointRenderer,
  width: number,
  height: number,
) {
  let prev_left = 0
  let prev_right = 0
  let left = m
  let right = m + 2 * (k - 1)

  const nHoriz = right + n
  const strideX = width / nHoriz
  const strideY = strideX * Math.sqrt(3)
  const offsetY = (height * (1 - Math.sqrt(3) / 2)) / 2

  let i = 0
  for (let y = 0; y < m + n - 1; y++) {
    for (let x = left; x <= right; x += 2) {
      renderPoint(
        context,
        x * strideX,
        y * strideY + offsetY,
        2 * strideX,
        2 * strideX,
        wave[i++],
      )
    }
    prev_left = left
    prev_right = right
    left = y + 1 < m ? prev_left - 1 : prev_left + 1
    right = y + 1 < n ? prev_right + 1 : prev_right - 1
  }
}

export function getHexagonalGridRenderer(
  k: number,
  m: number,
  n: number,
): Renderer {
  return (canvasState, timestamp) => {
    const key = waveMapKey(k, m, n)
    if (key in waveMap) {
      const waves = waveMap[key]
      if (waves !== "loading") {
        drawHexagons(
          k,
          m,
          n,
          weightedWave(getWaveComponents(), waves, getSlowdown(), timestamp),
          canvasState.context,
          canvasState.renderPoint,
          canvasState.canvas.width,
          canvasState.canvas.height,
        )
        setEigenvalues(waves)
        return
      }
    }
    drawCenteredText(
      "Calculating hexagonal grid eigenvectors... (~5 seconds desktop, ~10 seconds mobile)",
      canvasState.context,
      canvasState.canvas.width,
      canvasState.canvas.height,
    )
    loadWaves(k, m, n)
  }
}

export function setHexOmp(key: string, waveComponents: WaveComponent[]) {
  const waves = waveMap[key]
  if (waves == null) return
  setWaveComponents(waveComponents)
}

export function handleClick(x: number, y: number) {
  console.log("TODO: handle hex click", x, y)
}

export const grid = {
  render: getHexagonalGridRenderer(20, 20, 20),
  handleClick,
}
