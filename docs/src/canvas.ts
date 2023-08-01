import {
  getHexagonalGridRenderer,
  handleClick as handleHexClick,
} from "./render/hexagonal"
import { sizeMorphRenderer } from "./render/points"

export const INITIAL_WIDTH = 800
export const INITIAL_HEIGHT = 800

interface CanvasState {
  grid: Grid
  renderPoint: PointRenderer
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  baseTime: number
}

export type Renderer = (canvasState: CanvasState, timestamp: number) => void

interface Grid {
  render: Renderer
  handleClick: (x: number, y: number, width: number, height: number) => void
}

export type PointRenderer = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  value: number
) => void

const canvas = document.createElement("canvas")
const canvasState: CanvasState = {
  grid: {
    render: getHexagonalGridRenderer(20, 20, 20),
    handleClick: handleHexClick,
  },
  renderPoint: sizeMorphRenderer,
  canvas,
  context: canvas.getContext("2d")!,
  baseTime: 0,
}

export function initializeCanvas(container: HTMLElement) {
  const { canvas, context } = canvasState
  canvas.width = INITIAL_WIDTH
  canvas.height = INITIAL_HEIGHT
  canvas.addEventListener("click", clickHandler)
  context.strokeStyle = "#FFFFFF"
  context.fillStyle = "#FFFFFF"
  container.appendChild(canvas)
  requestFrame(performance.now())
}

export function setGrid(grid: Grid) {
  canvasState.grid = grid
}

export function setPointRenderer(pointRenderer: PointRenderer) {
  canvasState.renderPoint = pointRenderer
}

function requestFrame(timestamp: number) {
  canvasState.context.clearRect(0, 0, canvas.width, canvas.height)
  canvasState.grid.render(canvasState, timestamp - canvasState.baseTime)
  window.requestAnimationFrame(requestFrame)
}

function clickHandler(event: MouseEvent) {
  const rect = canvasState.canvas.getBoundingClientRect()

  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  const x = (event.clientX - rect.left) * scaleX
  const y = (event.clientY - rect.top) * scaleY

  canvasState.baseTime = performance.now()
  canvasState.grid.handleClick(
    x,
    y,
    canvasState.canvas.width,
    canvasState.canvas.height
  )
}
