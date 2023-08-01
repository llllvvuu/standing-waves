import { initializeCanvas } from "./canvas"
import { mountSidebar } from "./sidebar"
import { initializeWorkerListener } from "./worker/client"

async function main() {
  const loadingDiv = document.getElementById("loading")
  if (loadingDiv) loadingDiv.innerHTML = "Loading WASM module..."
  const canvasContainer = document.getElementById("canvas-container")
  if (canvasContainer == null) throw new Error("no canvas container")
  mountSidebar()
  initializeWorkerListener(() => {
    document.getElementById("loading")?.remove()
    initializeCanvas(canvasContainer)
  })
}

if (document.readyState !== "loading") {
  main()
} else {
  document.addEventListener("DOMContentLoaded", main)
}
