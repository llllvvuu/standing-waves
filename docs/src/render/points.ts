import { viridis } from "scale-color-perceptual"

import { PointRenderer } from "../canvas"

export const sizeMorphRenderer: PointRenderer = (
  context,
  x,
  y,
  width,
  height,
  value,
) => {
  const multiplier = (1 + value) / 2
  const radius = (Math.min(width, height) * multiplier) / 2
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI)
  context.fill()
}

export const upAndDownRenderer: PointRenderer = (
  context,
  x,
  y,
  width,
  height,
  value,
) => {
  const radius = Math.min(width, height) / 4
  const shiftedY = y + (value * height) / 4
  context.beginPath()
  context.arc(x, shiftedY, radius, 0, 2 * Math.PI)
  context.fill()
}

/** Rainbow according to CIELAB color space. */
export const viridisRenderer: PointRenderer = (
  context,
  x,
  y,
  width,
  height,
  value,
) => {
  const radius = Math.min(width, height) / 2
  const color = viridis(value / 2 + 0.5)
  context.fillStyle = color
  context.beginPath()
  context.arc(x, y, radius, 0, 2 * Math.PI)
  context.fill()
  context.fillStyle = "#fff"
}
