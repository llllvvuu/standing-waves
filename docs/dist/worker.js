"use strict";importScripts("../wasm/standing_waves_em.js");Module.onRuntimeInitialized=async a=>{self.hex_laplacian=Module.hex_laplacian,self.rect_laplacian=Module.rect_laplacian,self.standing_waves=Module.standing_waves,self.omp=Module.omp,self.postMessage({type:"wasmReady"})};self.onmessage=a=>{if(a.data.type==="getHexStandingWaves"){let e=self.hex_laplacian(...a.data.parameters),s=standing_waves(e,-1);self.postMessage({type:"hexStandingWaves",parameters:a.data.parameters,data:s.reverse()})}else if(a.data.type==="getRectStandingWaves"){let e=self.rect_laplacian(...a.data.parameters),s=standing_waves(e,-1);self.postMessage({type:"rectStandingWaves",parameters:a.data.parameters,data:s.reverse()})}else if(a.data.type==="getOmp"){let e=self.omp(...a.data.parameters);self.postMessage({type:"omp",key:a.data.key,data:e})}};
//# sourceMappingURL=worker.js.map