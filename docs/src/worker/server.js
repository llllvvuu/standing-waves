importScripts("../wasm/standing_waves_em.js")

Module.onRuntimeInitialized = async (_) => {
  self.hex_laplacian = Module.hex_laplacian
  self.rect_laplacian = Module.rect_laplacian
  self.standing_waves = Module.standing_waves
  self.omp = Module.omp

  self.postMessage({ type: "wasmReady" })
}

self.onmessage = (e) => {
  if (e.data.type === "getHexStandingWaves") {
    const laplacian = self.hex_laplacian(...e.data.parameters)
    const waves = standing_waves(laplacian, -1)
    self.postMessage({
      type: "hexStandingWaves",
      parameters: e.data.parameters,
      data: waves.reverse(),
    })
  } else if (e.data.type === "getRectStandingWaves") {
    const laplacian = self.rect_laplacian(...e.data.parameters)
    const waves = standing_waves(laplacian, -1)
    self.postMessage({
      type: "rectStandingWaves",
      parameters: e.data.parameters,
      data: waves.reverse(),
    })
  } else if (e.data.type === "getOmp") {
    const omp = self.omp(...e.data.parameters)
    self.postMessage({
      type: "omp",
      key: e.data.key,
      data: omp,
    })
  }
}
