import { drawCenteredText } from "./text"
import { worker } from "../worker/client"
import {
  getWaveComponents,
  getSlowdown,
  setEigenvalues,
  setWaveComponents,
  WaveComponent,
  NUM_WAVES,
} from "../sidebar"
import { weightedWave } from "../util"

import type { Renderer, PointRenderer } from "../canvas"
import type { MaybeStandingWaves, StandingWave } from "../types"

const waveMap: Record<`${number}-${number}`, MaybeStandingWaves> = {}

function waveMapKey(w: number, h: number): `${number}-${number}` {
  return `${w}-${h}`
}

function loadWaves(w: number, h: number) {
  const key = waveMapKey(w, h)
  if (key in waveMap) {
    return
  }
  waveMap[key] = "loading"
  worker.postMessage({
    type: "getRectStandingWaves",
    parameters: [w, h],
  })
}

export function setWaves(w: number, h: number, waves: StandingWave[]) {
  waveMap[waveMapKey(w, h)] = waves
}

function drawRectangles(
  w: number,
  h: number,
  wave: number[],
  context: CanvasRenderingContext2D,
  renderPoint: PointRenderer,
  width: number,
  height: number,
) {
  const strideX = width / (w + 2)
  const strideY = height / (h + 2)

  for (let i = 0; i < w; ++i) {
    for (let j = 0; j < h; ++j) {
      const index = i + j * w
      renderPoint(
        context,
        (i + 1) * strideX,
        (j + 1) * strideY,
        strideX,
        strideY,
        wave[index],
      )
    }
  }
}

export function getRectangularGridRenderer(w: number, h: number): Renderer {
  return (canvasState, timestamp) => {
    const key = waveMapKey(w, h)
    if (key in waveMap) {
      const waves = waveMap[key]
      if (waves !== "loading") {
        drawRectangles(
          w,
          h,
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
      "Calculating rectangular grid eigenvectors... (~5 seconds desktop, ~10 seconds mobile)",
      canvasState.context,
      canvasState.canvas.width,
      canvasState.canvas.height,
    )
    loadWaves(w, h)
  }
}

export function setRectOmp(key: string, waveComponents: WaveComponent[]) {
  const waves = waveMap[key]
  if (waves == null) return
  console.log(waveComponents)
  setWaveComponents(waveComponents)
}

export function getClickHandler(w: number, h: number) {
  return (x: number, y: number, width: number, height: number) => {
    const key = waveMapKey(w, h)
    const waves = waveMap[key]
    const strideX = width / (w + 2)
    const strideY = height / (h + 2)
    const i = Math.round(x / strideX - 1)
    const j = Math.round(y / strideY - 1)
    const idx = i + j * w

    if (waves && waves !== "loading") {
      worker.postMessage({
        type: "getOmp",
        key,
        parameters: [waves.map((wave) => wave.eigenvector), idx, NUM_WAVES],
      })
    }
  }
}

export const grid = {
  render: getRectangularGridRenderer(30, 30),
  handleClick: getClickHandler(30, 30),
}
