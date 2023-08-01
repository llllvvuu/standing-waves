export function drawCenteredText(
  text: string,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  size = 16,
) {
  context.textBaseline = "middle"
  context.textAlign = "center"
  context.font = `${size}px sans-serif`
  context.fillText(text, width / 2, height / 2)
}
