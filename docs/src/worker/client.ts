import { setHexOmp, setWaves as setHexWaves } from "../render/hexagonal"
import { setRectOmp, setWaves as setRectWaves } from "../render/rectangular"

export const worker = new Worker("dist/worker.js")

export function initializeWorkerListener(onLoad: () => void) {
  worker.onmessage = (e) => {
    if (e.data.type === "wasmReady") {
      worker.postMessage({
        type: "getHexStandingWaves",
        parameters: [20, 20, 20],
      })
      onLoad()
    } else if (e.data.type === "hexStandingWaves") {
      const [k, m, n] = e.data.parameters
      setHexWaves(k, m, n, e.data.data)
    } else if (e.data.type === "rectStandingWaves") {
      const [w, h] = e.data.parameters
      setRectWaves(w, h, e.data.data)
    } else if (e.data.type === "omp") {
      setRectOmp(e.data.key, e.data.data)
      setHexOmp(e.data.key, e.data.data)
    }
  }
}
